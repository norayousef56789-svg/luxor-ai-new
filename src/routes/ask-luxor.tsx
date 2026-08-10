import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Camera, Send, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/ask-luxor")({
  head: () => ({
    meta: [
      { title: "Ask Luxor AI — Your AI guide to Luxor" },
      {
        name: "description",
        content:
          "Ask anything about Luxor — temples, tombs, tickets, dinner reservations, custom itineraries. Powered by Luxor AI.",
      },
      { property: "og:title", content: "Ask Luxor AI" },
      {
        property: "og:description",
        content: "An AI Egyptologist in your pocket.",
      },
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
  const transport = useRef(
    new DefaultChatTransport({ api: "/api/chat" }),
  );

  const { messages, sendMessage, status } = useChat({
    transport: transport.current,
  });

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading =
    status === "submitted" || status === "streaming";

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const submit = async (text: string) => {
    const value = text.trim();

    if ((!value && !selectedImage) || isLoading) {
      return;
    }

    setInput("");

    if (selectedImage) {
      const imageUrl = await fileToDataUrl(selectedImage);

      await sendMessage({
        text:
          value ||
          "What is this place? Tell me about this tourist attraction.",
        files: [
          {
            type: "file",
            mediaType: selectedImage.type,
            url: imageUrl,
            filename: selectedImage.name,
          },
        ],
      });

      setSelectedImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      await sendMessage({
        text: value,
      });
    }
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-180px)] min-h-[600px] max-w-3xl flex-col px-4 py-10 md:py-14">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-midnight/50 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
          <Sparkles className="h-3.5 w-3.5" />
          Luxor AI
        </div>

        <h1 className="mt-4 font-display text-3xl md:text-4xl">
          Ask anything about Luxor
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Temples, tombs, tickets, tables for two.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto rounded-2xl border border-border/60 bg-card/40 p-4 md:p-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold">
              <Sparkles className="h-7 w-7" />
            </div>

            <p className="max-w-md text-muted-foreground">
              I'm your Egyptologist-in-residence. Try one of these to get
              started:
            </p>

            <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => submit(suggestion)}
                  className="rounded-xl border border-border/60 bg-card p-4 text-left text-sm transition hover:border-gold/50 hover:bg-card/80"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}

        {isLoading &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="text-sm italic text-gold/80">
              Luxor is thinking…
            </div>
          )}
      </div>

      {selectedImage && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-gold/40 bg-card px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-gold" />
            <span className="max-w-[250px] truncate">
              {selectedImage.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedImage(null);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="rounded-lg p-1 hover:bg-muted"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
        className="mt-4 flex items-end gap-2 rounded-2xl border border-border/60 bg-card p-2 transition focus-within:border-gold/60"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/60 transition hover:border-gold/60 disabled:opacity-40"
          aria-label="Take a photo"
          title="Take a photo"
        >
          <Camera className="h-4 w-4" />
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(input);
            }
          }}
          placeholder="Ask about Karnak, plan a 4-day trip, find a sunset rooftop…"
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
        />

        <button
          type="submit"
          disabled={
            isLoading || (!input.trim() && !selectedImage)
          }
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold disabled:opacity-40 disabled:shadow-none"
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

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-gold text-primary-foreground px-4 py-2.5 text-sm shadow-gold"
            : "max-w-[85%] text-foreground/90 text-sm leading-relaxed"
        }
      >
        <div className="space-y-3">
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              return (
                <div key={index} className="whitespace-pre-wrap">
                  {part.text}
                </div>
              );
            }

            if (part.type === "file") {
              if (part.mediaType.startsWith("image/")) {
                return (
                  <img
                    key={index}
                    src={part.url}
                    alt="Uploaded image"
                    className="max-w-full rounded-xl max-h-80 object-contain"
                  />
                );
              }
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}