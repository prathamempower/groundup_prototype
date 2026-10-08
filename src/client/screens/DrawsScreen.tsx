import React from 'react';
import { UserRole } from '../../shared/types';
import { useDrawsState } from './draws/use-draws-state';
import { DrawsHeader } from './draws/components/DrawsHeader';
import { DrawRevisionSelector } from './draws/components/DrawRevisionSelector';
import { ActiveDrawCard } from './draws/components/ActiveDrawCard';

interface DrawsScreenProps {
  projectId: string;
  activeRole: UserRole;
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
}

export const DrawsScreen: React.FC<DrawsScreenProps> = ({ projectId, activeRole }) => {
  const {
    draws,
    loading,
    selectedDrawId,
    setSelectedDrawId,
    activeDraw,
    activeLines,
    resubmitting,
    disbursing,
    loadDraws,
    handleResubmit,
    handleDisburse,
  } = useDrawsState(projectId, activeRole);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <DrawsHeader loading={loading} onRefresh={loadDraws} />

      <DrawRevisionSelector
        draws={draws}
        selectedDrawId={selectedDrawId}
        onSelectDraw={setSelectedDrawId}
      />

      {activeDraw && (
        <ActiveDrawCard
          activeDraw={activeDraw}
          activeLines={activeLines}
          resubmitting={resubmitting}
          disbursing={disbursing}
          onResubmit={handleResubmit}
          onDisburse={handleDisburse}
        />
      )}
    </div>
  );
};
