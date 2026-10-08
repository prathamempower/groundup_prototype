import { ProvenanceDrillDown } from '../domain';

export interface FigureProvenanceRequestDTO {
  figureType: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay';
  projectId: string;
  category?: string;
}

export type FigureProvenanceResponseDTO = ProvenanceDrillDown;

export interface ResetSeedResponseDTO {
  success: boolean;
  message: string;
}
