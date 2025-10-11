import { useMemo, useState } from 'react';
import { AggregateOverview } from './components/AggregateOverview';
import { OfferManagement } from './components/OfferManagement';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectSidebar } from './components/ProjectSidebar';
import { useProjects } from './hooks/useProjects';
import { Project, WorkPackage } from './types';

const OFFERS_FEATURE_ENABLED = import.meta.env.VITE_ENABLE_OFFERS_VIEW !== 'false';

type ViewMode = 'overview' | 'offers';

const applyWorkPackageUpdate = (project: Project, workPackage: WorkPackage): Project => ({
  ...project,
  workPackages: project.workPackages.map((item) => (item.id === workPackage.id ? workPackage : item)),
});

const applyOfferUpdate = (project: Project, offerId: string, offer: Project['offers'][number]): Project => {
  const existingIndex = project.offers.findIndex((item) => item.id === offerId);
  if (existingIndex >= 0) {
    const updated = [...project.offers];
    updated[existingIndex] = offer;
    return { ...project, offers: updated };
  }
  return { ...project, offers: [...project.offers, offer] };
};

function App() {
  const {
    projects,
    selectedProjectIds,
    selectProject,
    deselectProject,
    activeProject,
    setActiveProjectId,
    updateProject,
    aggregate,
    isLoading,
    error,
  } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const activeProjectId = activeProject?.id;
  const sidebarProjects = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name, 'de-DE')),
    [projects],
  );

  const handleToggleProject = (projectId: number, selected: boolean) => {
    if (selected) {
      selectProject(projectId);
    } else {
      deselectProject(projectId);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <ProjectSidebar
        projects={sidebarProjects}
        selectedProjectIds={selectedProjectIds}
        activeProjectId={activeProjectId}
        onToggleProject={handleToggleProject}
        onActivateProject={(projectId) => setActiveProjectId(projectId)}
      />

      <main className="flex flex-1 flex-col gap-6 p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">OpenProject Delivery Cockpit</h1>
            <p className="text-sm text-slate-500">Aggregierte Übersicht über Meilensteine, Deliverables und Angebotsstatus.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === 'overview'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Aggregierte Ansicht
            </button>
            {OFFERS_FEATURE_ENABLED && (
              <button
                type="button"
                onClick={() => setViewMode('offers')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'offers'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Angebotsmanagement
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {viewMode === 'overview' && (
          <>
            <AggregateOverview metrics={aggregate} isLoading={isLoading} />
            <ProjectDetail
              project={activeProject}
              onUpdate={(workPackage) => {
                if (!activeProjectId) return;
                updateProject(activeProjectId, (project) => applyWorkPackageUpdate(project, workPackage));
              }}
            />
          </>
        )}

        {viewMode === 'offers' && OFFERS_FEATURE_ENABLED && (
          <OfferManagement
            project={activeProject}
            onPersist={(offer) => {
              if (!activeProjectId) return;
              updateProject(activeProjectId, (project) => applyOfferUpdate(project, offer.id, offer));
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
