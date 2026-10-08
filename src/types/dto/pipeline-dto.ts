import { Project, ProjectFourTruthsSummary } from '../domain';
import { FinalReportDataDTO } from './project-dto';

export interface PipelineProcessRequestDTO {
  sourceType: string;
  projectName: string;
  projectAddress: string;
  targetBudget: number;
  units?: number;
  squareFeet?: number;
  files?: Array<{
    fileName: string;
    content?: string;
    bufferBase64?: string;
    documentType?: string;
  }>;
  userContext?: {
    name: string;
    company: string;
    email?: string;
    role?: string;
  };
  humanApprovedOverride?: boolean;
}

export interface PipelineExecutionResultDTO {
  pipelineRunId: string;
  status: 'COMPLETED' | 'EXCEPTION_FLAGGED' | 'FAILED';
  startedAt: string;
  completedAt: string;
  durationMs: number;
  project: Project;
  fourTruthsSummary: ProjectFourTruthsSummary;
  finalReport: FinalReportDataDTO;
  stepLogs: Array<{
    stepNumber: number;
    stepName: string;
    status: 'PENDING' | 'RUNNING' | 'DONE' | 'EXCEPTION_FLAGGED';
    title: string;
    description: string;
    confidence: number;
    timestamp: string;
  }>;
}
