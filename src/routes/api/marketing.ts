import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
type Kind =
  | "facebook"
  | "instagram"
  | "hashtags"
  | "ideas"
  | "video";

const PROMPTS: Record<Kind, (b: { name: string; type: string; topic: string }) => string> = {
  facebook: (b) =>
    `Write an engaging Facebook post (3-5 short paragraphs, warm and inviting, with 2-3 emojis) for "${b.name}", a ${b.type} in Luxor, Egypt. Topic: ${b.topic}. Include a clear call to action at the end.`,
  instagram: (b) =>
    `Write an Instagram caption for "${b.name}" (${b.type} in Luxor, Egypt) about: ${b.topic}. Keep it under 120 words, evocative, sensory, with a hook in the first line and 5-8 relevant hashtags at the end.`,
  hashtags: (b) =>
    `Generate 25 highly relevant hashtags for "${b.name}", a ${b.type} in Luxor, Egypt, focused on: ${b.topic}. Mix popular travel hashtags with niche Luxor / Egypt tourism tags. Return only the hashtags separated by spaces.`,
  ideas: (b) =>
    `Suggest 8 creative marketing campaign ideas for "${b.name}", a ${b.type} in Luxor, Egypt. Focus on: ${b.topic}. Format as a numbered markdown list with a bold title and 1-2 sentence description each.`,
  video: (b) =>
    `Write a 30-second promotional video script for "${b.name}", a ${b.type} in Luxor, Egypt, themed around: ${b.topic}. Format with [VISUAL] and [VOICEOVER] lines. End with a strong tagline and CTA.`,
};

export const Route = createFileRoute("/api/marketing")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { kind: Kind; name: string; type: string; topic: string };
        if (!body?.kind || !PROMPTS[body.kind]) {
          return new Response("Invalid kind", { status: 400 });
        }
const key = process.env.GROQ_API_KEY;
if (!key) return new Response("Missing GROQ_API_KEY", { status: 500 });
const prompt = PROMPTS[body.kind]({
  name: body.name || "this business",
  type: body.type || "business",
  topic: body.topic || "our brand and visitor experience",
});

const { text } = await generateText({
  model: groq("llama-3.3-70b-versatile"),
          system:
            "You are Luxor AI Marketing Studio, a senior social media strategist for Luxor, Egypt tourism businesses. Your writing is vivid, culturally grounded, and conversion-focused.",
          prompt,
        });
        return Response.json({ text });
      },
    },
  },
});
