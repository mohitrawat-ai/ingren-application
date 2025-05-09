"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Switch } from "@/components/ui/switch";
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

const settingsFormSchema = z.object({
  emailSettings: z.object({
    fromName: z.string().min(1, "From name is required"),
    fromEmail: z.string().email("Invalid email address"),
    emailService: z.string().min(1, "Email service is required"),
  }),
  campaignSettings: z.object({
    name: z.string().min(1, "Campaign name is required"),
    timezone: z.string().min(1, "Timezone is required"),
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    dailySendLimit: z.number().min(1, "Daily send limit must be at least 1"),
    unsubscribeLink: z.boolean().default(true),
    sendingDays: z.object({
      monday: z.boolean().default(true),
      tuesday: z.boolean().default(true),
      wednesday: z.boolean().default(true),
      thursday: z.boolean().default(true),
      friday: z.boolean().default(true),
      saturday: z.boolean().default(false),
      sunday: z.boolean().default(false),
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

interface SettingsFormProps {
  onSubmit: (data: SettingsFormValues) => void;
  isSubmitting?: boolean;
  initialData?: SettingsFormValues;
}

export function SettingsForm({
  onSubmit,
  isSubmitting = false,
  initialData,
}: SettingsFormProps) {
  // Get the current time in HH:MM:SS format
  const getCurrentTime = (hours: number, minutes: number) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  // Default initial data
  const defaultInitialData: SettingsFormValues = {
    emailSettings: {
      fromName: "",
      fromEmail: "",
      emailService: "",
    },
    campaignSettings: {
      name: "",
      timezone: "UTC",
      trackOpens: true,
      trackClicks: true,
      dailySendLimit: 500,
      unsubscribeLink: true,
      sendingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      sendingTime: {
        startTime: getCurrentTime(9, 0),
        endTime: getCurrentTime(17, 0),
      },
    },
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: initialData || defaultInitialData,
  });

  // Email service options
  const emailServices = [
    { value: "sendgrid", label: "SendGrid" },
    { value: "mailchimp", label: "Mailchimp" },
    { value: "ses", label: "Amazon SES" },
    { value: "smtp", label: "Custom SMTP" },
  ];

  // Timezone options
  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  ];

  // Day labels for the form
  const days = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const formatTimeString = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, "h:mm a");
    } catch (error) {
      return "Invalid time";
    }
  };

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
              name="campaignSettings.name"
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
                    name={`campaignSettings.sendingDays.${day.value}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
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
                              onValueChange={(time) => {
                                // Convert time string (e.g. "09:00") to ISO string
                                const [hours, minutes] = time.split(':').map(Number);
                                const date = new Date();
                                date.setHours(hours, minutes, 0, 0);
                                field.onChange(date.toISOString());
                              }}
                              value={format(new Date(field.value), 'HH:mm')}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {formatTimeString(field.value)}
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
                              onValueChange={(time) => {
                                // Convert time string (e.g. "17:00") to ISO string
                                const [hours, minutes] = time.split(':').map(Number);
                                const date = new Date();
                                date.setHours(hours, minutes, 0, 0);
                                field.onChange(date.toISOString());
                              }}
                              value={format(new Date(field.value), 'HH:mm')}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {formatTimeString(field.value)}
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

        <Card>
          <CardHeader>
            <CardTitle>Tracking Options</CardTitle>
            <CardDescription>
              Configure email tracking settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="campaignSettings.trackOpens"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Track Opens</FormLabel>
                      <FormDescription>
                        Track when recipients open your emails
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

              <FormField
                control={form.control}
                name="campaignSettings.trackClicks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Track Clicks</FormLabel>
                      <FormDescription>
                        Track when recipients click links in your emails
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

              <FormField
                control={form.control}
                name="campaignSettings.unsubscribeLink"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Include Unsubscribe Link</FormLabel>
                      <FormDescription>
                        Add an unsubscribe link to all emails
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
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Complete Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}