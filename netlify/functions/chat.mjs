// netlify/functions/chat.mjs
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildCard } from './lib/kb.mjs';
import { presenteerAdviesTool } from './lib/tool.mjs';
import { validateChatRequest } from './lib/guards.mjs';
import { sse } from './lib/sse.mjs';

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const check = validateChatRequest(body);
  if (!check.ok) return json({ error: check.error }, 400);

  const system = buildSystemPrompt();
  const messages = body.messages;

  const client = new Anthropic(); // leest ANTHROPIC_API_KEY uit env; lazy zodat cold start niet faalt zonder key

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => controller.enqueue(encoder.encode(sse(obj)));
      try {
        const claude = client.messages.stream({
          model: 'claude-sonnet-5',
          max_tokens: 1024,
          thinking: { type: 'disabled' },
          system,
          tools: [presenteerAdviesTool],
          messages,
        });

        claude.on('text', (delta) => send({ type: 'text', text: delta }));

        const final = await claude.finalMessage();
        const toolUse = final.content.find(
          (b) => b.type === 'tool_use' && b.name === 'presenteer_advies'
        );
        if (toolUse) {
          const card = buildCard(toolUse.input);
          if (card) send({ type: 'advies', card });
        }
        send({ type: 'done' });
      } catch (err) {
        console.error('chat error', err);
        send({ type: 'error', message: 'chat_unavailable' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    },
  });
};
