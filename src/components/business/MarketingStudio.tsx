import { useState } from "react";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Kind = "facebook" | "instagram" | "hashtags" | "ideas" | "video";

const TOOLS: { kind: Kind; title: string; desc: string }[] = [
  { kind: "facebook", title: "Facebook Post", desc: "Engaging long-form post with a CTA." },
  { kind: "instagram", title: "Instagram Caption", desc: "Hook + sensory copy + tags." },
  { kind: "hashtags", title: "Hashtag Generator", desc: "25 mixed-volume travel hashtags." },
  { kind: "ideas", title: "Marketing Ideas", desc: "8 creative campaign ideas." },
  { kind: "video", title: "Promo Video Script", desc: "30-second [VISUAL]/[VOICEOVER] script." },
];

export function MarketingStudio({ business }: { business: { name: string; type: string } }) {
  const [kind, setKind] = useState<Kind>("facebook");
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true); setErr(null); setOutput("");
    try {
      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name: business.name, type: business.type, topic }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
        if (res.status === 402) throw new Error("AI credits exhausted on this workspace.");
        throw new Error(await res.text());
      }
      const data = (await res.json()) as { text: string };
      setOutput(data.text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" /> AI Marketing Studio
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate on-brand content for {business.name} in seconds — powered by Luxor AI.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {TOOLS.map((t) => (
          <button
            key={t.kind}
            onClick={() => setKind(t.kind)}
            className={`rounded-xl border p-4 text-left transition ${kind === t.kind ? "border-gold bg-gold/10" : "border-border/60 bg-card/50 hover:border-gold/40"}`}
          >
            <div className="text-sm font-semibold">{t.title}</div>
            <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Label>Topic / angle</Label>
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. sunset rooftop dinner overlooking Luxor Temple" />
        <button onClick={generate} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </button>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      {output && (
        <div className="relative rounded-xl border border-border/60 bg-card/60 p-5">
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md border border-gold/40 px-2 py-1 text-xs text-gold hover:bg-gold/10">
            <Copy className="h-3 w-3" /> Copy
          </button>
          <Textarea readOnly value={output} className="min-h-[260px] border-0 bg-transparent resize-y" />
        </div>
      )}
    </div>
  );
}
