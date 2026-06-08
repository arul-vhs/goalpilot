import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2, Bot, User, RefreshCw, Calendar, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function FocusCoach({ collapsed }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your GoalPilot Focus Coach. I can help you schedule, add tasks, mark milestones completed, or optimize your calendar. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;
      if (!token) {
        toast.error("Authentication expired. Please log in again.");
        return;
      }

      // Convert history to format expected by backend
      const historyToSend = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyToSend
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Coach failed to reply.");
      }

      const data = await res.json();
      const assistantMsg: Message = { role: "assistant", content: data.content };
      
      setMessages((prev) => [...prev, assistantMsg]);

      // Invalidate router cache to refresh the active page data (Graph / Calendar / Dashboard)
      router.invalidate();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to send message to Focus Coach.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into a connection issue. Please make sure the backend Python server is running locally on port 8000." }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    sendMessage(actionText);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-white/5 transition text-sm text-foreground">
          <Sparkles className="h-4 w-4 text-primary-glow animate-pulse shrink-0" />
          {!collapsed && <span>Focus Coach</span>}
        </button>
      </SheetTrigger>
      
      <SheetContent className="glass-strong border-border text-foreground flex flex-col h-full w-[400px] sm:w-[480px]">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary-glow" /> Focus Coach
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            GoalPilot's AI Coach. Manage tasks and reschedule your calendar in natural language.
          </SheetDescription>
        </SheetHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 my-4 pr-3">
          <div className="space-y-4 pt-2">
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => {
                const isBot = m.role === "assistant";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2.5 ${!isBot ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs border ${
                      isBot 
                        ? "bg-primary/10 border-primary/20 text-primary-glow" 
                        : "bg-white/5 border-border text-muted-foreground"
                    }`}>
                      {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-xs leading-relaxed ${
                      isBot 
                        ? "bg-background/40 border border-border text-foreground rounded-tl-none" 
                        : "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-tr-none shadow-[0_2px_10px_rgba(168,85,247,0.1)]"
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {sending && (
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20 text-primary-glow">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-background/40 border border-border rounded-tl-none flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-glow" /> Focus Coach is thinking...
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick actions bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-t border-border pt-4 scrollbar-none">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("Reschedule all my tasks")}
            className="text-[10px] h-7 border-border hover:bg-white/5 shrink-0 flex gap-1"
          >
            <RefreshCw className="h-2.5 w-2.5 text-primary-glow" /> Reschedule Calendar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("List all my tasks")}
            className="text-[10px] h-7 border-border hover:bg-white/5 shrink-0 flex gap-1"
          >
            <Calendar className="h-2.5 w-2.5 text-primary-glow" /> Show Agenda
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("Add a task to write tests")}
            className="text-[10px] h-7 border-border hover:bg-white/5 shrink-0 flex gap-1"
          >
            <Plus className="h-2.5 w-2.5 text-primary-glow" /> Add task
          </Button>
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 pt-2 border-t border-border"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Focus Coach..."
            disabled={sending}
            className="bg-background/40 text-xs h-10 border-border"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !input.trim()}
            className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
