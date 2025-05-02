"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Clock, ArrowRight } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const workflowFormSchema = z.object({
  enableFollowUp: z.boolean(),
  followUpConfig: z.object({
    waitDays: z.number(),
    emailSubject: z.string().optional(),
    emailBody: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.emailSubject === "" && data.emailBody === "") {
      return; // If both are empty, that's fine (follow-up disabled)
    }
    
    if (data.emailSubject === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email subject is required",
        path: ["emailSubject"],
      });
    }
    
    if (data.emailBody === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email body is required",
        path: ["emailBody"],
      });
    }
  }),
});

type WorkflowFormValues = z.infer<typeof workflowFormSchema>;

interface WorkflowFormProps {
  onSubmit: (data: WorkflowFormValues) => void;
  isSubmitting?: boolean;
  initialData?: WorkflowFormValues;
}

export function WorkflowForm({
  onSubmit,
  isSubmitting = false,
  initialData,
}: WorkflowFormProps) {
  // Default initial data
  const defaultInitialData = {
    enableFollowUp: false,
    followUpConfig: {
      waitDays: 3,
      emailSubject: "",
      emailBody: "",
    },
  };

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: initialData || defaultInitialData,
  });

  // Track if follow-up is enabled
  const followUpEnabled = form.watch("enableFollowUp");

  // Toggle follow-up
  const handleToggleFollowUp = (enabled: boolean) => {
    form.setValue("enableFollowUp", enabled);
    
    // If disabled, reset follow-up config fields
    if (!enabled) {
      form.setValue("followUpConfig", {
        waitDays: 3,
        emailSubject: "",
        emailBody: "",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Workflow</CardTitle>
            <CardDescription>
              Configure automated follow-up emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enableFollowUp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Follow-up Email</FormLabel>
                    <FormDescription>
                      Automatically send a follow-up message if no response
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={handleToggleFollowUp}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {followUpEnabled && (
              <>
                <div className="flex items-center justify-center py-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />
                  <div className="rounded-full bg-muted p-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />
                  <div className="rounded-full bg-primary/10 p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="followUpConfig.waitDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wait Period</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select wait period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2 days</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="4">4 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="7">1 week</SelectItem>
                          <SelectItem value="14">2 weeks</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Days to wait before sending the follow-up email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpConfig.emailSubject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Email Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Re: Following up on my previous message"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Subject line for your follow-up email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpConfig.emailBody"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Email Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="I wanted to follow up on my previous email about..."
                          className="min-h-32"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Use {"{FirstName}"} to add the recipient name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
          {!followUpEnabled && (
            <CardFooter className="bg-muted/50 border-t">
              <p className="text-sm text-muted-foreground">
                No automated follow-up emails will be sent in this campaign
              </p>
            </CardFooter>
          )}
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