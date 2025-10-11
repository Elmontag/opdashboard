import { FC } from 'react';
import { Project } from '../types';

type ProjectSidebarProps = {
  projects: Project[];
  selectedProjectIds: number[];
  activeProjectId?: number;
  onToggleProject: (projectId: number, selected: boolean) => void;
  onActivateProject: (projectId: number) => void;
};

export const ProjectSidebar: FC<ProjectSidebarProps> = ({
  projects,
  selectedProjectIds,
  activeProjectId,
  onToggleProject,
  onActivateProject,
}) => (
  <aside className="w-72 shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur">
    <div className="flex items-center justify-between px-4 py-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Projekte</h2>
      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{projects.length}</span>
    </div>
    <ul className="space-y-1 px-2 pb-6">
      {projects.map((project) => {
        const isSelected = selectedProjectIds.includes(project.id);
        const isActive = activeProjectId === project.id;
        return (
          <li key={project.id}>
            <div
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 transition hover:bg-brand-50 ${
                isActive ? 'bg-brand-100 text-brand-900' : 'text-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => onActivateProject(project.id)}
                className="flex flex-1 flex-col items-start text-left"
              >
                <span className="text-sm font-medium">{project.name}</span>
                <span className="text-xs text-slate-500">{project.identifier}</span>
              </button>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Auswahl
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(event) => onToggleProject(project.id, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
              </label>
            </div>
          </li>
        );
      })}
    </ul>
  </aside>
);
