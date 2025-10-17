'use client';

import type { Rates } from '@/lib/currencies';
import CurrencyRow from './currency-row';
import { Skeleton } from './ui/skeleton';

interface CurrencyExchangeProps {
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  amount: string;
  displayAmount: string;
  rates: Rates | null;
  currencyInfo: Record<string, string>;
  displayedCurrencies: string[];
  loading: boolean;
  showResult: boolean;
}

const CurrencyExchange = ({
  baseCurrency,
  setBaseCurrency,
  amount,
  displayAmount,
  rates,
  currencyInfo,
  displayedCurrencies,
  loading,
  showResult,
}: CurrencyExchangeProps) => {
  const numericAmount = parseFloat(amount) || 0;

  const renderCurrencyRow = (code: string, isBase = false) => {
    const value = isBase ? numericAmount : (rates ? numericAmount * (rates[code.toLowerCase()] || 0) : 0);
    const displayValue = isBase ? displayAmount : value;
    
    return (
      <CurrencyRow
        key={code}
        code={code}
        name={currencyInfo[code.toLowerCase()] || ''}
        value={displayValue}
        isBase={isBase}
        onClick={!isBase ? () => setBaseCurrency(code) : undefined}
        showResult={isBase && showResult}
      />
    );
  };
  
  const renderSkeletonRow = (key: number) => (
    <div key={key} className="flex items-center justify-between p-3 my-1.5 rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
      </div>
      <Skeleton className="h-6 w-28" />
    </div>
  );


  return (
    <div className="flex flex-col gap-2">
      {renderCurrencyRow(baseCurrency, true)}
      <hr className="border-border my-2" />
      {loading && rates === null
        ? Array.from({ length: 4 }).map((_, i) => renderSkeletonRow(i))
        : displayedCurrencies
            .filter(c => c !== baseCurrency)
            .slice(0,4)
            .map(code => renderCurrencyRow(code))}
    </div>
  );
};

export default CurrencyExchange;
