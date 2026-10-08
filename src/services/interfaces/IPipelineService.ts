// GroundUp AI — IPipelineService Interface Contract

import {
  PipelineProcessRequestDTO,
  PipelineExecutionResultDTO,
} from '../../types';

export interface IPipelineService {
  /**
   * Execute the end-to-end 10-step AI processing pipeline.
   */
  executePipeline(payload: PipelineProcessRequestDTO): Promise<PipelineExecutionResultDTO>;
}
