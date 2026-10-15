import { Metadata } from 'next';
import { LegalPageContent } from '@/components/legal/LegalPageContent';

export const metadata: Metadata = {
  title: 'Privacy Policy | GroundUp AI',
  description: 'Enterprise tenant isolation, bank wire confidentiality, and immutable audit trail standards for GroundUp AI.',
};

export default function PrivacyPage() {
  return <LegalPageContent defaultTab="privacy" />;
}
