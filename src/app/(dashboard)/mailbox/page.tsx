"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Archive,
  ArchiveX,
  ChevronDown,
  Forward,
  LayoutList,
  Mail,
  MailPlus,
  Reply,
  Search,
  Star,
  Trash2,
  RefreshCcw,
  MoreHorizontal,
  Inbox,
  Send,
  File,
  Paperclip,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  isStarred?: boolean;
  hasAttachments?: boolean;
  labels?: string[];
}

type EmailThread = Email[];

export default function MailboxPage() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredThreads, setFilteredThreads] = useState<EmailThread[]>([]);
  const [activeMailboxTab, setActiveMailboxTab] = useState("inbox");
  const [mailboxFilter, setMailboxFilter] = useState("all");

  // States for compose email
  const [newEmailTo, setNewEmailTo] = useState("");
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailContent, setNewEmailContent] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    loadEmails();
  }, [activeMailboxTab]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredThreads(threads);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredThreads(
        threads.filter((thread) => {
          const email = thread[0];
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
      // Add some synthetic data for UI demonstration
      const enhancedData = data.map(thread => {
        return thread.map(email => ({
          ...email,
          isStarred: Math.random() > 0.7,
          hasAttachments: Math.random() > 0.8,
          labels: Math.random() > 0.7 ? ["Important"] : []
        }));
      });
      setThreads(enhancedData);
      setFilteredThreads(enhancedData);
    } catch (error) {
      toast.error("Failed to load emails");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = (thread: EmailThread) => {
    setSelectedThread(thread);
    setSelectedEmail(thread[0]);
  };


  const handleOpenReplyDialog = (email: Email) => {
    setSelectedEmail(email);
    setReplyDialogOpen(true);
    setReplyContent("");
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyContent.trim()) return;

    try {
      setSendingEmail(true);
      await sendReply({
        parentMessageId: selectedEmail.message_id,
        content: replyContent,
        subject: `Re: ${selectedEmail.subject}`,
      });
      
      toast.success("Reply sent successfully");
      setReplyDialogOpen(false);
      setReplyContent("");
      loadEmails();
    } catch (error) {
      toast.error("Failed to send reply");
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendNewEmail = async () => {
    if (!newEmailTo.trim() || !newEmailSubject.trim() || !newEmailContent.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSendingEmail(true);
      // In a real application, you would call your API to send the email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Email sent successfully");
      setComposeDialogOpen(false);
      
      // Reset form
      setNewEmailTo("");
      setNewEmailSubject("");
      setNewEmailContent("");
      setAttachments([]);
      
      // Refresh emails to show the new one
      loadEmails();
    } catch (error) {
      toast.error("Failed to send email");
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteEmail(messageId);
      
      // Remove the thread containing this email
      setThreads(threads.filter(thread => 
        !thread.some(email => email.message_id === messageId)
      ));
      setFilteredThreads(filteredThreads.filter(thread => 
        !thread.some(email => email.message_id === messageId)
      ));
      
      // Clear selection if the deleted email was selected
      if (selectedEmail?.message_id === messageId) {
        setSelectedEmail(null);
        setSelectedThread(null);
      }
      
      toast.success("Email deleted successfully");
    } catch (error) {
      toast.error("Failed to delete email");
      console.error(error);
    }
  };

  const handleToggleStar = (messageId: string) => {
    const updatedThreads = threads.map(thread => {
      return thread.map(email => {
        if (email.message_id === messageId) {
          return { ...email, isStarred: !email.isStarred };
        }
        return email;
      });
    });
    
    setThreads(updatedThreads);
    setFilteredThreads(updatedThreads);
  };

  const handleArchive = (messageId: string) => {
    // In a real application, you would call your API to archive the email
    toast.success("Email archived");
    
    // Remove the thread from the current view
    setThreads(threads.filter(thread => 
      !thread.some(email => email.message_id === messageId)
    ));
    setFilteredThreads(filteredThreads.filter(thread => 
      !thread.some(email => email.message_id === messageId)
    ));
    
    // Clear selection if the archived email was selected
    if (selectedEmail?.message_id === messageId) {
      setSelectedEmail(null);
      setSelectedThread(null);
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If it's today, show the time
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    
    // If it's within the last 7 days, show the day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return format(date, 'EEE');
    }
    
    // Otherwise show the date
    return format(date, 'MMM d');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between p-1">
        <h1 className="text-2xl font-bold">Mailbox</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setComposeDialogOpen(true)}>
            <MailPlus className="h-4 w-4 mr-2" />
            Compose
          </Button>
          <Button variant="outline" size="sm" onClick={loadEmails}>
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex rounded-md overflow-hidden mt-4 border">
        {/* Sidebar */}
        <div className="w-[240px] bg-muted/40 border-r">
          <div className="p-3">
            <Button 
              variant="default" 
              className="w-full justify-start" 
              onClick={() => setComposeDialogOpen(true)}
            >
              <MailPlus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
          
          <Tabs defaultValue="inbox" value={activeMailboxTab} onValueChange={setActiveMailboxTab}>
            <div className="px-3 py-2">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="inbox" className="flex justify-center items-center">
                  <Inbox className="h-4 w-4 mr-2" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">Inbox</span>
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex justify-center items-center">
                  <Send className="h-4 w-4 mr-2" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">Sent</span>
                </TabsTrigger>
                <TabsTrigger value="archive" className="flex justify-center items-center">
                  <Archive className="h-4 w-4 mr-2" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">Archive</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          
          <div className="px-3 py-2">
            <Select value={mailboxFilter} onValueChange={setMailboxFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mail</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="attachments">With Attachments</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium mb-2">Labels</h3>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Badge className="bg-red-500 h-2 w-2 rounded-full p-0 mr-2" />
                Important
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Badge className="bg-blue-500 h-2 w-2 rounded-full p-0 mr-2" />
                Work
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Badge className="bg-green-500 h-2 w-2 rounded-full p-0 mr-2" />
                Personal
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className={`w-[380px] border-r ${selectedEmail ? 'hidden md:block' : 'block'}`}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="font-semibold">
                  {activeMailboxTab === "inbox" ? "Inbox" : 
                   activeMailboxTab === "sent" ? "Sent" : "Archive"}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <LayoutList className="h-4 w-4 mr-2" />
                      Select All
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArchiveX className="h-4 w-4 mr-2" />
                      Mark All as Read
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-medium">No emails</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? "No results found" : "Your mailbox is empty"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredThreads.map((thread) => {
                      const latestEmail = thread[0];
                      const isSelected = selectedThread && selectedThread[0].message_id === latestEmail.message_id;
                      
                      return (
                        <div
                          key={latestEmail.message_id}
                          className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                            isSelected ? "bg-muted" : ""
                          }`}
                          onClick={() => handleSelectThread(thread)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {getInitials(latestEmail.from.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium truncate max-w-[180px]">
                                {latestEmail.from.name}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground">
                                {getRelativeTime(latestEmail.created_at)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStar(latestEmail.message_id);
                                }}
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    latestEmail.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                  }`}
                                />
                                <span className="sr-only">Star</span>
                              </Button>
                            </div>
                          </div>
                          
                          <div className="font-medium truncate">{latestEmail.subject}</div>
                          
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <div className="truncate flex-1">
                              {latestEmail.content.text.substring(0, 60)}
                              {latestEmail.content.text.length > 60 ? '...' : ''}
                            </div>
                            <div className="flex items-center ml-2">
                              {latestEmail.hasAttachments && (
                                <Paperclip className="h-3 w-3 mx-1" />
                              )}
                              {thread.length > 1 && (
                                <Badge 
                                  variant="outline" 
                                  className="ml-1 h-5 text-xs"
                                >
                                  {thread.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {latestEmail.labels && latestEmail.labels.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {latestEmail.labels.map((label, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          {/* Email View */}
          <div className={`flex-1 ${selectedEmail ? 'block' : 'hidden md:block'}`}>
            {!selectedEmail ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-medium">Select an email to view</h3>
                  <p className="text-muted-foreground mt-2">
                    Choose an email from the list to view its contents
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="md:hidden mr-2"
                      onClick={() => {
                        setSelectedEmail(null);
                        setSelectedThread(null);
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                      <span className="sr-only">Back</span>
                    </Button>
                    <h3 className="font-semibold truncate max-w-[400px]">
                      {selectedEmail.subject}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleArchive(selectedEmail.message_id)}
                    >
                      <Archive className="h-4 w-4" />
                      <span className="sr-only">Archive</span>
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(selectedEmail.message_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenReplyDialog(selectedEmail)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Forward className="h-4 w-4 mr-2" />
                          Forward
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStar(selectedEmail.message_id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {selectedEmail.isStarred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <File className="h-4 w-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {selectedThread && (
                    <div className="space-y-6">
                      {selectedThread.map((email, index) => (
                        <div key={email.message_id} className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex">
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarFallback>
                                  {getInitials(email.from.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">
                                  {email.from.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  To: {email.to.map(recipient => recipient.name).join(", ")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(email.created_at), 'PPpp')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenReplyDialog(email)}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                              <Button 
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleToggleStar(email.message_id)}
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    email.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                                  }`}
                                />
                                <span className="sr-only">Star</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Forward className="h-4 w-4 mr-2" />
                                    Forward
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <File className="h-4 w-4 mr-2" />
                                    Print
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="pl-14">
                            <div className="prose max-w-none">
                              <div className="whitespace-pre-wrap">
                                {email.content.text}
                              </div>
                            </div>
                            
                            {email.hasAttachments && (
                              <div className="mt-4 border rounded-md p-3">
                                <div className="text-sm font-medium mb-2">Attachments (1)</div>
                                <div className="flex items-center p-2 rounded-md border bg-muted/50">
                                  <File className="h-10 w-10 mr-2 text-blue-500" />
                                  <div>
                                    <div className="text-sm font-medium">Document.pdf</div>
                                    <div className="text-xs text-muted-foreground">
                                      PDF, 2.4 MB
                                    </div>
                                  </div>
                                  <Button className="ml-auto" size="sm" variant="outline">
                                    Download
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {index < selectedThread.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                <div className="p-4 border-t bg-muted/30">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => handleOpenReplyDialog(selectedEmail)}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to: {selectedEmail?.subject}</DialogTitle>
            <DialogDescription>
              Replying to {selectedEmail?.from.name} ({selectedEmail?.from.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reply">Your Message</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                rows={10}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReply} 
              disabled={!replyContent.trim() || sendingEmail}
            >
              {sendingEmail ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Compose Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Compose a new email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                placeholder="recipient@example.com"
                value={newEmailTo}
                onChange={(e) => setNewEmailTo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Add a subject"
                value={newEmailSubject}
                onChange={(e) => setNewEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                rows={10}
                value={newEmailContent}
                onChange={(e) => setNewEmailContent(e.target.value)}
              />
            </div>
            
            {/* Attachment upload section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Attachments</Label>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleAddAttachment}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" type="button" className="cursor-pointer">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Files
                  </Button>
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="border rounded-md p-2 mt-2">
                  <div className="text-sm font-medium mb-2">
                    Attached Files ({attachments.length})
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center">
                          <File className="h-5 w-5 mr-2 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium truncate max-w-[180px]">
                              {file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendNewEmail} 
              disabled={!newEmailTo.trim() || !newEmailSubject.trim() || !newEmailContent.trim() || sendingEmail}
            >
              {sendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}