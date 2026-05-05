'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
interface Props {
  children: ReactNode;
  gameName: string;
}
interface State {
  hasError: boolean;
}
export class GameErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[${this.props.gameName}] Uncaught error:`, error, errorInfo);
  }
  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };
  public render() {
    if (this.state.hasError) {
      return (
        <div className="glass" style={{ 
          padding: '48px', 
          borderRadius: '32px', 
          textAlign: 'center',
          background: 'hsla(var(--destructive), 0.05)',
          border: '1px solid hsla(var(--destructive), 0.2)',
          margin: '24px'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: 'hsla(var(--destructive), 0.1)', 
            color: 'hsl(var(--destructive))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Game Encountered an Error</h2>
          <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
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