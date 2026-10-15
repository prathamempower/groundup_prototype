import { Metadata } from 'next';
import { LegalPageContent } from '@/components/legal/LegalPageContent';

export const metadata: Metadata = {
  title: 'Terms of Service | GroundUp AI',
  description: 'Operating and compliance standards for commercial real estate development workspaces, AIA pay applications, and lien waivers.',
};

export default function TermsPage() {
  return <LegalPageContent defaultTab="terms" />;
}
