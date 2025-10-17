
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Calculator from '@/components/calculator';
import SettingsDialog from '@/components/settings-dialog';
import CurrencyExchange from '@/components/currency-exchange';
import usePersistentState from '@/hooks/use-persistent-state';
import type { Currency, Rates } from '@/lib/currencies';
import { fetchCurrencies, fetchRates } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_CURRENCIES = ['EUR', 'JPY', 'GBP', 'AUD'];

function evaluateExpression(expression: string): string {
  try {
    // Sanitize the expression to prevent security risks and handle percentage
    const sanitizedExpression = expression
      .replace(/[^-()\d/*+.]/g, '');
    
    // Using Function constructor is safer than eval, but still needs caution
    const result = new Function('return ' + sanitizedExpression)();

    if (isNaN(result) || !isFinite(result)) {
      return 'Error';
    }
    // Limit to a reasonable number of decimal places
    return String(parseFloat(result.toFixed(10)));
  } catch (error) {
    return 'Error';
  }
}


export default function Home() {
  const { toast } = useToast();
  const [amount, setAmount] = useState('1');
  const [baseCurrency, setBaseCurrency] = usePersistentState('baseCurrency', 'USD');
  const [displayedCurrencies, setDisplayedCurrencies] = usePersistentState<string[]>('displayedCurrencies', DEFAULT_CURRENCIES);
  
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);


  const loadRates = useCallback(async (base: string) => {
    try {
      setLoading(true);
      const fetchedRates = await fetchRates(base);
      setRates(fetchedRates);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load exchange rates. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const currencies = await fetchCurrencies();
        setAllCurrencies(currencies);
        await loadRates(baseCurrency);
      } catch (error) {
        console.error('Failed to fetch currencies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load currency list.",
        });
      }
    }
    loadInitialData();
  }, [baseCurrency, loadRates, toast]);

  const handleBaseCurrencyChange = (newBase: string) => {
    const oldBase = baseCurrency;
    setBaseCurrency(newBase);
    setDisplayedCurrencies(prev => {
      const newDisplayed = prev.filter(c => c !== newBase);
      if (!newDisplayed.includes(oldBase) && oldBase !== newBase) {
         const oldBaseIndex = displayedCurrencies.indexOf(newBase);
         if (oldBaseIndex !== -1) {
            newDisplayed.splice(oldBaseIndex, 0, oldBase);
         } else {
            newDisplayed.push(oldBase);
         }
      }
      return newDisplayed.slice(0, 4);
    });
    setAmount('1');
    setShowResult(false);
  };

  const handleSettingsSave = (newCurrencies: string[]) => {
    const finalSelection = newCurrencies.filter(c => c && c !== 'none');
    setDisplayedCurrencies(finalSelection);
  };
  
  const handleRefresh = () => {
    loadRates(baseCurrency);
  };
  
  const handleCalculatorInput = (key: string) => {
    if (showResult && /[\d.]/.test(key)) {
      setAmount(key);
      setShowResult(false);
      return;
    }

    setShowResult(false);
    const lastChar = amount.slice(-1);
    const isOperator = (char: string) => ['+', '-', '*', '/'].includes(char);

    if (key === 'backspace') {
      if (amount.length > 1) {
        setAmount(amount.slice(0, -1));
      } else {
        setAmount('0');
      }
    } else if (key === 'C') {
        setAmount('0');
    } else if (key === '%') {
        setAmount(prev => String(parseFloat(prev) / 100));
        setShowResult(true);
    } else if (isOperator(key)) {
        if (!isOperator(lastChar) && lastChar !== '.') {
            setAmount(amount + key);
        } else if (isOperator(lastChar)) {
            setAmount(amount.slice(0, -1) + key);
        }
    } else if (key === '.') {
      const parts = amount.split(/[+\-*/]/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('.')) {
        setAmount(amount + '.');
      }
    } else { // It's a number
      if (amount === '0') {
        setAmount(key);
      } else {
        setAmount(amount + key);
      }
    }
  };

  const handleEquals = () => {
    const result = evaluateExpression(amount);
    setAmount(result);
    setShowResult(true);
  }

  const calculatedAmount = useMemo(() => {
    if (showResult) {
      return amount;
    }
    if (/[+\-*/]/.test(amount) && !/e[+\-]/i.test(amount)) {
      const lastChar = amount[amount.length - 1];
      if (/[+\-*/.]/.test(lastChar)) {
        // Don't evaluate if the expression is incomplete
        return '...';
      }
      return evaluateExpression(amount);
    }
    return amount;
  }, [amount, showResult]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground max-w-md mx-auto">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-primary">Currency Convert</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh rates">
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4">
        {loading && !rates ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading currencies...</p>
          </div>
        ) : (
          <CurrencyExchange
            baseCurrency={baseCurrency}
            setBaseCurrency={handleBaseCurrencyChange}
            amount={calculatedAmount}
            displayAmount={amount}
            rates={rates}
            currencyInfo={allCurrencies.reduce((acc, curr) => {
              acc[curr.code] = curr.name;
              return acc;
            }, {} as Record<string, string>)}
            displayedCurrencies={displayedCurrencies}
            loading={loading}
            showResult={showResult}
          />
        )}
      </main>

      <footer className="mt-auto">
        <Calculator onInput={handleCalculatorInput} onEquals={handleEquals} value={amount} />
      </footer>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        allCurrencies={allCurrencies}
        selectedCurrencies={displayedCurrencies}
        onSave={handleSettingsSave}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
