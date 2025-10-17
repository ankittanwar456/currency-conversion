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

export default function Home() {
  const { toast } = useToast();
  const [amount, setAmount] = useState('1');
  const [baseCurrency, setBaseCurrency] = usePersistentState('baseCurrency', 'USD');
  const [displayedCurrencies, setDisplayedCurrencies] = usePersistentState<string[]>('displayedCurrencies', DEFAULT_CURRENCIES);
  
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  };

  const handleSettingsSave = (newCurrencies: string[]) => {
    setDisplayedCurrencies(newCurrencies.filter(c => c && c !== baseCurrency));
    setIsSettingsOpen(false);
  };
  
  const handleRefresh = () => {
    loadRates(baseCurrency);
  };

  const currencyInfo = useMemo(() => {
    return allCurrencies.reduce((acc, curr) => {
      acc[curr.code] = curr.name;
      return acc;
    }, {} as Record<string, string>);
  }, [allCurrencies]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground max-w-md mx-auto">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-primary">Neo Convert</h1>
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
            amount={amount}
            rates={rates}
            currencyInfo={currencyInfo}
            displayedCurrencies={displayedCurrencies}
            loading={loading}
          />
        )}
      </main>

      <footer className="mt-auto">
        <Calculator onInput={setAmount} value={amount} />
      </footer>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        allCurrencies={allCurrencies}
        selectedCurrencies={[...displayedCurrencies, baseCurrency]}
        onSave={handleSettingsSave}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
