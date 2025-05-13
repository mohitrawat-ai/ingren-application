// Modified OutreachForm component
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Volume2, MessageSquare, Plus, Trash2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner"; // Import toast for debugging

const outreachFormSchema = z.object({
  messageTone: z.string().min(1, "Message tone is required"),
  selectedCta: z.string().min(1, "Please select a CTA"),
  ctaOptions: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, "CTA label is required"),
    })
  ).min(1, "Add at least one CTA option"),
  personalizationSources: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      enabled: z.boolean(),
    })
  ),
});

type OutreachFormValues = z.infer<typeof outreachFormSchema>;

interface OutreachFormProps {
  onSubmit: (data: OutreachFormValues) => void;
  isSubmitting?: boolean;
  initialData?: OutreachFormValues | null;
}

export function OutreachForm({
  onSubmit,
  isSubmitting = false,
  initialData,
}: OutreachFormProps) {
  // Default messaging tones
  const toneOptions = [
    { value: "professional", label: "Professional & Formal" },
    { value: "friendly", label: "Friendly & Casual" },
    { value: "direct", label: "Direct & Concise" },
    { value: "consultative", label: "Consultative & Advisory" },
  ];

  // Default personalization sources
  const defaultPersonalizationSources = [
    { id: "linkedin", label: "LinkedIn Profile Data", enabled: true },
    { id: "website", label: "Company Website", enabled: false },
    { id: "news", label: "Recent News", enabled: false },
    { id: "social", label: "Social Media Activity", enabled: false },
  ];

  // Default CTA options
  const defaultCtaOptions = [
    { id: "call", label: "Schedule a Call" },
    { id: "demo", label: "Request a Demo" },
    { id: "info", label: "Request More Information" },
    { id: "trial", label: "Start a Free Trial" },
  ];

  // Create form with default or provided values
  const form = useForm<OutreachFormValues>({
    resolver: zodResolver(outreachFormSchema),
    defaultValues: initialData || {
      messageTone: "professional",
      selectedCta: "call",
      ctaOptions: defaultCtaOptions,
      personalizationSources: defaultPersonalizationSources,
    },
  });

  // Add a new CTA option
  const handleAddCtaOption = () => {
    const currentOptions = form.getValues("ctaOptions");
    form.setValue("ctaOptions", [
      ...currentOptions,
      { id: Date.now().toString(), label: "" },
    ]);
  };

  // Remove a CTA option
  const handleRemoveCtaOption = (id: string) => {
    const currentOptions = form.getValues("ctaOptions");
    if (currentOptions.length <= 1) {
      return; // Keep at least one CTA option
    }
    
    form.setValue(
      "ctaOptions",
      currentOptions.filter(option => option.id !== id)
    );
  };

  // Handle form submission with debug logging
  const handleFormSubmit = (data: OutreachFormValues) => {
    console.log("Form submitted with data:", data);
    try {
      onSubmit(data);
    } catch (error) {
      console.error("Error in onSubmit handler:", error);
      toast.error("Failed to submit form");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Message Tone</CardTitle>
            <CardDescription>
              Select the appropriate tone for your outreach messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="messageTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toneOptions.map(tone => (
                        <SelectItem key={tone.value} value={tone.value}>
                          <div className="flex items-center">
                            <Volume2 className="mr-2 h-4 w-4" />
                            <span>{tone.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This sets the overall tone of your email communication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call-to-Action</CardTitle>
            <CardDescription>
              Customize your call-to-action options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="selectedCta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary CTA</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary CTA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {form.getValues("ctaOptions").map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your primary call-to-action
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>CTA Options</FormLabel>
              <FormDescription className="mb-3">
                Customize your call-to-action text variations
              </FormDescription>
              
              <div className="space-y-3">
                {form.getValues("ctaOptions").map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`ctaOptions.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="CTA text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCtaOption(option.id)}
                      disabled={form.getValues("ctaOptions").length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleAddCtaOption}
              >
                <Plus className="mr-2 h-4 w-4" /> Add CTA Option
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalization</CardTitle>
            <CardDescription>
              Enable data sources for message personalization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {form.getValues("personalizationSources").map((source, index) => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{source.label}</span>
                  </div>
                  <FormField
                    control={form.control}
                    name={`personalizationSources.${index}.enabled`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Saving..." : "Next"}
          </Button>
        </div>
        
        {/* Debug information - can be removed in production */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="text-destructive text-sm p-2 border border-destructive rounded-md">
            <p>Form validation errors:</p>
            <pre className="text-xs mt-1 overflow-auto">
              {JSON.stringify(form.formState.errors, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </Form>
  );
}