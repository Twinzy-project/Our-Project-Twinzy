import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGoalSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const categories = ["Education", "Health", "Career", "Personal", "Finance"];

const formSchema = insertGoalSchema.extend({
  deadline: z.date().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface GoalFormProps {
  userId: string;
  initialData?: Goal;
  onSuccess?: () => void;
}

export function GoalForm({ userId, initialData, onSuccess }: GoalFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<FormData> = {
    userId,
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "Personal",
    progress: initialData?.progress || 0,
    isCompleted: initialData?.isCompleted || false,
    deadline: initialData?.deadline ? new Date(initialData.deadline) : null,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        // Update existing goal
        await apiRequest("PATCH", `/api/goals/${initialData.id}`, data);
        toast({
          title: "Goal updated",
          description: "Your goal has been updated successfully.",
        });
      } else {
        // Create new goal
        await apiRequest("POST", `/api/goals`, data);
        toast({
          title: "Goal created",
          description: "Your goal has been created successfully.",
        });
      }
      
      // Invalidate and refetch goals
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/statistics/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${userId}`] });
      
      // Reset form for new goals
      if (!initialData) {
        form.reset(defaultValues);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: initialData 
          ? "Failed to update the goal. Please try again." 
          : "Failed to create the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter goal title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your goal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress ({field.value}%)</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[field.value]}
                  onValueChange={(values) => field.onChange(values[0])}
                  className="py-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          {initialData && (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
