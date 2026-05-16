import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { WalletService } from '@/lib/casino/wallet';

export async function GET() {
  try {
    const authData = await auth();
    let userId = authData.userId;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API][User][Balance] Auth check:', { 
        userId, 
        hasSession: !!authData.sessionId
      });
    }

    if (!userId && process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true') {
      userId = 'dev_user_fallback';
    }

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const wallet = await WalletService.getWallet(userId);
    
    return NextResponse.json({ 
      balance: wallet.balance,
      xp: wallet.xp,
      level: wallet.level
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API][User][Balance] Error:', error);
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
