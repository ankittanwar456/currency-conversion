'use client';

import { Delete, Equal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalculatorProps {
  value: string;
  onInput: (value: string) => void;
  onEquals: () => void;
}

const Calculator = ({ onInput, onEquals }: CalculatorProps) => {

  const handlePress = (key: string) => {
    onInput(key);
  };
  
  const handleEquals = () => {
    onEquals();
  }

  const keys = [
    { label: 'C', handler: () => handlePress('C'), className: "bg-secondary hover:bg-muted text-foreground" },
    { label: <Delete />, handler: () => handlePress('backspace'), className: "bg-secondary hover:bg-muted text-foreground" },
    { label: '%', handler: () => handlePress('%'), className: "bg-secondary hover:bg-muted text-foreground" },
    { label: '÷', handler: () => handlePress('/'), 'aria-label': 'Divide', className: "bg-accent/20 text-accent hover:bg-accent/30" },
    { label: '7', handler: () => handlePress('7') },
    { label: '8', handler: () => handlePress('8') },
    { label: '9', handler: () => handlePress('9') },
    { label: '×', handler: () => handlePress('*'), 'aria-label': 'Multiply', className: "bg-accent/20 text-accent hover:bg-accent/30" },
    { label: '4', handler: () => handlePress('4') },
    { label: '5', handler: () => handlePress('5') },
    { label: '6', handler: () => handlePress('6') },
    { label: '-', handler: () => handlePress('-'), 'aria-label': 'Subtract', className: "bg-accent/20 text-accent hover:bg-accent/30" },
    { label: '1', handler: () => handlePress('1') },
    { label: '2', handler: () => handlePress('2') },
    { label: '3', handler: () => handlePress('3') },
    { label: '+', handler: () => handlePress('+'), 'aria-label': 'Add', className: "bg-accent/20 text-accent hover:bg-accent/30" },
    { label: '0', handler: () => handlePress('0'), className: "col-span-2" },
    { label: '.', handler: () => handlePress('.') },
    { label: <Equal />, handler: handleEquals, 'aria-label': 'Equals', className: "bg-accent/20 text-accent hover:bg-accent/30" },
  ];

  const buttonStyle = "h-16 text-2xl font-medium rounded-xl bg-secondary hover:bg-muted focus:bg-muted text-foreground";

  return (
    <div className="grid grid-cols-4 gap-2 p-4 bg-background">
      {keys.map((key, index) => (
        <Button
          key={index}
          onClick={key.handler}
          className={cn(buttonStyle, key.className)}
          aria-label={typeof key.label === 'string' ? key.label : key['aria-label']}
        >
          {key.label}
        </Button>
      ))}
    </div>
  );
};

export default Calculator;
