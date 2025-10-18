
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

  const handleImageError = () => {
    console.error(`Failed to load flag for currency: ${code}. URL: ${flagUrl}`);
  }

  return (
    <div className={cn(
        "flex items-center justify-between w-full p-2 my-1 rounded-lg transition-colors",
        isBase ? 'bg-secondary' : 'hover:bg-secondary/50'
      )}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={!isBase ? onClick : undefined} aria-label={`Change ${code}`}>
           <Image
            src={flagUrl}
            alt={`${code} flag`}
            width={32}
            height={32}
            className="rounded-full object-cover bg-muted"
            onError={(e) => { 
              handleImageError();
              e.currentTarget.src = `https://flagsapi.com/US/flat/64.png`; 
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          />
        </Button>
        <div className="flex flex-col items-start">
          <p className="font-bold text-md">{code.toUpperCase()}</p>
          <p className="text-xs text-muted-foreground -mt-1">{name || ' '}</p>
        </div>
      </div>
      <div className="text-right flex-shrink basis-1/2 overflow-hidden">
        <p className={cn(
          "text-lg font-mono truncate text-right",
          isBase ? 'text-primary font-bold' : 'text-foreground',
          isBase && showResult && 'text-xl'
        )}>
          {formattedValue}
        </p>
      </div>
    </div>
  );
};

export default CurrencyRow;

    