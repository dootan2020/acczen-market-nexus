
import React from 'react';
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
import { Percent } from 'lucide-react';

// Define form schema
const discountFormSchema = z.object({
  discountPercentage: z
    .number()
    .min(0, 'Discount must be at least 0%')
    .max(100, 'Discount cannot exceed 100%'),
  discountNote: z.string().optional(),
});

type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface UserDiscountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DiscountFormValues) => void;
  isLoading: boolean;
  currentDiscount?: number;
  currentNote?: string;
  username?: string;
}

export const UserDiscountForm: React.FC<UserDiscountFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  currentDiscount = 0,
  currentNote = '',
  username,
}) => {
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      discountPercentage: currentDiscount,
      discountNote: currentNote,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set User Discount</DialogTitle>
          <DialogDescription>
            {username ? `Update discount percentage for ${username}` : 'Update user discount percentage.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                  <FormDescription>
                    Enter a value between 0% and 100%.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
