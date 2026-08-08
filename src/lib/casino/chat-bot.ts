import { useCasinoStore } from '@/store/useCasinoStore';

const BOT_NAMES = ['LuckyWhale', 'DiceKing', 'CryptoVibe', 'HighRoller', 'MoonShot', 'ZenGambler', 'VibeMaster', 'SlotQueen', 'EtherEater', 'BullRun'];
const RANKS = ['VIP', 'LEGEND', 'PRO', 'WHALE', 'GOLD', 'PLATINUM'];

const MESSAGES = [
  "Let's gooo!",
  "Big win incoming 🚀",
  "Dice is hot right now",
  "Just cashed out at 5x on Crash, nice",
  "Anyone tried the new slots?",
  "Road to 10k starts now",
  "Rip that multiplier",
  "Casino vibe is elite today",
  "GL everyone!",
  "Nice win @user",
  "Whew, that was close",
  "Max bet or go home",
  "Strategy pays off",
  "Loving the new HSL design",
  "Is Crash rigged? Jk, just lost lol",
  "Daily rewards are up!",
  "Who's the top on leaderboard?",
  "10x on Roulette, black is life",
];

export class ChatBotService {
  private static interval: NodeJS.Timeout | null = null;

  static start() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      const { addChatMessage, addLiveBet } = useCasinoStore.getState();
      
      // Randomly decide to send a message (15% chance every interval)
      if (Math.random() > 0.85) {
        const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
        const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        
        addChatMessage({
          user: name,
          rank: rank,
          message: message
        });
      }

      // Randomly decide to simulate a bet (60% chance every interval)
      if (Math.random() > 0.4) {
        const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        const games = ['DICE', 'CRASH', 'ROULETTE', 'SLOTS'];
        const game = games[Math.floor(Math.random() * games.length)];
        const amount = Math.floor(Math.random() * 100) + 1;
        const isWin = Math.random() > 0.6;
        const multiplier = isWin ? (Math.random() * 5 + 1.1) : 0;
        const payout = isWin ? amount * multiplier : 0;

        addLiveBet({
          user: name,
          game,
          amount,
          multiplier: isWin ? multiplier : 0,
          payout,
          isWin
        });

        // Contribute to community goal
        const { communityWagered } = useCasinoStore.getState();
        const newWagered = communityWagered + amount;
        useCasinoStore.setState({ communityWagered: newWagered });
      }
    }, 8000);
  }

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  static shoutout(user: string, amount: number, multiplier: number) {
    const { addChatMessage } = useCasinoStore.getState();
    
    let emoji = '🎉';
    let vibe = 'BIG WIN';
    
    if (multiplier >= 100) { 
      emoji = '🐋🔥'; 
      vibe = 'INSANE WHALE WIN';
    } else if (multiplier >= 50) {
      emoji = '🚀';
      vibe = 'MOONSHOT';
    }

    addChatMessage({
      user: 'System',
      rank: 'MOD',
      message: `${emoji} ${vibe}! ${user} just won $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${multiplier.toFixed(2)}x)!`,
      isSystem: true,
      isWin: true
    });
  }

  static handleCommand(user: string, command: string) {
    const { addChatMessage, balance, level, rank } = useCasinoStore.getState();
    const normalized = command.normalize('NFC');
    const cmd = normalized.toLowerCase().split(' ')[0];

    switch (cmd) {
      case '/tip':
        addChatMessage({
          user: 'RoyaleGuard',
          rank: 'MOD',
          message: `@${user}, tips are currently disabled in this demo. Try /stats instead!`,
          isSystem: true
        });
        break;
      case '/stats':
        addChatMessage({
          user: 'RoyaleGuard',
          rank: 'MOD',
          message: `📊 @${user}'s Stats: Lvl ${level} ${rank} | Balance: $${balance.toFixed(2)}`,
          isSystem: true
        });
        break;
      case '/help':
        addChatMessage({
          user: 'RoyaleGuard',
          rank: 'MOD',
          message: `Available commands: /stats, /tip`,
          isSystem: true
        });
        break;
      default:
        addChatMessage({
          user: 'RoyaleGuard',
          rank: 'MOD',
          message: `Unknown command: ${cmd}. Type /help for a list of commands.`,
          isSystem: true
        });
        return false;
    }
    return true;
  }
}
