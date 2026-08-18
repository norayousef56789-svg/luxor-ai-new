import { useState } from "react";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Kind =
  | "facebook"
  | "instagram"
  | "hashtags"
  | "ideas"
  | "video";

export function MarketingStudio({
  business,
}: {
  business: { name: string; type: string };
}) {
  const { t } = useTranslation();

  const [kind, setKind] = useState<Kind>("facebook");
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tools: {
    kind: Kind;
    title: string;
    desc: string;
  }[] = [
    {
      kind: "facebook",
      title: t("business.toolFacebookTitle"),
      desc: t("business.toolFacebookDesc"),
    },
    {
      kind: "instagram",
      title: t("business.toolInstagramTitle"),
      desc: t("business.toolInstagramDesc"),
    },
    {
      kind: "hashtags",
      title: t("business.toolHashtagsTitle"),
      desc: t("business.toolHashtagsDesc"),
    },
    {
      kind: "ideas",
      title: t("business.toolIdeasTitle"),
      desc: t("business.toolIdeasDesc"),
    },
    {
      kind: "video",
      title: t("business.toolVideoTitle"),
      desc: t("business.toolVideoDesc"),
    },
  ];

  const generate = async () => {
    setLoading(true);
    setErr(null);
    setOutput("");

    try {
      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind,
          name: business.name,
          type: business.type,
          topic,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(
            t("business.marketingRateLimit"),
          );
        }

        if (res.status === 402) {
          throw new Error(
            t("business.marketingCreditsExhausted"),
          );
        }

        throw new Error(
          t("business.marketingGenerationFailed"),
        );
      }

      const data = (await res.json()) as {
        text: string;
      };

      setOutput(data.text);
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : t("business.marketingGenerationFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />

          {t("business.marketingTitle")}
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          {t("business.marketingDesc", {
            name: business.name,
          })}
        </p>
      </div>

      {/* Marketing Tools */}
      <div className="grid gap-3 md:grid-cols-5">
        {tools.map((tool) => (
          <button
            key={tool.kind}
            onClick={() => setKind(tool.kind)}
            className={`rounded-xl border p-4 text-left transition ${
              kind === tool.kind
                ? "border-gold bg-gold/10"
                : "border-border/60 bg-card/50 hover:border-gold/40"
            }`}
          >
            <div className="text-sm font-semibold">
              {tool.title}
            </div>

            <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
              {tool.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Topic */}
      <div className="space-y-3">
        <Label>
          {t("business.marketingTopicLabel")}
        </Label>

        <Input
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          placeholder={t(
            "business.marketingTopicPlaceholder",
          )}
        />

        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}

          {loading
            ? t("common.pleaseWait")
            : t("business.marketingGenerate")}
        </button>
      </div>

      {/* Error */}
      {err && (
        <p className="text-sm text-destructive">
          {err}
        </p>
      )}

      {/* Generated Content */}
      {output && (
        <div className="relative rounded-xl border border-border/60 bg-card/60 p-5">

          <button
            onClick={() =>
              navigator.clipboard.writeText(output)
            }
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md border border-gold/40 px-2 py-1 text-xs text-gold hover:bg-gold/10"
          >
            <Copy className="h-3 w-3" />

            {t("business.marketingCopy")}
          </button>

          <Textarea
            readOnly
            value={output}
            className="min-h-[260px] border-0 bg-transparent resize-y"
          />
        </div>
      )}
    </div>
  );
}