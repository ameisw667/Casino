import { Geist_Mono, Instrument_Serif, Bricolage_Grotesque } from 'next/font/google';

export const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--lab-font-serif',
  display: 'swap',
});

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--lab-font-mono',
  display: 'swap',
});

export const bricolageGrotesque = Bricolage_Grotesque({
  weight: ['800'],
  subsets: ['latin'],
  variable: '--lab-font-mask',
  display: 'swap',
});

export const labFontVariables = [
  instrumentSerif.variable,
  geistMono.variable,
  bricolageGrotesque.variable,
].join(' ');
