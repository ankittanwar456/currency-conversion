'use client';

import { Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalculatorProps {
  value: string;
  onInput: (value: string) => void;
}

const Calculator = ({ value, onInput }: CalculatorProps) => {
  const handlePress = (key: string) => {
    if (key === 'backspace') {
      if (value.length > 1) {
        onInput(value.slice(0, -1));
      } else {
        onInput('0');
      }
    } else if (key === '.') {
      if (!value.includes('.')) {
        onInput(value + '.');
      }
    } else {
      if (value === '0') {
        onInput(key);
      } else {
        onInput(value + key);
      }
    }
  };
  
  const handleClear = () => {
    onInput('0');
  }

  const keys = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '.', '0'
  ];

  const buttonStyle = "h-16 text-2xl font-medium rounded-xl bg-secondary hover:bg-muted focus:bg-muted text-foreground";

  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-background">
      {keys.map((key) => (
        <Button
          key={key}
          onClick={() => handlePress(key)}
          className={buttonStyle}
        >
          {key}
        </Button>
      ))}
      <Button onClick={() => handlePress('backspace')} onLongPress={handleClear} className={buttonStyle} aria-label="Backspace">
        <Delete />
      </Button>
    </div>
  );
};

export default Calculator;
