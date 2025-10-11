import { AggregateMetrics, Offer, Project, WorkPackage } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const request = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'API Fehler');
  }

  return response.json() as Promise<T>;
};

export const fetchProjects = (): Promise<Project[]> => request(`${API_BASE_URL}/api/projects`);

export const fetchProjectDetails = (projectId: number): Promise<Project> =>
  request(`${API_BASE_URL}/api/projects/${projectId}`);

export const updateWorkPackage = (
  projectId: number,
  workPackageId: number,
  payload: Partial<WorkPackage>,
): Promise<WorkPackage> =>
  request(`${API_BASE_URL}/api/projects/${projectId}/work-packages/${workPackageId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const saveOffer = (projectId: number, payload: Offer): Promise<Offer> =>
  request(`${API_BASE_URL}/api/projects/${projectId}/offers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchAggregate = (projectIds: number[]): Promise<AggregateMetrics> => {
  const params = new URLSearchParams({ ids: projectIds.join(',') });
  return request(`${API_BASE_URL}/api/projects/aggregate/summary?${params.toString()}`);
};
