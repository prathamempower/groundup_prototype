// GroundUp AI — MockAdminService Implementation

import { IAdminService } from '../interfaces/IAdminService';
import { ResetSeedResponseDTO } from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';

export class MockAdminService implements IAdminService {
  async resetSeed(): Promise<ResetSeedResponseDTO> {
    await delay(300, 500);
    mockStore.resetToFixtures();
    return {
      success: true,
      message: 'Database reset to baseline state (sample projects reloaded).',
    };
  }
}
