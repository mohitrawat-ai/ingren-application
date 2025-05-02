"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const pitchFormSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  features: z.array(
    z.object({
      id: z.number(),
      problem: z.string().min(5, "Problem must be at least 5 characters long"),
      solution: z.string().min(5, "Solution must be at least 5 characters long"),
    })
  ).min(1, "Add at least one feature"),
});

type PitchFormValues = z.infer<typeof pitchFormSchema>;

interface PitchFormProps {
  onSubmit: (data: PitchFormValues) => void;
  isSubmitting?: boolean;
  initialData?: PitchFormValues;
}

export function PitchForm({ 
  onSubmit, 
  isSubmitting = false,
  initialData,
}: PitchFormProps) {
  // Generate default initial data if none provided
  const defaultInitialData = {
    url: "",
    description: "",
    features: [
      { id: Date.now(), problem: "", solution: "" }
    ],
  };

  const form = useForm<PitchFormValues>({
    resolver: zodResolver(pitchFormSchema),
    defaultValues: initialData || defaultInitialData,
  });

  // Add new feature
  const handleAddFeature = () => {
    const currentFeatures = form.getValues("features");
    form.setValue("features", [
      ...currentFeatures,
      { id: Date.now(), problem: "", solution: "" }
    ]);
  };

  // Remove a feature
  const handleRemoveFeature = (id: number) => {
    const currentFeatures = form.getValues("features");
    if (currentFeatures.length <= 1) {
      return; // Keep at least one feature
    }
    
    form.setValue(
      "features", 
      currentFeatures.filter(feature => feature.id !== id)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Add your company details and value proposition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your company website URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your company, products, and services..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a compelling description of your company
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Problems & Solutions</CardTitle>
            <CardDescription>
              Describe the problems you solve and how your solutions help
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.getValues("features").map((feature, index) => (
              <div key={feature.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Feature {index + 1}</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature(feature.id)}
                    disabled={form.getValues("features").length <= 1}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name={`features.${index}.problem`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the problem your customers face..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`features.${index}.solution`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how your product or service solves this problem..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {index < form.getValues("features").length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddFeature}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Feature
            </Button>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
}