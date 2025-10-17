'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Currency } from '@/lib/currencies';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  allCurrencies: Currency[];
  selectedCurrencies: string[];
  onSave: (newCurrencies: string[]) => void;
  baseCurrency: string;
}

const SettingsDialog = ({
  isOpen,
  onOpenChange,
  allCurrencies,
  selectedCurrencies,
  onSave,
  baseCurrency
}: SettingsDialogProps) => {
  const { toast } = useToast();
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const NUM_CURRENCIES = 4;

  useEffect(() => {
    if (isOpen) {
      const initialSelection = selectedCurrencies.filter(c => c !== baseCurrency);
      const paddedSelection = Array.from({ length: NUM_CURRENCIES }, (_, i) => initialSelection[i] || 'none');
      setLocalSelection(paddedSelection);
    }
  }, [isOpen, selectedCurrencies, baseCurrency]);

  const handleSelectionChange = (index: number, value: string) => {
    const newSelection = [...localSelection];
    newSelection[index] = value;
    setLocalSelection(newSelection);
  };
  
  const handleSave = () => {
    const finalSelection = localSelection.filter(c => c && c !== 'none');
    const uniqueSelection = [...new Set(finalSelection)];

    if (uniqueSelection.length !== finalSelection.length) {
      toast({
        variant: "destructive",
        title: "Duplicate Currencies",
        description: "Please select each currency only once.",
      });
      return;
    }
    
    if (uniqueSelection.includes(baseCurrency)) {
      toast({
        variant: "destructive",
        title: "Invalid Selection",
        description: `You cannot select the base currency (${baseCurrency}).`,
      });
      return;
    }

    onSave(uniqueSelection);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Currencies</DialogTitle>
          <DialogDescription>
            Change the currencies displayed on your home screen. Your base currency is {baseCurrency}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            {Array.from({ length: NUM_CURRENCIES }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`currency-${index}`} className="text-right">
                  Slot {index + 1}
                </Label>
                <Select
                  value={localSelection[index] || 'none'}
                  onValueChange={(value) => handleSelectionChange(index, value)}
                >
                  <SelectTrigger id={`currency-${index}`} className="col-span-3">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Disable</SelectItem>
                    {allCurrencies
                        .filter(c => c.code !== baseCurrency)
                        .map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
