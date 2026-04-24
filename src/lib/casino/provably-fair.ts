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
   * Calculates the outcome for a game using the seeds and nonce.
   * Returns a value between 0 and 1.
   */
  static async calculateOutcome(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
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
    
    // Use first 4 bytes to generate a number (0 - 4,294,967,295)
    const int = (hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3];
    return (Math.abs(int) % 1000000) / 1000000;
  }

  /**
   * Specifically for Dice (0-100)
   */
  static async getDiceRoll(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const outcome = await this.calculateOutcome(serverSeed, clientSeed, nonce);
    return Math.floor(outcome * 10001) / 100; // Returns 0.00 to 100.00
  }

  /**
   * Specifically for Crash
   */
  static async getCrashMultiplier(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const outcome = await this.calculateOutcome(serverSeed, clientSeed, nonce);
    if (outcome < 0.03) return 1.00;
    const multiplier = (100 * (1 - 0.03)) / (1 - outcome);
    return Math.max(1.00, Math.floor(multiplier) / 100);
  }

  /**
   * Specifically for Roulette (0-36)
   */
  static async getRouletteNumber(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const outcome = await this.calculateOutcome(serverSeed, clientSeed, nonce);
    return Math.floor(outcome * 37); // Returns 0 to 36
  }

  /**
   * Specifically for Slots (Indices for each reel)
   */
  static async getSlotsResult(serverSeed: string, clientSeed: string, nonce: number, reelCount: number = 5, symbolsPerReel: number = 12): Promise<number[]> {
    const results: number[] = [];
    for (let i = 0; i < reelCount; i++) {
      const outcome = await this.calculateOutcome(serverSeed, clientSeed, nonce + i);
      results.push(Math.floor(outcome * symbolsPerReel));
    }
    return results;
  }
}
