import { api } from "@/lib/api";

export interface PresignedUploadUrlResult {
  document_id: string;
  upload_url: string;
  key: string;
  expires_in: number;
}

export interface UploadFileOptions {
  onProgress?: (progressPercent: number) => void;
}

export interface UploadAdapter {
  getUploadUrl(filename: string, mimeType: string): Promise<PresignedUploadUrlResult>;
  uploadFile(uploadUrl: string, file: File | Blob, options?: UploadFileOptions): Promise<void>;
  confirmUpload(documentId: string): Promise<{ id: string; status: string; sha256: string; job_id: string }>;
}

export class S3UploadAdapter implements UploadAdapter {
  async getUploadUrl(filename: string, mimeType: string): Promise<PresignedUploadUrlResult> {
    const res = await api.documents.getUploadUrl(filename, mimeType);
    return res.data;
  }

  async uploadFile(uploadUrl: string, file: File | Blob, options?: UploadFileOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      if (options?.onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            options.onProgress?.(pct);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during file upload"));
      xhr.send(file);
    });
  }

  async confirmUpload(documentId: string): Promise<{ id: string; status: string; sha256: string; job_id: string }> {
    const res = await api.documents.confirmUpload(documentId);
    return res.data;
  }
}

export const uploadAdapter: UploadAdapter = new S3UploadAdapter();
