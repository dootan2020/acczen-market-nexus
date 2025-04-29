
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Percent, CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Sample discount notes
const DISCOUNT_NOTE_SUGGESTIONS = [
  "Loyalty reward for long-term customer",
  "Special offer for bulk purchases",
  "Anniversary promotion",
  "Customer service compensation",
  "VIP customer status"
];

// Common discount percentages
const COMMON_DISCOUNTS = [5, 10, 15, 20, 25, 30];

// Define form schema
const discountFormSchema = z.object({
  discountPercentage: z
    .number()
    .min(0, 'Discount must be at least 0%')
    .max(100, 'Discount cannot exceed 100%'),
  discountNote: z.string().optional(),
  isTemporary: z.boolean().default(false),
  expiryDate: z.date().optional().nullable(),
});

type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface UserDiscountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DiscountFormValues & { expiryDate?: Date | null }) => void;
  isLoading: boolean;
  currentDiscount?: number;
  currentNote?: string;
  currentExpiryDate?: string | null;
  username?: string;
}

export const UserDiscountForm: React.FC<UserDiscountFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  currentDiscount = 0,
  currentNote = '',
  currentExpiryDate = null,
  username,
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      discountPercentage: currentDiscount,
      discountNote: currentNote,
      isTemporary: !!currentExpiryDate,
      expiryDate: currentExpiryDate ? new Date(currentExpiryDate) : null,
    },
  });

  const isTemporary = form.watch('isTemporary');

  const handleQuickDiscountSelect = (percentage: number) => {
    form.setValue('discountPercentage', percentage);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    form.setValue('discountNote', suggestion);
  };

  const handleSubmit = (values: DiscountFormValues) => {
    onSubmit({
      ...values,
      expiryDate: values.isTemporary ? values.expiryDate : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set User Discount</DialogTitle>
          <DialogDescription>
            {username ? `Update discount percentage for ${username}` : 'Update user discount percentage.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        min={0}
                        max={100}
                        step={0.1}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="pr-8"
                      />
                      <div className="absolute right-3 top-2.5 text-muted-foreground">
                        <Percent className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMMON_DISCOUNTS.map((discount) => (
                      <Badge 
                        key={discount} 
                        variant={field.value === discount ? "default" : "outline"}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handleQuickDiscountSelect(discount)}
                      >
                        {discount}%
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Enter a value between 0% and 100% or select from common options.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isTemporary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Temporary Discount</FormLabel>
                    <FormDescription>
                      Set an expiration date for this discount
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isTemporary && (
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The discount will automatically expire at midnight on this date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="discountNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Reason for discount..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DISCOUNT_NOTE_SUGGESTIONS.map((suggestion) => (
                      <Badge 
                        key={suggestion} 
                        variant={selectedSuggestion === suggestion ? "default" : "outline"}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Add a note explaining why this discount was applied.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
