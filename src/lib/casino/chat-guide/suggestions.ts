// Matches the "under 45 characters" instruction given to the model in
// instructions.ts — enforced here too so a malformed or manipulated model
// response can't render a degenerate oversized chip in the client.
const SUGGESTION_MAX_LENGTH = 45;

export function extractSuggestionsFromText(rawText: string): {
  cleanText: string;
  suggestions: string[];
} {
  if (!rawText) {
    return { cleanText: '', suggestions: [] };
  }

  const match = rawText.match(/<<<SUGGESTIONS:\s*(\[.*?\])\s*>>>/s);
  if (!match) {
    return { cleanText: rawText.trim(), suggestions: [] };
  }

  const cleanText = rawText.replace(match[0], '').trim();
  let suggestions: string[] = [];
  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) {
      suggestions = parsed
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim().slice(0, SUGGESTION_MAX_LENGTH))
        .slice(0, 3);
    }
  } catch {
    suggestions = [];
  }

  return { cleanText, suggestions };
}

export class SuggestionStreamFilter {
  private buffer = '';
  private isCapturing = false;
  private suggestions: string[] = [];

  processChunk(chunk: string): { textToEmit: string; suggestionsFound: string[] | null } {
    this.buffer += chunk;

    if (!this.isCapturing) {
      const idx = this.buffer.indexOf('<<<SUGGESTIONS:');
      if (idx !== -1) {
        const textToEmit = this.buffer.slice(0, idx);
        this.buffer = this.buffer.slice(idx);
        this.isCapturing = true;

        const closeIdx = this.buffer.indexOf('>>>');
        if (closeIdx !== -1) {
          const rawBlock = this.buffer.slice(0, closeIdx + 3);
          this.buffer = this.buffer.slice(closeIdx + 3);
          this.isCapturing = false;
          const { suggestions } = extractSuggestionsFromText(rawBlock);
          this.suggestions = suggestions;
          return { textToEmit, suggestionsFound: suggestions };
        }
        return { textToEmit, suggestionsFound: null };
      }

      // Check if any suffix of this.buffer is a prefix of '<<<SUGGESTIONS:'
      for (let len = Math.min(this.buffer.length, 15); len >= 1; len--) {
        const candidate = this.buffer.slice(-len);
        if ('<<<SUGGESTIONS:'.startsWith(candidate)) {
          const textToEmit = this.buffer.slice(0, -len);
          this.buffer = candidate;
          return { textToEmit, suggestionsFound: null };
        }
      }

      const textToEmit = this.buffer;
      this.buffer = '';
      return { textToEmit, suggestionsFound: null };
    } else {
      const closeIdx = this.buffer.indexOf('>>>');
      if (closeIdx !== -1) {
        const rawBlock = this.buffer.slice(0, closeIdx + 3);
        this.buffer = this.buffer.slice(closeIdx + 3);
        this.isCapturing = false;
        const { suggestions } = extractSuggestionsFromText(rawBlock);
        this.suggestions = suggestions;
        return { textToEmit: '', suggestionsFound: suggestions };
      }
      return { textToEmit: '', suggestionsFound: null };
    }
  }

  flush(): { textToEmit: string; suggestionsFound: string[] | null } {
    if (this.isCapturing || this.buffer.includes('<<<SUGGESTIONS:')) {
      const { suggestions } = extractSuggestionsFromText(this.buffer);
      this.buffer = '';
      return { textToEmit: '', suggestionsFound: suggestions.length > 0 ? suggestions : null };
    }
    const textToEmit = this.buffer;
    this.buffer = '';
    return { textToEmit, suggestionsFound: this.suggestions.length > 0 ? this.suggestions : null };
  }
}
