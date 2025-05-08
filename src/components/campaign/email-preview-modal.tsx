// src/components/campaign/email-preview-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, User, Calendar, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EmailPreview {
  id: string;
  recipient: {
    name: string;
    email: string;
    title: string;
    company: string;
  };
  sender: {
    name: string;
    email: string;
    title: string;
  };
  subject: string;
  body: string;
  scheduledDate: string;
  personalization: {
    recipientName: string;
    companyName: string;
    recipientTitle: string;
    recipientLocation?: string;
  };
}

interface EmailPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: number;
}

export function EmailPreviewModal({ open, onOpenChange, campaignId }: EmailPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [previewEmails, setPreviewEmails] = useState<EmailPreview[]>([]);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [sendTestEmail, setSendTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadPreviewEmails();
    }
  }, [open, campaignId]);
  
  const loadPreviewEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/preview-emails`);
      if (!response.ok) {
        throw new Error('Failed to load preview emails');
      }
      
      const data = await response.json();
      setPreviewEmails(data.previewEmails);
      setCurrentEmailIndex(0);
    } catch (error) {
      console.error("Error loading preview emails:", error);
      toast.error("Failed to load email previews");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrevEmail = () => {
    if (currentEmailIndex > 0) {
      setCurrentEmailIndex(currentEmailIndex - 1);
    }
  };
  
  const handleNextEmail = () => {
    if (currentEmailIndex < previewEmails.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1);
    }
  };
  
  const handleCopyEmail = () => {
    const currentEmail = previewEmails[currentEmailIndex];
    if (!currentEmail) return;
    
    navigator.clipboard.writeText(currentEmail.body);
    setCopied(true);
    toast.success("Email content copied to clipboard");
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSendTest = async () => {
    if (!sendTestEmail || !sendTestEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    const currentEmail = previewEmails[currentEmailIndex];
    if (!currentEmail) return;
    
    setSendingTest(true);
    try {
      // In a real app, this would call an API to send the test email
      // For now we'll just simulate a successful call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Test email sent to ${sendTestEmail}`);
      setSendTestEmail("");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };
  
  const currentEmail = previewEmails[currentEmailIndex];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Updated the max-width from max-w-3xl to max-w-5xl to make the modal wider */}
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <DialogDescription>
            Preview how your emails will look to recipients
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : previewEmails.length === 0 ? (
          <div className="py-8 text-center">
            <Mail className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="mt-4 text-lg font-medium">No email previews available</h3>
            <p className="text-muted-foreground mt-2">
              Unable to generate email previews for this campaign
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevEmail}
                  disabled={currentEmailIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">
                  {currentEmailIndex + 1} of {previewEmails.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextEmail}
                  disabled={currentEmailIndex === previewEmails.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEmail}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Email Preview</TabsTrigger>
                <TabsTrigger value="personalization">Personalization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-md p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="mt-1 h-12 w-12">
                      <AvatarFallback>
                        {currentEmail.sender.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex flex-col mb-3">
                        <div className="font-medium text-base">From: {currentEmail.sender.name} &lt;{currentEmail.sender.email}&gt;</div>
                        <div className="text-sm text-muted-foreground">{currentEmail.sender.title}</div>
                      </div>
                      
                      <div className="flex flex-col mb-3">
                        <div className="font-medium text-base">To: {currentEmail.recipient.name} &lt;{currentEmail.recipient.email}&gt;</div>
                        <div className="text-sm text-muted-foreground">{currentEmail.recipient.title} at {currentEmail.recipient.company}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Scheduled: {format(new Date(currentEmail.scheduledDate), 'PPp')}
                        </span>
                      </div>
                      
                      <div className="font-medium text-base">Subject: {currentEmail.subject}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-5 whitespace-pre-wrap text-base leading-relaxed">
                    {currentEmail.body}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="personalization" className="space-y-4">
                <div className="border rounded-md p-6">
                  <h3 className="text-lg font-medium mb-6">Personalization Variables</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 border rounded-md">
                      <User className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Recipient Name</p>
                        <p className="text-base">{currentEmail.personalization.recipientName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 border rounded-md">
                      <Mail className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Company Name</p>
                        <p className="text-base">{currentEmail.personalization.companyName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 border rounded-md">
                      <User className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Recipient Title</p>
                        <p className="text-base">{currentEmail.personalization.recipientTitle}</p>
                      </div>
                    </div>
                    
                    {currentEmail.personalization.recipientLocation && (
                      <div className="flex items-center gap-3 p-4 border rounded-md">
                        <Mail className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-base">{currentEmail.personalization.recipientLocation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center gap-2 mt-6">
              <Input
                placeholder="Enter email to send test"
                value={sendTestEmail}
                onChange={(e) => setSendTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSendTest} 
                disabled={!sendTestEmail || sendingTest}
              >
                {sendingTest ? "Sending..." : "Send Test"}
              </Button>
            </div>
          </>
        )}
        
        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}