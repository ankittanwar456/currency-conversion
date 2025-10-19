
'use client';

import type { Rates } from '@/lib/currencies';
import CurrencyRow from './currency-row';
import { Skeleton } from './ui/skeleton';
import { Droppable, Draggable } from 'react-beautiful-dnd';

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

  const renderCurrencyRow = (code: string, index: number) => {
    const isBase = code === baseCurrency;
    const value = isBase ? numericAmount : (rates ? numericAmount * (rates[code.toLowerCase()] || 0) : 0);
    const displayValue = isBase ? displayAmount : value;
    
    return (
      <Draggable key={code} draggableId={code} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              userSelect: 'none', // Prevent text selection while dragging
            }}
          >
            <CurrencyRow
              code={code}
              name={currencyInfo[code.toLowerCase()] || ''}
              value={displayValue}
              isBase={isBase}
              onChangeClick={() => onCurrencyRowClick(index)}
              onSelectClick={() => setBaseCurrency(code)}
              showResult={isBase && showResult}
              isDragging={snapshot.isDragging}
            />
          </div>
        )}
      </Draggable>
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
    <Droppable droppableId="currencies" isDropDisabled={false}>
      {(provided) => (
        <div 
          className="flex flex-col gap-0"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {loading && rates === null
            ? Array.from({ length: displayedCurrencies.length || 4 }).map((_, i) => renderSkeletonRow(i))
            : displayedCurrencies.map((code, index) => renderCurrencyRow(code, index))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default CurrencyExchange;
