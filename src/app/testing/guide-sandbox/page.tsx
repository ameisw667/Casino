import { Metadata } from 'next';
import GuideSandboxClient from './GuideSandboxClient';

export const metadata: Metadata = {
  title: 'Royale Guide UI Sandbox & Options Showcase | Casino Royale',
  description:
    'Interaktive Sandbox zur Gegenüberstellung von Option A (Typographic Clean), Option B (Monogramm / Ticker) und Option C (Editorial 2-Zeiler) sowie High-Contrast Input & Output Field Styles.',
};

export default function GuideSandboxPage() {
  return <GuideSandboxClient />;
}
