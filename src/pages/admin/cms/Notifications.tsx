import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Bell, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Notification {
  id: string;
  title: string;
  message: string;
  recipient: string;
  status: string;
  sent_at: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipient: "all",
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setNotifications([]);
    } catch (err: any) {
      toast({ title: "Error loading notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: formData.title,
        message: formData.message,
        recipient: formData.recipient,
        status: "sent",
        sent_at: new Date().toISOString(),
      };

      setNotifications([newNotification, ...notifications]);
      toast({ title: "Notification sent successfully" });
      setFormData({ title: "", message: "", recipient: "all" });
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error sending notification", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-100/20 flex items-center justify-center">
            <Bell className="h-6 w-6 text-orange-600" />
          </div>
          Notifications
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Create and send a notification to your users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="Notification title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={sending}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Notification message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={sending}
                  className="min-h-24"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Send To</label>
                <Select value={formData.recipient} onValueChange={(value) => setFormData({ ...formData, recipient: value })} disabled={sending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={sending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="flex-1 gap-2"
                >
                  {sending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Push & In-App Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 text-center text-muted-foreground">
            {notifications.length === 0 ? (
              <p>No notifications sent yet. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">Target: {notif.recipient}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold border whitespace-nowrap ${
                        notif.status === "sent"
                          ? "bg-green-100/30 text-green-700 border-green-200/50"
                          : "bg-blue-100/30 text-blue-700 border-blue-200/50"
                      }`}>
                        {notif.status.toUpperCase()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={() => toast({ title: "Edit Notification dialog not yet implemented", description: "This feature is coming soon." })}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {notif.status === "draft" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 gap-1.5"
                          onClick={() => toast({ title: "Notification sent successfully" })}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
