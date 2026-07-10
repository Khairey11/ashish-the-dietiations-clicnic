"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Message = {
  id: string;
  body: string;
  sentAt: string;
  isRead: boolean;
};

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  lastSentAt: string;
};

export default function DashboardMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    // For now, messages are fetched from the dashboard API (notifications act as messages)
    fetch("/api/client/dashboard")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard/messages"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success) {
          // Convert notifications to message-like format
          const msgs = (d.data.recentNotifications || []).map((n: any) => ({
            id: n.id,
            body: n.title + (n.body ? ": " + n.body : ""),
            sentAt: n.createdAt,
            isRead: n.isRead,
          }));
          setMessages(msgs);
        }
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoading(false));
  }, [router]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    // Optimistic add
    const tempMsg = { id: "temp-" + Date.now(), body: text, sentAt: new Date().toISOString(), isRead: false };
    setMessages((prev) => [tempMsg, ...prev]);
    setText("");
    // In a real implementation, this would POST to /api/messages
    // For now, just simulate
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent", { description: "Your dietitian will respond within 24 hours." });
    }, 500);
  };

  const fmtTime = (s: string) => {
    const d = new Date(s);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat area */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                DC
              </div>
              <div>
                <p className="text-sm font-semibold">The Dietitian's Clinic</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">● Online — typically replies within 24h</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-3/4" />)
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No messages yet. Start a conversation below.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={cn("flex", "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] p-3 rounded-2xl text-sm",
                      "bg-muted/60 text-foreground"
                    )}>
                      <p>{m.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{fmtTime(m.sentAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={send} className="p-3 border-t border-border/40 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={sending || !text.trim()} className="bg-gradient-to-r from-primary to-secondary">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-border/40 bg-card">
            <h3 className="text-sm font-semibold mb-3">Your care team</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                DC
              </div>
              <div>
                <p className="text-sm font-semibold">Care Team</p>
                <p className="text-xs text-muted-foreground">Dietitians & support</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Send a message to your care team with any questions about your diet plan, progress, or appointments. We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
