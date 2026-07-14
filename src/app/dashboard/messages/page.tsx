"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Message = {
  id: string;
  body: string;
  subject: string | null;
  sentAt: string;
  isRead: boolean;
  sender: { id: string; name: string | null; role: string };
  recipient: { id: true; name: string | null; role: string };
};

export default function DashboardMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [staffId, setStaffId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch("/api/messages")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard/messages"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success && d.data.length > 0) {
          // Find the staff member (non-CLIENT) to message
          const staffMsg = d.data.find((m: Message) => m.sender.role !== "CLIENT" || m.recipient.role !== "CLIENT");
          const staff = staffMsg
            ? (staffMsg.sender.role !== "CLIENT" ? staffMsg.sender : staffMsg.recipient)
            : null;
          if (staff) {
            setStaffId(staff.id);
            // Load full conversation
            loadConversation(staff.id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        toast.error("Failed to load messages");
        setLoading(false);
      });
  }, [router]);

  const loadConversation = async (partnerId: string) => {
    try {
      const res = await fetch(`/api/messages?with=${partnerId}`);
      const d = await res.json();
      if (d.success) {
        setMessages(d.data.reverse());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !staffId) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: staffId, body: text }),
      });
      const d = await res.json();
      if (d.success) {
        setMessages((prev) => [...prev, d.data]);
        setText("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        toast.error("Failed to send", { description: d.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
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

      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="p-4 border-b border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
            DC
          </div>
          <div>
            <p className="text-sm font-semibold">Your Care Team</p>
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
              <p className="text-sm text-muted-foreground">No messages yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Start a conversation with your care team below.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isSentByMe = m.sender.role === "CLIENT"; // Client sent it
              return (
                <div key={m.id} className={cn("flex", isSentByMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] p-3 rounded-2xl text-sm",
                    isSentByMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    <p>{m.body}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>{fmtTime(m.sentAt)}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="p-3 border-t border-border/40 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending || !staffId}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={sending || !text.trim() || !staffId} className="bg-gradient-to-r from-primary to-secondary">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      {!staffId && !loading && (
        <div className="mt-4 p-4 rounded-xl bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            You&apos;ll be able to message your dietitian once they&apos;re assigned to your account after your first consultation.
          </p>
          <Link href="/booking" className="inline-block mt-2">
            <Button size="sm" variant="outline">Book consultation</Button>
          </Link>
        </div>
      )}
    </>
  );
}
