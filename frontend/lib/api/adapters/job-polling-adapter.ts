export interface AsyncJobStatus<T = unknown> {
  job_id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress_percent?: number;
  result?: T;
  error?: {
    code: string;
    message: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PollOptions {
  intervalMs?: number;
  maxAttempts?: number;
  onProgress?: (progress: number) => void;
  timeoutMs?: number;
}

export class MockJobPollingAdapter {
  async getJobStatus<T = unknown>(jobId: string): Promise<AsyncJobStatus<T>> {
    return {
      job_id: jobId,
      status: "COMPLETED",
      progress_percent: 100,
      result: { success: true } as unknown as T,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async pollUntilComplete<T = unknown>(
    jobId: string,
    options: PollOptions = {}
  ): Promise<T> {
    if (options.onProgress) {
      options.onProgress(100);
    }
    const status = await this.getJobStatus<T>(jobId);
    return status.result as T;
  }
}

export const JobPollingAdapter = MockJobPollingAdapter;
export const jobPollingAdapter = new MockJobPollingAdapter();
