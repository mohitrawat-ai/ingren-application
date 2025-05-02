"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Edit, Mail } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { getEmailPreviews, sendTestEmail } from "@/lib/actions/email"

interface PersonalizedEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  scheduledTime: Date;
  organization: string;
}

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: number;
  campaignName: string;
}

export function EmailPreviewDialog({
  open,
  onOpenChange,
  campaignId,
  campaignName,
}: EmailPreviewDialogProps) {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<PersonalizedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<PersonalizedEmail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    if (open) {
      loadEmails();
    }
  }, [open, campaignId]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const previewEmails = await getEmailPreviews(campaignId);
      setEmails(previewEmails);
      // Select first email by default
      if (previewEmails.length > 0) {
        setSelectedEmail(previewEmails[0]);
        setEditedSubject(previewEmails[0].subject);
        setEditedContent(previewEmails[0].content);
      }
    } catch (error) {
      console.error("Error loading emails:", error);
      toast.error("Failed to load email previews");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = (email: PersonalizedEmail) => {
    setSelectedEmail(email);
    setEditedSubject(email.subject);
    setEditedContent(email.content);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    if (selectedEmail) {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (!selectedEmail) return;

    // Create a new email object with edited content
    const updatedEmail = {
      ...selectedEmail,
      subject: editedSubject,
      content: editedContent,
    };

    // Update the email in the list
    setEmails(
      emails.map((email) => 
        email.id === selectedEmail.id ? updatedEmail : email
      )
    );

    // Update the selected email
    setSelectedEmail(updatedEmail);
    setIsEditing(false);
    toast.success("Email updated successfully");
  };

  const handleCancelEdit = () => {
    if (selectedEmail) {
      setEditedSubject(selectedEmail.subject);
      setEditedContent(selectedEmail.content);
    }
    setIsEditing(false);
  };

  const handleSendTestEmail = async () => {
    if (!selectedEmail || !testEmail) return;

    try {
      setSendingEmail(true);
      await sendTestEmail({
        to: testEmail,
        subject: selectedEmail.subject,
        content: selectedEmail.content,
        campaignId
      });
      toast.success("Test email sent successfully");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
    } finally {
      setSendingEmail(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Email Previews - {campaignName}</DialogTitle>
          <DialogDescription>
            Preview and edit personalized emails for your campaign
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh]">
          {/* Email List */}
          <div className="md:col-span-1 border rounded-md overflow-hidden">
            <div className="p-3 border-b bg-muted/50">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Recipients</h3>
                <Badge variant="outline">{emails.length}</Badge>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(60vh-6rem)]">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedEmail?.id === email.id ? "bg-accent" : ""
                      }`}
                      onClick={() => handleEmailSelect(email)}
                    >
                      <div className="font-medium truncate">{email.recipientName}</div>
                      <div className="text-sm text-muted-foreground truncate">{email.recipientEmail}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">{email.organization}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Email Preview */}
          <div className="md:col-span-2 border rounded-md overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : selectedEmail ? (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
                  <h3 className="font-medium">Email Preview</h3>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={handleStartEditing}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    )}
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Subject
                        </label>
                        <Input
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Content
                        </label>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="min-h-[300px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(selectedEmail.recipientName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{selectedEmail.recipientName}</div>
                            <div className="text-sm text-muted-foreground">{selectedEmail.recipientEmail}</div>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <span className="text-sm text-muted-foreground">Subject: </span>
                          <span className="font-medium">{selectedEmail.subject}</span>
                        </div>
                        
                        <div className="mb-2">
                          <span className="text-sm text-muted-foreground">Scheduled: </span>
                          <span>{format(new Date(selectedEmail.scheduledTime), 'PPp')}</span>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="whitespace-pre-wrap">{selectedEmail.content}</div>
                    </div>
                  )}
                </ScrollArea>
                
                <div className="p-3 border-t bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Enter email for test send"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendTestEmail} 
                      disabled={sendingEmail || !testEmail}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {sendingEmail ? "Sending..." : "Send Test"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="h-10 w-10 text-muted-foreground mx-auto" />
                  <h3 className="mt-4 text-lg font-medium">No email selected</h3>
                  <p className="text-muted-foreground mt-2">
                    Select an email from the list to preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}