/**
 * Provably Fair Engine (Browser Compatible)
 * Uses a deterministic hash-like function for browser environments
 */
export class ProvablyFairEngine {
  /**
   * Generates a new server seed and its public hash.
   */
  static async generateServerSeed(): Promise<{ seed: string; hash: string }> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const seed = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    const msgUint8 = new TextEncoder().encode(seed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { seed, hash };
  }

  /**
   * Verifies if a seed matches its hash.
   */
  static async verifyHash(seed: string, hash: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const msgUint8 = encoder.encode(seed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return calculatedHash === hash;
  }

  /**
   * Calculates the outcome for a game using the seeds and nonce.
   * Returns a value between 0 and 1.
   */
  static async calculateOutcome(serverSeed: string, clientSeed: string, nonce: number): Promise<{ result: number; hash: string }> {
    if (!serverSeed || typeof serverSeed !== 'string') throw new Error('Invalid server seed');
    if (!clientSeed || typeof clientSeed !== 'string' || clientSeed.trim().length === 0) {
      throw new Error('Client seed cannot be empty');
    }
    if (typeof nonce !== 'number' || isNaN(nonce)) throw new Error('Invalid nonce');

    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(serverSeed),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(combined));
    const hashArray = Array.from(new Uint8Array(signature));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Use first 4 bytes to generate an unsigned 32-bit integer (0 - 4,294,967,295)
    const int = ((hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3]) >>> 0;
    
    // Divide by 2^32 to get a number between 0 and 1
    return { 
      result: int / Math.pow(2, 32),
      hash 
    };
  }

  /**
   * Helper to generate HMAC for UI display
   */
  static async generateHMAC(serverSeed: string, data: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(serverSeed),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }


  /**
   * Specifically for Dice (0-100)
   */
  static async getDiceRoll(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const { result } = await this.calculateOutcome(serverSeed, clientSeed, nonce);
    return Math.floor(result * 10001) / 100; // Returns 0.00 to 100.00
  }


  /**
   * Specifically for Crash
   */
  static async getCrashMultiplier(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const { result } = await this.calculateOutcome(serverSeed, clientSeed, nonce);
    if (result < 0.03) return 1.00;
    const multiplier = (100 * (1 - 0.03)) / (1 - result);
    return Math.max(1.00, Math.floor(multiplier) / 100);
  }


  /**
   * Specifically for Roulette (0-36)
   */
  static async getRouletteNumber(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const { result } = await this.calculateOutcome(serverSeed, clientSeed, nonce);
    return Math.floor(result * 37); // Returns 0 to 36
  }


  /**
   * Specifically for Slots (Indices for each reel)
   */
  static async getSlotsResult(serverSeed: string, clientSeed: string, nonce: number, reelCount: number = 5, symbolsPerReel: number = 12): Promise<number[]> {
    const results: number[] = [];
    for (let i = 0; i < reelCount; i++) {
      const { result } = await this.calculateOutcome(serverSeed, clientSeed, nonce + i);
      results.push(Math.floor(result * symbolsPerReel));
    }
    return results;
  }

  /**
   * Specifically for Blackjack (Fisher-Yates shuffle indices for 6-deck shoe)
   * Returns swap indices for each position in the deck (312 cards = 6 decks * 52)
   * Each index represents the position to swap with for that iteration
   */
  static async getBlackjackDeal(serverSeed: string, clientSeed: string, nonce: number, deckSize: number = 312): Promise<number[]> {
    const swapIndices: number[] = [];

    // Fisher-Yates: for each position i, generate a random swap index j where i <= j < deckSize
    for (let i = 0; i < deckSize; i++) {
      const { result } = await this.calculateOutcome(serverSeed, clientSeed, nonce + i);
      // Map [0, 1) to [i, deckSize) to get valid swap index
      const jIndex = i + Math.floor(result * (deckSize - i));
      swapIndices.push(jIndex);
    }

    return swapIndices;
  }

}
