// GroundUp AI — IChatService Interface Contract

import {
  AIChatQueryRequestDTO,
  AIChatResponseDTO,
} from '../../types';

export interface IChatService {
  /**
   * Ask the AI financial reasoning assistant a question regarding project spend, budget, draws, or lineage.
   */
  askQuestion(payload: AIChatQueryRequestDTO): Promise<AIChatResponseDTO>;
}
