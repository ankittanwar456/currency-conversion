
'use client';

import Image from 'next/image';
import { getFlagUrl } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface CurrencyRowProps {
  code: string;
  name: string;
  value: number | string;
  isBase: boolean;
  onClick?: () => void;
  showResult?: boolean;
}

const CurrencyRow = ({ code, name, value, isBase, onClick, showResult }: CurrencyRowProps) => {
  
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    : value;

  const flagUrl = getFlagUrl(code);

  const content = (
    <div className={cn(
        "flex items-center justify-between w-full p-3 my-1.5 rounded-lg transition-colors",
        isBase ? 'bg-secondary' : 'hover:bg-secondary/50',
        onClick && !isBase && 'cursor-pointer'
      )}>
      <div className="flex items-center gap-4">
        <div className="relative h-10 w-10 shrink-0">
           <Image
            src={flagUrl}
            alt={`${code} flag`}
            width={40}
            height={40}
            className="rounded-full object-cover bg-muted"
            onError={(e) => { e.currentTarget.src = `https://flagsapi.com/US/flat/64.png`; e.currentTarget.style.backgroundColor = 'transparent' }}
          />
        </div>
        <div className="flex flex-col items-start">
          <p className="font-bold text-lg">{code.toUpperCase()}</p>
          <p className="text-sm text-muted-foreground -mt-1">{name || ' '}</p>
        </div>
      </div>
      <div className="text-right flex-shrink basis-1/2 overflow-hidden">
        <p className={cn(
          "text-xl font-mono truncate text-right",
          isBase ? 'text-primary font-bold' : 'text-foreground',
          isBase && showResult && 'text-2xl'
        )}>
          {formattedValue}
        </p>
      </div>
    </div>
  );
  
  if (onClick && !isBase) {
    return <Button variant="ghost" className="h-auto p-0 w-full" onClick={onClick}>{content}</Button>
  }

  return content;
};

export default CurrencyRow;
