
import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  className?: string
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  align?: "start" | "center" | "end"
}

export function DateRangePicker({
  className,
  value,
  onChange,
  align = "end",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (ranges: DateRange | undefined) => {
    onChange(ranges)
    if (ranges?.from && ranges?.to) {
      setIsOpen(false)
    }
  }
  
  const handleClear = () => {
    onChange(undefined)
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value?.from && !value?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from && value?.to ? (
              <>
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
              </>
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="space-y-2 p-2">
            <Calendar
              mode="range"
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={2}
              initialFocus
            />
            <div className="flex justify-end">
              <Button
                variant="outline" 
                size="sm" 
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
