import fs from 'fs';
import path from 'path';

export type WorkPackage = {
  id: number;
  subject: string;
  type: string;
  status: string;
  assignee: string;
  dueDate: string;
  priority: string;
};

export type Offer = {
  id: string;
  freelancer: string;
  status: string;
  deadline: string;
  budget: number;
  documents: { name: string; url: string }[];
  history: { status: string; timestamp: string }[];
};

export type Project = {
  id: number;
  name: string;
  identifier: string;
  status: string;
  workPackages: WorkPackage[];
  offers: Offer[];
};

export type ProjectStore = {
  projects: Project[];
};

const storePath = path.resolve(__dirname, '../../data/sample-projects.json');

export const readProjects = (): ProjectStore => {
  const buffer = fs.readFileSync(storePath, 'utf-8');
  return JSON.parse(buffer) as ProjectStore;
};

export const writeProjects = (store: ProjectStore): void => {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
};
