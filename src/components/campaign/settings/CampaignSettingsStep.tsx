// src/components/campaign/settings/CampaignSettingsStep.tsx
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Path } from "react-hook-form";
import * as campaignConfig from "@/lib/config/campaign";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format, set } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Volume2, Target } from "lucide-react";

const settingsFormSchema = z.object({
  // Campaign basic info
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  
  // Email settings
  emailSettings: z.object({
    fromName: z.string().min(1, "From name is required"),
    fromEmail: z.string().email("Invalid email address"),
    emailService: z.string().min(1, "Email service is required"),
  }),
  
  // Campaign settings (removed tracking options, added tone and CTA)
  campaignSettings: z.object({
    timezone: z.string().min(1, "Timezone is required"),
    dailySendLimit: z.number().min(1, "Daily send limit must be at least 1"),
    tone: z.string().min(1, "Email tone is required"),
    cta: z.string().min(1, "Call-to-action is required"),
    sendingDays: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    }).refine(days => {
      return Object.values(days).some(day => day === true);
    }, {
      message: "At least one sending day must be selected",
    }),
    sendingTime: z.object({
      startTime: z.string(),
      endTime: z.string(),
    }),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface CampaignSettingsStepProps {
  onSubmit: (data: SettingsFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Partial<SettingsFormValues>;
}

export function CampaignSettingsStep({
  onSubmit,
  isSubmitting = false,
  initialData,
}: CampaignSettingsStepProps) {
  // Default initial data
  const defaultInitialData = campaignConfig.defaultSettings;

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: { ...defaultInitialData, ...initialData },
  });

  
  const emailServices = campaignConfig.emailServices;
  const timezones = campaignConfig.timezones
  const toneOptions = campaignConfig.toneOptions
  const ctaOptions = campaignConfig.ctaOptions
  const days = campaignConfig.days as { value: Path<SettingsFormValues>; label: string }[];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Information</CardTitle>
            <CardDescription>
              Set your campaign name and basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Q2 Outreach Campaign" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your campaign a descriptive name
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the purpose and goals of this campaign..."
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add a description to help you remember this campaign&apos;s purpose
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaignSettings.timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map(timezone => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    All campaign times will be based on this timezone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>
              Configure your email sender settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="emailSettings.fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormDescription>
                    Sender name that recipients will see
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailSettings.fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Sender email address for this campaign
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailSettings.emailService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Service</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {emailServices.map(service => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Email delivery service to use
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* New Email Personalization Card */}
        <Card>
          <CardHeader>
            <CardTitle>Email Personalization</CardTitle>
            <CardDescription>
              Configure the tone and call-to-action for your emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="campaignSettings.tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Email Tone
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toneOptions.map(tone => (
                        <SelectItem key={tone.value} value={tone.value}>
                          <div>
                            <div className="font-medium">{tone.label}</div>
                            <div className="text-xs text-muted-foreground">{tone.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This sets the overall tone and style of your email communication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaignSettings.cta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Call-to-Action
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select call-to-action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ctaOptions.map(cta => (
                        <SelectItem key={cta.value} value={cta.value}>
                          <div>
                            <div className="font-medium">{cta.label}</div>
                            <div className="text-xs text-muted-foreground">{cta.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The primary action you want recipients to take
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sending Settings</CardTitle>
            <CardDescription>
              Configure when emails will be sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="campaignSettings.dailySendLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Send Limit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of emails to send per day
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Sending Days</FormLabel>
              <FormDescription className="mb-3">
                Select days when emails will be sent
              </FormDescription>
              <div className="flex flex-wrap gap-3">
                {days.map((day) => (
                  <FormField
                    key={day.value}
                    control={form.control}
                    name={day.value}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {day.label}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="campaignSettings.sendingTime.startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || "09:00"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {field.value ? format(set(new Date(), { 
                                      hours: parseInt(field.value.split(':')[0]), 
                                      minutes: parseInt(field.value.split(':')[1] || '0') 
                                    }), 'h:mm a') : 'Select time'}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <SelectItem
                                    key={hour}
                                    value={`${hour.toString().padStart(2, '0')}:00`}
                                  >
                                    {format(set(new Date(), { hours: hour, minutes: 0 }), 'h:mm a')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Time when system will start sending emails each day</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaignSettings.sendingTime.endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || "17:00"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {field.value ? format(set(new Date(), { 
                                      hours: parseInt(field.value.split(':')[0]), 
                                      minutes: parseInt(field.value.split(':')[1] || '0') 
                                    }), 'h:mm a') : 'Select time'}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <SelectItem
                                    key={hour}
                                    value={`${hour.toString().padStart(2, '0')}:00`}
                                  >
                                    {format(set(new Date(), { hours: hour, minutes: 0 }), 'h:mm a')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Time when system will stop sending emails each day</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Preview Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}