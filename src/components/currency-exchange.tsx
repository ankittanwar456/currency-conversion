
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
  onCurrencyRowClick: (index: number) => void;
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
  onCurrencyRowClick,
}: CurrencyExchangeProps) => {
  const numericAmount = parseFloat(amount) || 0;

  const renderCurrencyRow = (code: string, index: number, isBase = false) => {
    const value = isBase ? numericAmount : (rates ? numericAmount * (rates[code.toLowerCase()] || 0) : 0);
    const displayValue = isBase ? displayAmount : value;
    
    return (
      <CurrencyRow
        key={code}
        code={code}
        name={currencyInfo[code.toLowerCase()] || ''}
        value={displayValue}
        isBase={isBase}
        onClick={isBase ? () => {} : () => onCurrencyRowClick(index)}
        showResult={isBase && showResult}
      />
    );
  };
  
  const renderSkeletonRow = (key: number) => (
    <div key={key} className="flex items-center justify-between p-2 my-1 rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-3 w-20 mt-1" />
        </div>
      </div>
      <Skeleton className="h-5 w-24" />
    </div>
  );


  return (
    <div className="flex flex-col gap-1">
      {renderCurrencyRow(baseCurrency, -1, true)}
      <hr className="border-border my-1" />
      {loading && rates === null
        ? Array.from({ length: displayedCurrencies.length || 4 }).map((_, i) => renderSkeletonRow(i))
        : displayedCurrencies
            .filter(c => c !== baseCurrency)
            .map((code, index) => renderCurrencyRow(code, index))}
    </div>
  );
};

export default CurrencyExchange;

    