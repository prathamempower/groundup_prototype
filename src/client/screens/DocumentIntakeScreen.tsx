import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Project } from '../../shared/types';
import { IntakeDocument } from './document-intake/types';
import { INITIAL_INTAKE_DOCUMENTS } from './document-intake/mock-documents';
import { DocumentIntakeHeader } from './document-intake/components/DocumentIntakeHeader';
import { DocumentCardItem } from './document-intake/components/DocumentCardItem';

interface DocumentIntakeScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function DocumentIntakeScreen({
  projects: _projects,
  selectedProjectId: _selectedProjectId,
}: DocumentIntakeScreenProps) {
  const [documents] = useState<IntakeDocument[]>(INITIAL_INTAKE_DOCUMENTS);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleSimulateUpload = (docId: string) => {
    setUploadSuccess(docId);
    setTimeout(() => setUploadSuccess(null), 2500);
  };

  const handleSimulateDownload = (fileName: string) => {
    setDownloadSuccess(fileName);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {downloadSuccess && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Downloading verified source document: <strong>{downloadSuccess}</strong> (Immutable SHA-256)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Ready</span>
        </div>
      )}

      <DocumentIntakeHeader />

      <div className="space-y-3.5">
        {documents.map((doc) => (
          <DocumentCardItem
            key={doc.id}
            doc={doc}
            uploadSuccess={uploadSuccess}
            onDownload={handleSimulateDownload}
            onUpload={handleSimulateUpload}
          />
        ))}
      </div>
    </div>
  );
}
