// GroundUp AI — IAdminService Interface Contract

import {
  ResetSeedResponseDTO,
} from '../../types';

export interface IAdminService {
  /**
   * Reset mock data repository / database back to pristine initial seed fixtures.
   */
  resetSeed(): Promise<ResetSeedResponseDTO>;
}
