
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon } from "lucide-react";

interface UserDiscountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    discountPercentage: number;
    discountNote?: string;
    isTemporary?: boolean;
    expiryDate?: Date | null;
  }) => void;
  currentDiscount?: number;
  currentNote?: string;
  currentExpiryDate?: string | null;
  username?: string;
  isLoading?: boolean;
}

export function UserDiscountForm({
  open,
  onOpenChange,
  onSubmit,
  currentDiscount = 0,
  currentNote = "",
  currentExpiryDate,
  username,
  isLoading
}: UserDiscountFormProps) {
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    currentDiscount
  );
  const [discountNote, setDiscountNote] = useState<string>(currentNote);
  const [isTemporary, setIsTemporary] = useState<boolean>(!!currentExpiryDate);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    currentExpiryDate ? new Date(currentExpiryDate) : undefined
  );

  // Update form when props change
  useEffect(() => {
    setDiscountPercentage(currentDiscount);
    setDiscountNote(currentNote);
    setIsTemporary(!!currentExpiryDate);
    setExpiryDate(currentExpiryDate ? new Date(currentExpiryDate) : undefined);
  }, [currentDiscount, currentNote, currentExpiryDate, open]);

  const handleSubmit = () => {
    onSubmit({
      discountPercentage,
      discountNote,
      isTemporary,
      expiryDate: isTemporary ? expiryDate || null : null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set User Discount</DialogTitle>
          <DialogDescription>
            Configure discount settings for {username}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountPercentage" className="text-right">
              Discount (%)
            </Label>
            <Input
              id="discountPercentage"
              type="number"
              min="0"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isTemporary" className="text-right">
              Temporary
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="isTemporary"
                checked={isTemporary}
                onCheckedChange={setIsTemporary}
              />
              <span className="text-sm text-muted-foreground">
                {isTemporary
                  ? "Discount will expire on the set date"
                  : "Discount never expires"}
              </span>
            </div>
          </div>

          {isTemporary && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Expiry Date</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="discountNote" className="text-right pt-2">
              Note
            </Label>
            <Textarea
              id="discountNote"
              placeholder="Reason for this discount"
              value={discountNote}
              onChange={(e) => setDiscountNote(e.target.value)}
              className="col-span-3 h-20"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (isTemporary && !expiryDate)}
          >
            {isLoading ? "Saving..." : "Save Discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
