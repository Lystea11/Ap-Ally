// src/components/Goals.tsx

"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Target } from 'lucide-react';
import { getGoalsAPI, createGoalAPI, updateGoalAPI, deleteGoalAPI } from '@/lib/api-client';
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

const goalSchema = z.object({
  text: z.string().min(1, "Goal cannot be empty."),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      text: "",
    },
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await getGoalsAPI();
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
    }
  };

  const addGoal = async (data: GoalFormValues) => {
    try {
      await createGoalAPI(data.text);
      fetchGoals();
      form.reset();
    } catch (error) {
      console.error("Failed to add goal", error);
    }
  };

  const toggleGoal = async (goal: Goal) => {
    try {
      await updateGoalAPI(goal.id, { completed: !goal.completed });
      fetchGoals();
    } catch (error) {
      console.error("Failed to toggle goal", error);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteGoalAPI(id);
      fetchGoals();
    } catch (error) {
      console.error("Failed to delete goal", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-xl">Your Goals</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addGoal)} className="flex gap-2 mb-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="Add a new goal..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Add</Button>
          </form>
        </Form>
        <div className="space-y-2">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-3">
              <Checkbox
                checked={goal.completed}
                onCheckedChange={() => toggleGoal(goal)}
                aria-label={`Mark goal as ${goal.completed ? 'incomplete' : 'complete'}`}
              />
              <span className={`flex-grow ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                {goal.text}
              </span>
              <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}