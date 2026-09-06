import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { labFontVariables } from './fonts';
import './lab.css';

export const metadata: Metadata = {
  title: 'PULS — Partikel-Lab (Sandbox)',
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: ReactNode }) {
  return <div className={labFontVariables}>{children}</div>;
}
