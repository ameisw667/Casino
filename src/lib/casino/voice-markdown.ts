/**
 * Sanitizes markdown text into clean speakable prose
 * Strips delimiter markers, markdown tables, URLs, backticks, asterisks, headers.
 */
export function cleanMarkdownForSpeech(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Remove <<<SUGGESTIONS: [...]>>> block
  cleaned = cleaned.replace(/<<<SUGGESTIONS:\s*\[.*?\]\s*>>>/gs, '');

  // 2. Remove code blocks ```...``` and inline code `...`
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // 3. Remove markdown tables and separator rows
  cleaned = cleaned.replace(/[-:|]{3,}/g, ' ');
  cleaned = cleaned.replace(/\|/g, ' ');

  // 4. Remove links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 5. Remove bold/italic markers (*, **, _, __)
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');
  cleaned = cleaned.replace(/_(.*?)_/g, '$1');

  // 6. Remove headers (#, ##, etc.)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // 7. Remove list bullets (-, *, +) and numbered lists (1., 2.)
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');

  // 8. Remove blockquotes (>)
  cleaned = cleaned.replace(/^\s*>+\s?/gm, '');

  // 9. Normalize multiple spaces and newlines
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}
