import { Metadata } from 'next';
import AdminKnowledgeClient from './AdminKnowledgeClient';

export const metadata: Metadata = {
  title: 'Royale Knowledge CMS | Casino Royale Admin',
  description: 'Manage guide knowledge base documents and pgvector embeddings in Supabase.',
};

export const dynamic = 'force-dynamic';

export default function AdminKnowledgePage() {
  return <AdminKnowledgeClient />;
}
