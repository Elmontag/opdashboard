import { client } from '../utils/openProjectClient';
import { env } from '../config/env';
import { readProjects, writeProjects, Project, WorkPackage, Offer, ProjectStore } from './mockDataService';

export type AggregateMetrics = {
  projectCount: number;
  milestoneCompletion: number;
  highPriorityMilestones: number;
  highPriorityDeliverables: number;
  openOffers: number;
};

const filterByType = (packages: WorkPackage[], typeName: string): WorkPackage[] =>
  packages.filter((item) => item.type.toLowerCase() === typeName.toLowerCase());

const computeCompletionRatio = (items: WorkPackage[]): number => {
  if (!items.length) {
    return 1;
  }
  const done = items.filter((item) => item.status.toLowerCase() === 'closed' || item.status.toLowerCase() === 'done');
  return done.length / items.length;
};

export const calculateAggregate = (projects: Project[]): AggregateMetrics => {
  const milestoneType = env.targetTypes.milestone;
  const deliverableType = env.targetTypes.deliverable;

  const allMilestones = projects.flatMap((project) => filterByType(project.workPackages, milestoneType));
  const allDeliverables = projects.flatMap((project) => filterByType(project.workPackages, deliverableType));
  const allOffers = projects.flatMap((project) => project.offers);

  const highPriorityMilestones = allMilestones.filter((item) => item.priority.toLowerCase() === 'high').length;
  const highPriorityDeliverables = allDeliverables.filter((item) => item.priority.toLowerCase() === 'high').length;

  return {
    projectCount: projects.length,
    milestoneCompletion: computeCompletionRatio(allMilestones),
    highPriorityMilestones,
    highPriorityDeliverables,
    openOffers: allOffers.filter((offer) => offer.status.toLowerCase() !== 'closed').length,
  };
};

const fetchRemoteProjects = async (): Promise<Project[]> => {
  const response = await client.get('/api/v3/projects');
  const projects = response.data._embedded?.elements ?? [];
  return projects.map((raw: any) => ({
    id: raw.id,
    name: raw.name,
    identifier: raw.identifier,
    status: raw.status?.toLowerCase() ?? 'unknown',
    workPackages: [],
    offers: [],
  }));
};

const loadMockProjects = (): Project[] => readProjects().projects;

export const getProjects = async (): Promise<Project[]> => {
  if (env.useMock || !env.apiToken) {
    return loadMockProjects();
  }
  return fetchRemoteProjects();
};

export const getProjectDetails = async (projectId: number): Promise<Project | undefined> => {
  if (env.useMock || !env.apiToken) {
    return loadMockProjects().find((project) => project.id === projectId);
  }

  const [projectResponse, workPackageResponse] = await Promise.all([
    client.get(`/api/v3/projects/${projectId}`),
    client.get(`/api/v3/projects/${projectId}/work_packages`, {
      params: {
        filters: JSON.stringify([
          {
            type: {
              operator: '=',
              values: [
                env.targetTypes.milestone,
                env.targetTypes.deliverable,
                env.targetTypes.externalGoal,
                env.targetTypes.internalGoal,
              ],
            },
          },
        ]),
      },
    }),
  ]);

  const project = projectResponse.data;
  const workPackages = (workPackageResponse.data._embedded?.elements ?? []).map((item: any) => ({
    id: item.id,
    subject: item.subject,
    type: item._embedded?.type?.name ?? 'Unknown',
    status: item._embedded?.status?.name ?? 'Unknown',
    assignee: item._embedded?.assignee?.name ?? 'Unassigned',
    dueDate: item.dueDate,
    priority: item._embedded?.priority?.name ?? 'Normal',
  }));

  return {
    id: project.id,
    name: project.name,
    identifier: project.identifier,
    status: project.status?.name ?? 'unknown',
    workPackages,
    offers: [],
  };
};

export const updateWorkPackage = async (
  projectId: number,
  workPackageId: number,
  payload: Partial<WorkPackage>,
): Promise<WorkPackage> => {
  if (env.useMock || !env.apiToken) {
    const store = readProjects();
    const project = store.projects.find((item) => item.id === projectId);

    if (!project) {
      throw new Error('Projekt nicht gefunden');
    }

    const target = project.workPackages.find((item) => item.id === workPackageId);
    if (!target) {
      throw new Error('Element nicht gefunden');
    }

    const updated: WorkPackage = { ...target, ...payload };
    project.workPackages = project.workPackages.map((item) => (item.id === workPackageId ? updated : item));
    writeProjects(store);
    return updated;
  }

  const response = await client.patch(`/api/v3/work_packages/${workPackageId}`, payload);
  return response.data;
};

export const upsertOffer = async (projectId: number, offer: Offer): Promise<Offer> => {
  if (env.useMock || !env.apiToken) {
    const store = readProjects();
    const project = store.projects.find((item) => item.id === projectId);
    if (!project) {
      throw new Error('Projekt nicht gefunden');
    }
    const existingIndex = project.offers.findIndex((item) => item.id === offer.id);
    if (existingIndex >= 0) {
      project.offers[existingIndex] = offer;
    } else {
      project.offers.push(offer);
    }
    writeProjects(store);
    return offer;
  }

  const response = await client.post(`/api/v3/projects/${projectId}/offers`, offer);
  return response.data;
};

export const loadAggregate = async (ids: number[]): Promise<AggregateMetrics> => {
  if (env.useMock || !env.apiToken) {
    const store = loadMockProjects().filter((project) => ids.includes(project.id));
    return calculateAggregate(store);
  }

  const projects = await Promise.all(ids.map((id) => getProjectDetails(id)));
  return calculateAggregate(projects.filter(Boolean) as Project[]);
};
