
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Calculator from '@/components/calculator';
import CurrencyExchange from '@/components/currency-exchange';
import usePersistentState from '@/hooks/use-persistent-state';
import type { Currency, Rates } from '@/lib/currencies';
import { fetchCurrencies, fetchRates } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';
import CurrencySelection from '@/components/currency-selection';

const DEFAULT_CURRENCIES = ['EUR', 'JPY', 'GBP', 'AUD'];

function evaluateExpression(expression: string): string {
  try {
    const sanitizedExpression = expression
      .replace(/[^-()\d/*+.]/g, '');
    
    const result = new Function('return ' + sanitizedExpression)();

    if (isNaN(result) || !isFinite(result)) {
      return 'Error';
    }
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
  const [showResult, setShowResult] = useState(false);
  const [selectingCurrencyIndex, setSelectingCurrencyIndex] = useState<number | null>(null);
  const [isAddingCurrency, setIsAddingCurrency] = useState(false);


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
    console.log('[Page] Change base currency requested', { newBase, oldBase: baseCurrency });
    const oldBase = baseCurrency;
    setBaseCurrency(newBase);
    setDisplayedCurrencies(prev => {
      console.log('[Page] Updating displayed currencies after base change', { prev, newBase, oldBase });
      const newDisplayed = prev.filter(c => c !== newBase);
      if (!newDisplayed.includes(oldBase) && oldBase !== newBase) {
         const oldBaseIndex = displayedCurrencies.indexOf(newBase);
         if (oldBaseIndex !== -1) {
            newDisplayed.splice(oldBaseIndex, 0, oldBase);
         } else {
            newDisplayed.push(oldBase);
         }
      }
      console.log('[Page] New displayed after base change', newDisplayed);
      return newDisplayed;
    });
    setAmount('1');
    setShowResult(false);
  };

  const handleCurrencySelection = (newCurrency: string | null) => {
    console.log('[Page] handleCurrencySelection called', {
      newCurrency,
      isAddingCurrency,
      selectingCurrencyIndex,
      baseCurrency,
      displayedCurrencies,
    });
    // Prevent selecting base currency anywhere
    if (newCurrency && baseCurrency === newCurrency) {
      toast({
        variant: "destructive",
        title: "Duplicate Currency",
        description: `${newCurrency} is already displayed as base.`,
      });
      console.log('[Page] Selection blocked: tried to select base currency');
      return;
    }

    if (isAddingCurrency) {
      // Adding a new currency: disallow duplicates
      if (newCurrency) {
        if (displayedCurrencies.includes(newCurrency)) {
          toast({
            variant: "destructive",
            title: "Duplicate Currency",
            description: `${newCurrency} is already displayed.`,
          });
          console.log('[Page] Add blocked: duplicate currency', { newCurrency });
          return;
        }
        const next = [...displayedCurrencies, newCurrency];
        console.log('[Page] Adding new currency', { newCurrency, next });
        setDisplayedCurrencies(next);
      }
    } else if (selectingCurrencyIndex !== null) {
      // Editing an existing slot
      const newDisplayedCurrencies = [...displayedCurrencies];
      if (newCurrency) {
        const existingIndex = displayedCurrencies.indexOf(newCurrency);
        if (existingIndex !== -1 && existingIndex !== selectingCurrencyIndex) {
          // Swap with the existing currency to avoid duplicates
          const tmp = newDisplayedCurrencies[selectingCurrencyIndex];
          newDisplayedCurrencies[selectingCurrencyIndex] = newDisplayedCurrencies[existingIndex];
          newDisplayedCurrencies[existingIndex] = tmp;
          console.log('[Page] Swapped currencies', { selectingCurrencyIndex, existingIndex, result: newDisplayedCurrencies });
        } else {
          newDisplayedCurrencies[selectingCurrencyIndex] = newCurrency;
          console.log('[Page] Replaced currency in slot', { selectingCurrencyIndex, newCurrency, result: newDisplayedCurrencies });
        }
      } else {
        // Disable this slot only if more than 3 remain
        if (displayedCurrencies.length > 3) {
          newDisplayedCurrencies.splice(selectingCurrencyIndex, 1);
          console.log('[Page] Disabled currency slot', { selectingCurrencyIndex, result: newDisplayedCurrencies });
        } else {
          toast({
            variant: "destructive",
            title: "Cannot Disable",
            description: "You must have at least 3 currencies displayed.",
          });
          console.log('[Page] Disable blocked: minimum slots');
          return; // Don't close the selection
        }
      }
      setDisplayedCurrencies(newDisplayedCurrencies);
    }

    console.log('[Page] Closing selection overlay');
    setSelectingCurrencyIndex(null);
    setIsAddingCurrency(false);
  };
  
  const handleRefresh = () => {
    loadRates(baseCurrency);
  };

  const handleCurrencyRowClick = (index: number) => {
    console.log('[Page] Currency row clicked (open selection)', { index, currency: displayedCurrencies[index] });
    setSelectingCurrencyIndex(index);
    setIsAddingCurrency(false);
  }

  const handleAddCurrencyClick = () => {
    console.log('[Page] Add Currency clicked (open selection)');
    setIsAddingCurrency(true);
    setSelectingCurrencyIndex(null); 
  }
  
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
        return '...';
      }
      return evaluateExpression(amount);
    }
    return amount;
  }, [amount, showResult]);

  if (selectingCurrencyIndex !== null || isAddingCurrency) {
    return (
      <CurrencySelection
        allCurrencies={allCurrencies}
        displayedCurrencies={displayedCurrencies}
        baseCurrency={baseCurrency}
        onSelect={handleCurrencySelection}
        onCancel={() => {
          setSelectingCurrencyIndex(null);
          setIsAddingCurrency(false);
        }}
        isAdding={isAddingCurrency}
        editingIndex={selectingCurrencyIndex}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground max-w-md mx-auto">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-primary">Currency Convert</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh rates">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4">
        {loading && !rates ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading currencies...</p>
          </div>
        ) : (
          <>
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
              onCurrencyRowClick={handleCurrencyRowClick}
            />
            <div className="my-4">
                <Button variant="outline" className="w-full h-12" onClick={handleAddCurrencyClick}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Currency
                </Button>
            </div>
          </>
        )}
      </main>

      <footer className="mt-auto">
        <Calculator onInput={handleCalculatorInput} onEquals={handleEquals} value={amount} />
      </footer>
    </div>
  );
}

    
