import { FC, useEffect, useMemo, useState } from 'react';
import { Project, WorkPackage } from '../types';
import { updateWorkPackage } from '../services/api';

type GroupedItems = Record<string, WorkPackage[]>;

type ProjectDetailProps = {
  project?: Project;
  onUpdate?: (workPackage: WorkPackage) => void;
};

const groupByType = (items: WorkPackage[]): GroupedItems =>
  items.reduce<GroupedItems>((groups, item) => {
    const key = item.type;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});

const priorities = ['low', 'normal', 'high'];

type Drafts = Record<number, WorkPackage>;

const computePatch = (original: WorkPackage, draft: WorkPackage): Partial<WorkPackage> => {
  const patch: Partial<WorkPackage> = {};
  if (original.dueDate !== draft.dueDate) patch.dueDate = draft.dueDate;
  if (original.priority !== draft.priority) patch.priority = draft.priority;
  if (original.assignee !== draft.assignee) patch.assignee = draft.assignee;
  return patch;
};

export const ProjectDetail: FC<ProjectDetailProps> = ({ project, onUpdate }) => {
  const [pending, setPending] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Drafts>({});
  const grouped = useMemo(() => groupByType(project?.workPackages ?? []), [project?.workPackages]);

  useEffect(() => {
    const initialDrafts: Drafts = {};
    project?.workPackages.forEach((item) => {
      initialDrafts[item.id] = { ...item };
    });
    setDrafts(initialDrafts);
  }, [project?.id, project?.workPackages]);

  if (!project) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Projekt auswählen, um Details zu sehen.
      </section>
    );
  }

  const handleUpdate = async (workPackage: WorkPackage, patch: Partial<WorkPackage>) => {
    if (!project) return;
    try {
      setPending(workPackage.id);
      const updated = await updateWorkPackage(project.id, workPackage.id, patch);
      onUpdate?.({ ...workPackage, ...patch, ...updated });
    } catch (error) {
      console.error(error);
      alert('Aktualisierung fehlgeschlagen.');
    } finally {
      setPending(null);
    }
  };

  const updateDraft = (id: number, patch: Partial<WorkPackage>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? (project?.workPackages.find((item) => item.id === id) as WorkPackage)), ...patch },
    }));
  };

  const hasItems = Object.values(grouped).some((items) => items.length > 0);

  return (
    <section className="space-y-6">
      {!hasItems && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Keine Work Packages für dieses Projekt.
        </div>
      )}
      {Object.entries(grouped).map(([type, items]) => (
        <article key={type} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-800">{type}</h3>
            <p className="text-sm text-slate-500">Deadline, Priorität und Zuständigkeit können direkt angepasst werden.</p>
          </header>
          <ul className="divide-y divide-slate-200">
            {items.map((item) => {
              const draft = drafts[item.id] ?? item;
              return (
                <li key={item.id} className="grid gap-4 px-6 py-4 md:grid-cols-[1.5fr,1fr,1fr,1fr]">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                    <p className="text-xs text-slate-500">Status: {item.status}</p>
                  </div>
                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                    Deadline
                    <input
                      type="date"
                      value={draft.dueDate?.slice(0, 10) ?? ''}
                      onChange={(event) => updateDraft(item.id, { dueDate: event.target.value })}
                      onBlur={() => {
                        const patch = computePatch(item, draft);
                        if (Object.keys(patch).length > 0) {
                          handleUpdate(item, patch).catch((error) => console.error(error));
                        }
                      }}
                      disabled={pending === item.id}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                    Priorität
                    <select
                      value={draft.priority.toLowerCase()}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateDraft(item.id, { priority: value });
                        const patch = computePatch(item, { ...draft, priority: value });
                        if (Object.keys(patch).length > 0) {
                          handleUpdate(item, patch).catch((error) => console.error(error));
                        }
                      }}
                      disabled={pending === item.id}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority} className="capitalize">
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                    Zuständig
                    <input
                      type="text"
                      value={draft.assignee}
                      onChange={(event) => updateDraft(item.id, { assignee: event.target.value })}
                      onBlur={() => {
                        const patch = computePatch(item, draft);
                        if (Object.keys(patch).length > 0) {
                          handleUpdate(item, patch).catch((error) => console.error(error));
                        }
                      }}
                      disabled={pending === item.id}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </section>
  );
};
