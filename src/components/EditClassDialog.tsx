// src/components/EditClassDialog.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { updateClassAPI } from "@/lib/api-client";

const formSchema = z.object({
  test_date: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClassDialogProps {
  classId: string;
  currentTestDate: string | null;
  onClassUpdated: () => void;
}

export function EditClassDialog({ classId, currentTestDate, onClassUpdated }: EditClassDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      test_date: currentTestDate ? new Date(currentTestDate) : undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
    // Format the date as ISO string if it exists
    const formattedDate = data.test_date ? data.test_date.toISOString() : undefined;
    
    // Call the API to update the class
    await updateClassAPI(classId, formattedDate);
    
    // Refresh the classes list
    onClassUpdated();
    setOpen(false);
  } catch (error) {
    console.error("Failed to update class:", error);
    // You might want to show an error message to the user here
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Exam Date</DialogTitle>
          <DialogDescription>
            Update the AP exam date for this class.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="test_date"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-lg">AP Test Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
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
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date > new Date("2100-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}