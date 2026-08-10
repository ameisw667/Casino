import { Metadata } from 'next';
import PromoCodesClient from './PromoCodesClient';

export const metadata: Metadata = {
  title: 'Promo Codes | Casino Royale Admin',
  description: 'Create and manage promo codes for bonus credit redemption.',
};

export const dynamic = 'force-dynamic';

export default function PromoCodesPage() {
  return <PromoCodesClient />;
}
