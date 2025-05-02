"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Reply,
  Trash2,
  Search,
  RefreshCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { getEmailThreads, deleteEmail, sendReply } from "@/lib/actions/email";

interface Email {
  id: string;
  message_id: string;
  from: {
    email: string;
    name: string;
  };
  to: {
    email: string;
    name: string;
  }[];
  subject: string;
  content: {
    text: string;
  };
  created_at: string;
}

type EmailThread = Email[];

export default function MailboxPage() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Email | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredThreads, setFilteredThreads] = useState<EmailThread[]>([]);

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredThreads(threads);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredThreads(
        threads.filter((thread) => {
          const email = thread[0]; // Most recent email in thread
          return (
            email.subject.toLowerCase().includes(query) ||
            email.from.name.toLowerCase().includes(query) ||
            email.from.email.toLowerCase().includes(query) ||
            email.content.text.toLowerCase().includes(query)
          );
        })
      );
    }
  }, [searchQuery, threads]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await getEmailThreads();
      setThreads(data);
      setFilteredThreads(data);
    } catch (error) {
      toast.error("Failed to load emails");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleThread = (threadId: string) => {
    setExpandedThreadId(expandedThreadId === threadId ? null : threadId);
  };

  const handleOpenReplyDialog = (email: Email) => {
    setReplyingTo(email);
    setReplyDialogOpen(true);
    setReplyContent("");
  };

  const handleSendReply = async () => {
    if (!replyingTo || !replyContent.trim()) return;

    try {
      await sendReply({
        parentMessageId: replyingTo.message_id,
        content: replyContent,
        subject: `Re: ${replyingTo.subject}`,
      });
      
      toast.success("Reply sent successfully");
      setReplyDialogOpen(false);
      loadEmails(); // Reload threads to show the new reply
    } catch (error) {
      toast.error("Failed to send reply");
      console.error(error);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteEmail(messageId);
      // Remove the thread containing this email
      setThreads(threads.filter(thread => 
        !thread.some(email => email.message_id === messageId)
      ));
      toast.success("Email deleted successfully");
    } catch (error) {
      toast.error("Failed to delete email");
      console.error(error);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mailbox</h1>
        <Button onClick={loadEmails} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search emails..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                Manage your incoming communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-10">
                  <Mail className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No messages</h3>
                  <p className="text-muted-foreground mt-2">
                    Your inbox is empty
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredThreads.map((thread) => {
                    const latestEmail = thread[0];
                    const threadId = latestEmail.message_id;
                    const isExpanded = expandedThreadId === threadId;
                    
                    return (
                      <div 
                        key={threadId}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div 
                          className="p-4 flex items-center hover:bg-accent cursor-pointer"
                          onClick={() => handleToggleThread(threadId)}
                        >
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarFallback>
                              {getInitials(latestEmail.from.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium truncate">
                                {latestEmail.from.name}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {format(new Date(latestEmail.created_at), 'MMM d, h:mm a')}
                              </div>
                            </div>
                            
                            <div className="font-medium truncate">{latestEmail.subject}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {latestEmail.content.text.substring(0, 100)}
                              {latestEmail.content.text.length > 100 ? '...' : ''}
                            </div>
                          </div>
                          
                          <div className="ml-4 flex items-center">
                            {thread.length > 1 && (
                              <Badge variant="outline" className="mr-2">
                                {thread.length}
                              </Badge>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="border-t p-4 bg-background">
                            <div className="flex justify-end space-x-2 mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReplyDialog(latestEmail)}
                              >
                                <Reply className="mr-2 h-4 w-4" /> Reply
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(threadId)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </div>
                            
                            <div className="space-y-6">
                              {thread.map((email, index) => (
                                <div key={email.message_id} className="space-y-3">
                                  <div className="flex items-start">
                                    <Avatar className="h-8 w-8 mr-3 mt-1">
                                      <AvatarFallback>
                                        {getInitials(email.from.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <div>
                                          <div className="font-semibold">
                                            {email.from.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {email.from.email}
                                          </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {format(new Date(email.created_at), 'MMM d, yyyy, h:mm a')}
                                        </div>
                                      </div>
                                      <div className="text-sm mt-2 whitespace-pre-wrap">
                                        {email.content.text}
                                      </div>
                                    </div>
                                  </div>
                                  {index < thread.length - 1 && (
                                    <div className="border-b my-4"></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sent" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent</CardTitle>
              <CardDescription>
                View your sent communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Sent emails content */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="archived" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Archived</CardTitle>
              <CardDescription>
                View your archived communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Archived emails content */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to: {replyingTo?.subject}</DialogTitle>
            <DialogDescription>
              Responding to {replyingTo?.from.name} ({replyingTo?.from.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reply-content">Your Reply</Label>
              <Textarea
                id="reply-content"
                rows={8}
                placeholder="Type your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={!replyContent.trim()}>
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}