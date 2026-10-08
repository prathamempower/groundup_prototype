import { LucideIcon } from 'lucide-react';

export interface IntakeDocument {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  shaHash: string;
  status: string;
  extractedSummary: string;
  icon: LucideIcon;
}
