'use client';

import { Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalculatorProps {
  value: string;
  onInput: (value: string) => void;
}

const Calculator = ({ value, onInput }: CalculatorProps) => {

  const handlePress = (key: string) => {
    const lastChar = value.slice(-1);
    const isOperator = (char: string) => ['+', '-', '*', '/'].includes(char);
    
    if (key === 'backspace') {
      if (value.length > 1) {
        onInput(value.slice(0, -1));
      } else {
        onInput('0');
      }
    } else if (key === 'C') {
        onInput('0');
    } else if (isOperator(key)) {
        if (!isOperator(lastChar)) {
            onInput(value + key);
        } else {
            // Replace the last operator
            onInput(value.slice(0, -1) + key);
        }
    } else if (key === '.') {
      const parts = value.split(/[+\-*/]/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('.')) {
        onInput(value + '.');
      }
    } else { // It's a number
      if (value === '0') {
        onInput(key);
      } else {
        onInput(value + key);
      }
    }
  };

  const keys = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '.', '0'
  ];

  const operatorKeys = ['/', '*', '-', '+'];

  const buttonStyle = "h-16 text-2xl font-medium rounded-xl bg-secondary hover:bg-muted focus:bg-muted text-foreground";
  const operatorButtonStyle = "h-16 text-2xl font-medium rounded-xl bg-accent/20 text-accent hover:bg-accent/30 focus:bg-accent/30";

  return (
    <div className="grid grid-cols-4 gap-2 p-4 bg-background">
      <div className="col-span-3 grid grid-cols-3 gap-2">
        <Button onClick={() => handlePress('C')} className={buttonStyle}>C</Button>
        <div/>
        <Button onClick={() => handlePress('backspace')} className={buttonStyle} aria-label="Backspace">
          <Delete />
        </Button>
        {keys.map((key) => (
          <Button
            key={key}
            onClick={() => handlePress(key)}
            className={buttonStyle}
          >
            {key}
          </Button>
        ))}
      </div>
      <div className="col-span-1 grid grid-rows-4 gap-2">
        {operatorKeys.map((key) => (
            <Button
                key={key}
                onClick={() => handlePress(key)}
                className={operatorButtonStyle}
            >
                {key}
            </Button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
