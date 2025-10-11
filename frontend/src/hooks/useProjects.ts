import { useCallback, useEffect, useMemo, useState } from 'react';
import { AggregateMetrics, Project } from '../types';
import { fetchAggregate, fetchProjectDetails, fetchProjects } from '../services/api';

type UseProjectsResult = {
  projects: Project[];
  selectedProjectIds: number[];
  selectProject: (projectId: number) => void;
  deselectProject: (projectId: number) => void;
  activeProject?: Project;
  setActiveProjectId: (projectId: number | undefined) => void;
  updateProject: (projectId: number, updater: (project: Project) => Project) => void;
  aggregate?: AggregateMetrics;
  isLoading: boolean;
  error?: string;
};

export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | undefined>();
  const [aggregate, setAggregate] = useState<AggregateMetrics>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectIds(data.map((project) => project.id));
          setActiveProjectId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects().catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedProjectIds.length === 0) {
      setAggregate(undefined);
      return;
    }

    fetchAggregate(selectedProjectIds)
      .then(setAggregate)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unbekannter Fehler'));
  }, [selectedProjectIds]);

  const selectProject = useCallback((projectId: number) => {
    setSelectedProjectIds((prev) => (prev.includes(projectId) ? prev : [...prev, projectId]));
  }, []);

  const deselectProject = useCallback((projectId: number) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
  }, []);

  const updateProject = useCallback((projectId: number, updater: (project: Project) => Project) => {
    setProjects((prev) => prev.map((project) => (project.id === projectId ? updater(project) : project)));
  }, []);

  const setActiveProjectIdSafe = useCallback((projectId: number | undefined) => {
    setActiveProjectId(projectId);
    if (projectId && !selectedProjectIds.includes(projectId)) {
      selectProject(projectId);
    }
    if (projectId) {
      fetchProjectDetails(projectId)
        .then((details) => {
          setProjects((prev) => prev.map((project) => (project.id === projectId ? details : project)));
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Unbekannter Fehler'));
    }
  }, [selectProject, selectedProjectIds]);

  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId), [projects, activeProjectId]);

  return {
    projects,
    selectedProjectIds,
    selectProject,
    deselectProject,
    activeProject,
    setActiveProjectId: setActiveProjectIdSafe,
    updateProject,
    aggregate,
    isLoading,
    error,
  };
};
