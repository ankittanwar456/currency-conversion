
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFlagUrl, type Currency } from '@/lib/currencies';
import { cn } from '@/lib/utils';

interface CurrencySelectionProps {
  allCurrencies: Currency[];
  displayedCurrencies: string[];
  baseCurrency: string;
  onSelect: (currencyCode: string | null) => void;
  onCancel: () => void;
  isAdding: boolean;
  editingIndex: number | null;
}

export default function CurrencySelection({
  allCurrencies,
  displayedCurrencies,
  baseCurrency,
  onSelect,
  onCancel,
  isAdding,
  editingIndex,
}: CurrencySelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = allCurrencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let disabledCurrencies = new Set<string>();
  if (isAdding) {
    disabledCurrencies = new Set([baseCurrency, ...displayedCurrencies]);
  } else if (editingIndex !== null) {
    const current = displayedCurrencies[editingIndex];
    disabledCurrencies = new Set([baseCurrency, ...displayedCurrencies.filter(c => c !== current)]);
  } else {
    disabledCurrencies = new Set([baseCurrency, ...displayedCurrencies]);
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col h-screen max-h-screen max-w-md mx-auto">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold text-primary">Select Currency</h2>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancel">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search currency..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-grow">
        <div className="flex flex-col gap-1 p-4 pt-0">
           {!isAdding && (
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => onSelect(null)}
            >
              <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <X className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                      <p className="font-bold text-lg">Disable</p>
                      <p className="text-sm text-muted-foreground">Remove this currency slot</p>
                  </div>
              </div>
            </Button>
           )}
          {filteredCurrencies.map((currency) => {
            const isDisabled = disabledCurrencies.has(currency.code);
            return (
              <Button
                key={currency.code}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-3",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  if (!isDisabled) {
                    onSelect(currency.code)
                  }
                }}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={getFlagUrl(currency.code)}
                    alt={`${currency.code} flag`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover bg-muted"
                    onError={(e) => { e.currentTarget.src = `https://flagsapi.com/US/flat/64.png`; e.currentTarget.style.backgroundColor = 'transparent' }}
                  />
                  <div className='text-left'>
                    <p className="font-bold text-lg">{currency.code}</p>
                    <p className="text-sm text-muted-foreground">{currency.name}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
