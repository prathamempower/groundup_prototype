// GroundUp AI — IProvenanceService Interface Contract

import {
  ProvenanceDrillDown,
  FigureProvenanceRequestDTO,
} from '../../types';

export interface IProvenanceService {
  /**
   * Fetch zero-hallucination provenance lineage and source audit trail for a figure.
   */
  getFigureProvenance(payload: FigureProvenanceRequestDTO): Promise<ProvenanceDrillDown>;
}
