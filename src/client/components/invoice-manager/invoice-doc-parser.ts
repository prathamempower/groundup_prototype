import { services } from '../../../services';
import { UploadedDocumentItem } from './types';

export const readFileAsBase64 = (file: File): Promise<{ fileName: string; bufferBase64: string; size: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({ fileName: file.name, bufferBase64: base64, size: file.size });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function parseUploadedFiles(
  files: FileList,
  projectId: string
): Promise<UploadedDocumentItem[]> {
  const filePayloads = await Promise.all(Array.from(files).map(readFileAsBase64));
  const data = await services.documents.parseBatchDocuments({ files: filePayloads, projectId });
  if (!data || !data.normalizedInvoices) return [];

  return data.normalizedInvoices.map((inv, idx) => ({
    id: `doc-${Date.now()}-${idx}`,
    name: inv.sourceDocument || 'Uploaded Invoice',
    size: `${((filePayloads.find((f) => f.fileName === inv.sourceDocument)?.size || 102400) / 1024).toFixed(1)} KB`,
    type: inv.sourceDocument?.toLowerCase().includes('702')
      ? 'AIA G702'
      : inv.sourceDocument?.toLowerCase().includes('703')
      ? 'AIA G703'
      : 'PDF',
    vendor: inv.vendor,
    category: inv.category,
    amount: inv.amount,
    waiver: inv.lienWaiver,
    status: 'EXTRACTED',
  }));
}
