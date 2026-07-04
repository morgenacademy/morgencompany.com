export function sse(obj) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}
