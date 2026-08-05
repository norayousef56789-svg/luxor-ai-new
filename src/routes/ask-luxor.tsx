import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ask-luxor")({
  head: () => ({
    meta: [
      { title: "Ask Luxor AI — Your AI guide to Luxor" },
      { name: "description", content: "Ask anything about Luxor — temples, tombs, tickets, dinner reservations, custom itineraries. Powered by Luxor AI." },
      { property: "og:title", content: "Ask Luxor AI" },
      { property: "og:description", content: "An AI Egyptologist in your pocket." },
    ],
  }),
  component: AskLuxorPage,
});

const SUGGESTIONS = [
  "Plan a romantic 3-day trip to Luxor",
  "Which tombs should I visit in the Valley of the Kings?",
  "Best sunset spot on the Nile?",
  "How do I book a hot-air balloon ride?",
];

function AskLuxorPage() {
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status } = useChat({
    transport: transport.current,
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (!isLoading) inputRef.current?.focus(); }, [isLoading]);

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14 flex flex-col h-[calc(100vh-180px)] min-h-[600px]">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-midnight/50 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
          <Sparkles className="h-3.5 w-3.5" /> Luxor AI
        </div>
        <h1 className="mt-4 font-display text-3xl md:text-4xl">Ask anything about Luxor</h1>
        <p className="mt-2 text-sm text-muted-foreground">Temples, tombs, tickets, tables for two.</p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card/40 p-4 md:p-6 space-y-5"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="text-muted-foreground max-w-md">
              I'm your Egyptologist-in-residence. Try one of these to get started:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left rounded-xl border border-border/60 bg-card hover:border-gold/50 hover:bg-card/80 transition p-4 text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <Message key={m.id} message={m} />)
        )}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="text-sm text-gold/80 italic">Luxor is thinking…</div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="mt-4 flex items-end gap-2 rounded-2xl border border-border/60 bg-card p-2 focus-within:border-gold/60 transition"
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); }
          }}
          placeholder="Ask about Karnak, plan a 4-day trip, find a sunset rooftop…"
          className="flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none max-h-40"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold disabled:opacity-40 disabled:shadow-none"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-gold text-primary-foreground px-4 py-2.5 text-sm shadow-gold"
            : "max-w-[85%] text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap"
        }
      >
        {text}
      </div>
    </div>
  );
}
