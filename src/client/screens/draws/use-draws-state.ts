import { useState, useEffect } from 'react';
import { Draw, DrawLine, UserRole } from '../../../shared/types';
import { services } from '../../../services';

export function useDrawsState(projectId: string, activeRole: UserRole) {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [drawLines, setDrawLines] = useState<DrawLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrawId, setSelectedDrawId] = useState<string | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [disbursing, setDisbursing] = useState(false);

  const loadDraws = async () => {
    setLoading(true);
    try {
      const data = await services.draws.getProjectDraws(projectId);
      setDraws(data.draws || []);
      setDrawLines(data.drawLines || []);
      if (data.draws?.length > 0 && !selectedDrawId) {
        setSelectedDrawId(data.draws[data.draws.length - 1].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load draws:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraws();
  }, [projectId]);

  const activeDraw = draws.find((d) => d.id === selectedDrawId) || draws[0];
  const activeLines = drawLines.filter((l) => l.draw_id === activeDraw?.id);

  const handleResubmit = async () => {
    if (!activeDraw) return;
    setResubmitting(true);

    const correctiveLines = activeLines
      .filter((l) => l.status === 'rejected' || l.status === 'partially_approved')
      .map((l) => ({
        category: l.category,
        requested_amount: l.requested_amount - l.approved_amount,
        corrective_document_id: 'doc-corrective-waiver',
        notes: 'Attached executed unconditional progress lien waiver',
      }));

    try {
      const data = await services.draws.createDrawRevision(activeDraw.id, correctiveLines, activeRole);
      await loadDraws();
      setSelectedDrawId(data.revisionDraw.id);
      setResubmitting(false);
    } catch (err) {
      console.error(err);
      setResubmitting(false);
    }
  };

  const handleDisburse = async () => {
    if (!activeDraw) return;
    setDisbursing(true);

    try {
      await services.draws.recordWireDisbursement(activeDraw.id, activeDraw.approved_total, activeRole);
      await loadDraws();
      setDisbursing(false);
    } catch (err) {
      console.error(err);
      setDisbursing(false);
    }
  };

  return {
    draws,
    drawLines,
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
  };
}
