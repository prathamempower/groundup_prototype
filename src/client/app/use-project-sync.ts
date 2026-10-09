import { useState, useEffect } from 'react';
import { Project, ProjectFourTruthsSummary } from '../../shared/types';
import { AuthenticatedUser } from '../screens/AuthScreen';
import { services } from '../../services';
import { DEFAULT_PROJECTS } from './constants';

export function useProjectSync(currentUser: AuthenticatedUser | null, activeProjectId?: string | null) {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('groundup_projects');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_PROJECTS;
  });

  const [summary, setSummary] = useState<ProjectFourTruthsSummary | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await services.projects.getProjects();
      if (data && data.length > 0) {
        setProjects(prev => {
          const combined = [...data];
          DEFAULT_PROJECTS.forEach(dp => {
            if (!combined.some(p => p.id === dp.id)) combined.push(dp);
          });
          return combined;
        });
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects(DEFAULT_PROJECTS);
    }
  };

  const fetchProjectSummary = async (projId: string) => {
    if (!projId) { setSummary(null); return; }
    try {
      const data = await services.projects.getProjectSummary(projId);
      setSummary(data);
    } catch (err) {
      console.error(`Failed to load summary for ${projId}:`, err);
    }
  };

  useEffect(() => {
    if (currentUser) fetchProjects();
  }, [currentUser]);

  useEffect(() => {
    if (activeProjectId && currentUser) {
      fetchProjectSummary(activeProjectId);
    } else {
      setSummary(null);
    }
  }, [activeProjectId, currentUser]);

  return {
    projects,
    setProjects,
    summary,
    fetchProjectSummary,
  };
}
