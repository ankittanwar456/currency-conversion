'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, PlusCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import { Button } from '@/components/ui/button';
import Calculator from '@/components/calculator';
import CurrencyExchange from '@/components/currency-exchange';
import usePersistentState from '@/hooks/use-persistent-state';
import type { Currency, Rates } from '@/lib/currencies';
import { fetchCurrencies, fetchRates } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';
import CurrencySelection from '@/components/currency-selection';

const DEFAULT_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'AUD'];

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
        // Ensure base currency is in the list on first load
        if (!displayedCurrencies.includes(baseCurrency)) {
            setDisplayedCurrencies(prev => [baseCurrency, ...prev.filter(c => c !== baseCurrency)]);
        }
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
  }, []);
  
  useEffect(() => {
      loadRates(baseCurrency);
  },[baseCurrency, loadRates])


  const handleBaseCurrencyChange = (newBase: string) => {
    setBaseCurrency(newBase);
    setAmount('1');
    setShowResult(false);
  };
  
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(displayedCurrencies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDisplayedCurrencies(items);
  };

  const handleCurrencySelection = (newCurrency: string | null) => {
    if (isAddingCurrency) {
      if (newCurrency) {
        if (displayedCurrencies.includes(newCurrency)) {
          toast({
            variant: "destructive",
            title: "Duplicate Currency",
            description: `${newCurrency} is already displayed.`,
          });
          return;
        }
        setDisplayedCurrencies(prev => [...prev, newCurrency]);
      }
    } else if (selectingCurrencyIndex !== null) {
      const newDisplayedCurrencies = [...displayedCurrencies];
      if (newCurrency) {
        if (displayedCurrencies.includes(newCurrency) && newCurrency !== displayedCurrencies[selectingCurrencyIndex]) {
           toast({
            variant: "destructive",
            title: "Duplicate Currency",
            description: `${newCurrency} is already displayed.`,
          });
          return;
        }
        newDisplayedCurrencies[selectingCurrencyIndex] = newCurrency;

        // If we changed the base currency, update it
        if (baseCurrency === displayedCurrencies[selectingCurrencyIndex]) {
            setBaseCurrency(newCurrency);
        }

      } else {
        if (displayedCurrencies.length > 1) {
           // If removing the base currency, set a new base
           if (baseCurrency === newDisplayedCurrencies[selectingCurrencyIndex]) {
             const newBase = newDisplayedCurrencies.find(c => c !== baseCurrency);
             if (newBase) setBaseCurrency(newBase);
           }
           newDisplayedCurrencies.splice(selectingCurrencyIndex, 1);
        } else {
          toast({
            variant: "destructive",
            title: "Cannot Disable",
            description: "You must have at least 1 currency displayed.",
          });
          return; 
        }
      }
      setDisplayedCurrencies(newDisplayedCurrencies);
    }
    setSelectingCurrencyIndex(null);
    setIsAddingCurrency(false);
  };
  
  const handleRefresh = () => {
    loadRates(baseCurrency);
  };

  const handleCurrencyRowClick = (index: number) => {
    setSelectingCurrencyIndex(index);
    setIsAddingCurrency(false);
  }

  const handleAddCurrencyClick = () => {
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
        baseCurrency={''} // No concept of a fixed base currency in this view
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
      <header className="flex items-center justify-between px-4 py-2">
        <h1 className="text-xl font-bold text-primary">Currency Convert</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleAddCurrencyClick} aria-label="Add currency">
            <PlusCircle className="h-5 w-5" />
          </Button>
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
          <DragDropContext onDragEnd={handleOnDragEnd}>
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
          </DragDropContext>
        )}
      </main>

      <footer className="mt-auto">
        <Calculator onInput={handleCalculatorInput} onEquals={handleEquals} value={amount} />
      </footer>
    </div>
  );
}