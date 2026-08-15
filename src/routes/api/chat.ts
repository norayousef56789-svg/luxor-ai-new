import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";

const SYSTEM_PROMPT = `
You are Luxor AI, an AI travel assistant for Luxor, Egypt.

IMPORTANT LANGUAGE RULES:
- If the user writes in Arabic, answer in Arabic.
- If the user writes in English, answer in English.
- If the user mixes Arabic and English, answer in the same mixed style.
- Never force English if the user is speaking Arabic.
- Be friendly, helpful, and natural.

You help visitors with:
- Tourist attractions in Luxor.
- Hotels and restaurants.
- Nile cruises.
- Transportation.
- Travel plans.
- Local recommendations.
- Historical information.

If the user sends an image of a tourist attraction:
- Identify the attraction if you can.
- Explain its historical importance.
- Give useful information for tourists.
- If you are not sure what the image shows, say that honestly.
- Never invent historical information.

If you don't know something, say so honestly instead of making it up.
`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as {
          messages: UIMessage[];
        };

        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }

        const result = streamText({
          model: google("gemini-3.6-flash"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
        });
      },
    },
  },
});