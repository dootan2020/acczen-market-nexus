
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export interface UserDiscountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    discountPercentage: number;
    discountNote: string;
    isTemporary: boolean;
    expiryDate?: Date | null;
  }) => void;
  isLoading?: boolean;
  currentDiscount?: number;
  currentNote?: string;
  currentExpiryDate?: string | null;
  username?: string | null;
}

export function UserDiscountForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  currentDiscount = 0,
  currentNote = "",
  currentExpiryDate = null,
  username
}: UserDiscountFormProps) {
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    currentDiscount || 0
  );
  const [discountNote, setDiscountNote] = useState<string>(currentNote || "");
  const [isTemporary, setIsTemporary] = useState<boolean>(!!currentExpiryDate);
  const [expiryDate, setExpiryDate] = useState<Date | null>(
    currentExpiryDate ? new Date(currentExpiryDate) : null
  );

  const handleSubmit = () => {
    onSubmit({
      discountPercentage,
      discountNote,
      isTemporary,
      expiryDate: isTemporary ? expiryDate : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set User Discount</DialogTitle>
          <DialogDescription>
            Set a discount percentage for {username || "this user"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discount" className="text-right">
              Discount %
            </Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Note
            </Label>
            <Textarea
              id="note"
              placeholder="Reason for discount"
              value={discountNote}
              onChange={(e) => setDiscountNote(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="temporary" className="text-right">
              Temporary
            </Label>
            <div className="flex items-center gap-3 col-span-3">
              <Switch
                id="temporary"
                checked={isTemporary}
                onCheckedChange={setIsTemporary}
              />
              <Label htmlFor="temporary" className="font-normal">
                Set expiry date
              </Label>
            </div>
          </div>
          {isTemporary && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Expires on</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? (
                        format(expiryDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expiryDate || undefined}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (isTemporary && !expiryDate)}
          >
            {isLoading ? "Saving..." : "Save discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
