'use client';
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { CasinoLogger } from '@/lib/casino/logger';
interface Props {
  children: ReactNode;
  gameName: string;
}
interface State {
  hasError: boolean;
}
export class GameErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }
  public componentDidCatch(error: Error) {
    // Pass the raw Error instance (not a wrapper object) so CasinoLogger.error()
    // dispatches via Sentry.captureException — preserving the native stack trace.
    // errorInfo.componentStack is intentionally dropped: CasinoLogger.error() has no
    // extra-context parameter, and inventing one for this single call site would be
    // a wider API change than this fix warrants.
    CasinoLogger.error(this.props.gameName, 'Uncaught error', error);
  }
  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };
  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass"
          style={{
            padding: '48px',
            borderRadius: '32px',
            textAlign: 'center',
            background: 'hsla(var(--destructive), 0.05)',
            border: '1px solid hsla(var(--destructive), 0.2)',
            margin: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'hsla(var(--destructive), 0.1)',
              color: 'hsl(var(--destructive))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
            Game Encountered an Error
          </h2>
          <p
            style={{
              color: 'hsl(var(--text-muted))',
              marginBottom: '32px',
              maxWidth: '400px',
              margin: '0 auto 32px',
            }}
          >
            The {this.props.gameName} engine stopped unexpectedly. Your balance is safe.
          </p>
          <button onClick={this.handleReset} className="btn btn-primary" style={{ gap: '8px' }}>
            <RefreshCw size={18} /> RELOAD GAME
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
