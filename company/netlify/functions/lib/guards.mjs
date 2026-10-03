export const MAX_MESSAGES = 24;
export const MAX_LEN = 2000;
const ROLES = new Set(['user', 'assistant']);

export function validateChatRequest(body) {
  if (!body || !Array.isArray(body.messages)) {
    return { ok: false, error: 'messages ontbreekt of is geen array' };
  }
  const { messages } = body;
  if (messages.length < 1 || messages.length > MAX_MESSAGES) {
    return { ok: false, error: `messages moet 1 tot ${MAX_MESSAGES} items hebben` };
  }
  for (const m of messages) {
    if (!m || !ROLES.has(m.role) || typeof m.content !== 'string') {
      return { ok: false, error: 'elk bericht heeft role (user|assistant) en string content' };
    }
    if (m.content.length < 1 || m.content.length > MAX_LEN) {
      return { ok: false, error: `content moet 1 tot ${MAX_LEN} tekens zijn` };
    }
  }
  return { ok: true };
}
