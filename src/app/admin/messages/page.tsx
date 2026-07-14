"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
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
  recipient: { id: string; name: string | null; role: string };
};

type Conversation = {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastSentAt: string;
  unreadCount: number;
};

export default function AdminMessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch("/api/messages")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/admin/messages"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success) {
          // Group messages by conversation partner
          const convos: Map<string, Conversation> = new Map();
          for (const msg of d.data) {
            const partnerId = msg.sender.id === "me" ? msg.recipient.id : msg.sender.id;
            const partnerName = msg.sender.id === "me" ? msg.recipient.name : msg.sender.name;
            // Determine partner — the one that isn't the current user
            // Since we don't have "me" in the data, we need to figure out from role
            const isSender = msg.sender.role !== "CLIENT"; // Admin is sender if sender role isn't CLIENT
            const partner = isSender ? msg.recipient : msg.sender;
            const pid = partner.id;
            if (!convos.has(pid)) {
              convos.set(pid, {
                userId: pid,
                userName: partner.name || "Unknown",
                userRole: partner.role,
                lastMessage: msg.body,
                lastSentAt: msg.sentAt,
                unreadCount: 0,
              });
            }
            const convo = convos.get(pid)!;
            if (new Date(msg.sentAt) > new Date(convo.lastSentAt)) {
              convo.lastMessage = msg.body;
              convo.lastSentAt = msg.sentAt;
            }
            // Count unread — messages where the current user is recipient and isRead is false
            // We need to check if recipient is the current user
            if (!msg.isRead && !isSender) {
              convo.unreadCount++;
            }
          }
          setConversations(Array.from(convos.values()));
        }
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoading(false));
  }, [router]);

  const loadConversation = async (userId: string) => {
    setSelectedUser(userId);
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?with=${userId}`);
      const d = await res.json();
      if (d.success) {
        // Sort oldest first for chat display
        setMessages(d.data.reverse());
        // Mark as read
        setConversations((prev) =>
          prev.map((c) => c.userId === userId ? { ...c, unreadCount: 0 } : c)
        );
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setLoadingMessages(false);
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: selectedUser, body: text }),
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
        <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[600px]">
        {/* Conversation list */}
        <div className="lg:col-span-1 rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="p-3 border-b border-border/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversations</p>
          </div>
          <div className="overflow-y-auto h-[540px]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 m-2" />)
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Messages from clients will appear here.</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => loadConversation(c.userId)}
                  className={cn(
                    "w-full p-3 text-left border-b border-border/20 hover:bg-muted/40 transition-colors",
                    selectedUser === c.userId && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{c.userName}</p>
                    {c.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{fmtTime(c.lastSentAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card overflow-hidden flex flex-col">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-border/40 flex items-center gap-2">
                <button onClick={() => setSelectedUser(null)} className="lg:hidden">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold">
                  {conversations.find((c) => c.userId === selectedUser)?.userName || "Conversation"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-3/4" />)
                ) : (
                  messages.map((m) => {
                    const isSentByMe = m.sender.role !== "CLIENT"; // Admin sent it
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
                  placeholder="Type a reply..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={sending || !text.trim()} className="bg-gradient-to-r from-primary to-secondary">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-semibold">Select a conversation</p>
                <p className="text-xs text-muted-foreground mt-1">Choose a client from the list to view messages.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
