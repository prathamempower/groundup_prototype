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

export class JobPollingAdapter {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  }

  async getJobStatus<T = unknown>(jobId: string): Promise<AsyncJobStatus<T>> {
    const res = await fetch(`${this.baseUrl}/jobs/${jobId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch status for job ${jobId}: ${res.statusText}`);
    }
    const payload = await res.json();
    return payload.data;
  }

  async pollUntilComplete<T = unknown>(
    jobId: string,
    options: PollOptions = {}
  ): Promise<T> {
    const intervalMs = options.intervalMs ?? 500;
    const maxAttempts = options.maxAttempts ?? 60;
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs ?? 60000;

    let attempts = 0;

    while (attempts < maxAttempts) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Polling timed out for job ${jobId} after ${timeoutMs}ms`);
      }

      attempts++;
      const job = await this.getJobStatus<T>(jobId);

      if (options.onProgress && typeof job.progress_percent === "number") {
        options.onProgress(job.progress_percent);
      }

      if (job.status === "COMPLETED") {
        return job.result as T;
      }

      if (job.status === "FAILED") {
        throw new Error(
          job.error?.message || `Async job ${jobId} failed with code ${job.error?.code || "UNKNOWN"}`
        );
      }

      // Wait with jitter for next iteration
      const jitter = Math.random() * 50;
      await new Promise((resolve) => setTimeout(resolve, intervalMs + jitter));
    }

    throw new Error(`Maximum polling attempts (${maxAttempts}) exceeded for job ${jobId}`);
  }
}

export const jobPollingAdapter = new JobPollingAdapter();
