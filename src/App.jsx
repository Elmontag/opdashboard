import { useEffect, useMemo, useState } from 'react';

const sampleProjects = [
  {
    id: 'psa',
    name: 'Produkt Suite A',
    key: 'PSA',
    manager: 'Sarah König',
    status: 'on_track',
    color: '#2563eb',
    objectives: ['Neue Kundenportale für DACH', 'API-first Onboarding'],
    milestones: [
      { name: 'MVP Go-Live', date: '2024-07-12', owner: 'Sarah König' },
      { name: 'Rollout Phase 1', date: '2024-09-05', owner: 'PMO' },
    ],
    kpis: {
      openItems: 24,
      milestones: 2,
      risk: 'niedrig',
    },
  },
  {
    id: 'mobile',
    name: 'Mobile Experience',
    key: 'MOB',
    manager: 'Leon Bach',
    status: 'at_risk',
    color: '#ea580c',
    objectives: ['Beta-Release iOS', 'Stabilisierung Android'],
    milestones: [
      { name: 'Feature Freeze', date: '2024-07-30', owner: 'UX Team' },
      { name: 'Public Beta', date: '2024-08-18', owner: 'Mobile PM' },
    ],
    kpis: {
      openItems: 31,
      milestones: 2,
      risk: 'mittel',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Integrationen',
    key: 'ENT',
    manager: 'Dalia Mertens',
    status: 'off_track',
    color: '#dc2626',
    objectives: ['SAP Connector', 'Identity Federation'],
    milestones: [
      { name: 'Security Review', date: '2024-07-20', owner: 'SecOps' },
      { name: 'Pilot-Kunde live', date: '2024-08-28', owner: 'Implementierung' },
    ],
    kpis: {
      openItems: 42,
      milestones: 2,
      risk: 'hoch',
    },
  },
];

const workItems = [
  {
    id: 'PSA-102',
    projectId: 'psa',
    type: 'Feature',
    title: 'Self-Service Provisioning',
    priority: 'hoch',
    status: 'In Arbeit',
    dueDate: '2024-07-15',
    assignee: 'Mara Zimmer',
  },
  {
    id: 'PSA-108',
    projectId: 'psa',
    type: 'Deliverable',
    title: 'Rollout Checkliste',
    priority: 'mittel',
    status: 'Review',
    dueDate: '2024-07-10',
    assignee: 'Sarah König',
  },
  {
    id: 'MOB-201',
    projectId: 'mobile',
    type: 'Milestone',
    title: 'Push Notification Audit',
    priority: 'hoch',
    status: 'Blockiert',
    dueDate: '2024-07-13',
    assignee: 'SecOps',
  },
  {
    id: 'MOB-220',
    projectId: 'mobile',
    type: 'Feature',
    title: 'Offline-Modus',
    priority: 'niedrig',
    status: 'Backlog',
    dueDate: '2024-08-30',
    assignee: 'UX Team',
  },
  {
    id: 'ENT-031',
    projectId: 'enterprise',
    type: 'Integration',
    title: 'SSO Federation',
    priority: 'hoch',
    status: 'In Arbeit',
    dueDate: '2024-08-04',
    assignee: 'Platform Squad',
  },
  {
    id: 'ENT-044',
    projectId: 'enterprise',
    type: 'Milestone',
    title: 'Pilotkunde mit SAP',
    priority: 'mittel',
    status: 'In Arbeit',
    dueDate: '2024-07-22',
    assignee: 'Implementierung',
  },
];

const statusLabels = {
  on_track: 'On Track',
  at_risk: 'Achtung',
  off_track: 'Kritisch',
};

const priorityColor = {
  hoch: '#dc2626',
  mittel: '#f97316',
  niedrig: '#16a34a',
};

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default function App() {
  const [selectedProjects, setSelectedProjects] = useState(sampleProjects.map((p) => p.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiUrl, setApiUrl] = useState('');
  const [apiToken, setApiToken] = useState('');

  useEffect(() => {
    const storedUrl = localStorage.getItem('opd-api-url');
    const storedToken = localStorage.getItem('opd-api-token');
    if (storedUrl) setApiUrl(storedUrl);
    if (storedToken) setApiToken(storedToken);
  }, []);

  useEffect(() => {
    if (apiUrl) localStorage.setItem('opd-api-url', apiUrl);
    if (apiToken) localStorage.setItem('opd-api-token', apiToken);
  }, [apiUrl, apiToken]);

  const visibleProjects = useMemo(() => {
    return sampleProjects.filter((project) => {
      const statusMatches = statusFilter === 'all' || project.status === statusFilter;
      const textMatches = `${project.name} ${project.key}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return selectedProjects.includes(project.id) && statusMatches && textMatches;
    });
  }, [searchTerm, selectedProjects, statusFilter]);

  const selectedWorkItems = useMemo(() => {
    return workItems.filter((item) => selectedProjects.includes(item.projectId));
  }, [selectedProjects]);

  const aggregate = useMemo(() => {
    const open = selectedWorkItems.length;
    const critical = selectedWorkItems.filter((item) => item.priority === 'hoch').length;
    const upcoming = selectedWorkItems.filter((item) => new Date(item.dueDate) < new Date('2024-07-31')).length;
    const milestoneCount = visibleProjects.reduce((count, project) => count + project.milestones.length, 0);

    return { open, critical, upcoming, milestoneCount };
  }, [selectedWorkItems, visibleProjects]);

  const toggleProject = (id) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((projectId) => projectId !== id) : [...prev, id],
    );
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">OpenProject Dashboard MVP</p>
          <h1>Portfolio- & Projektsteuerung in einer Ansicht</h1>
          <p className="subtitle">
            Wähle mehrere OpenProject-Projekte aus, sieh den aktuellen Status und arbeite mit klaren Deadlines,
            Prioritäten und Zuständigkeiten. Die App speichert deine Einstellungen lokal, bleibt aber serverseitig
            stateless.
          </p>
          <div className="badges">
            <span className="badge">Multiprojekt-Kontext</span>
            <span className="badge">Timeline & KPIs</span>
            <span className="badge">Lokale Einstellungen</span>
          </div>
        </div>
        <div className="settings-card">
          <h2>API-Kontext</h2>
          <label>
            OpenProject Basis-URL
            <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://openproject.example" />
          </label>
          <label>
            API Token
            <input
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Kopiere deinen persönlichen Token"
            />
          </label>
          <p className="hint">Beide Felder werden nur im Browser gespeichert.</p>
        </div>
      </header>

      <main className="layout">
        <aside className="panel">
          <div className="panel-section">
            <div className="panel-header">
              <h3>Projekte</h3>
              <span className="pill">{selectedProjects.length} aktiv</span>
            </div>
            <input
              className="input"
              placeholder="Suchen nach Name oder Key"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="checkbox-row">
              <label>
                <input
                  type="radio"
                  name="status"
                  value="all"
                  checked={statusFilter === 'all'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                Alle Stati
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="on_track"
                  checked={statusFilter === 'on_track'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                On Track
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="at_risk"
                  checked={statusFilter === 'at_risk'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                Achtung
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="off_track"
                  checked={statusFilter === 'off_track'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                Kritisch
              </label>
            </div>
            <div className="project-list">
              {sampleProjects.map((project) => (
                <label key={project.id} className="project-item">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => toggleProject(project.id)}
                  />
                  <span className="dot" style={{ background: project.color }} />
                  <div>
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">{project.key} • {project.manager}</div>
                  </div>
                  <span className={`status status-${project.status}`}>{statusLabels[project.status]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-header">
              <h3>Multiprojekt KPIs</h3>
              <span className="pill">Live</span>
            </div>
            <div className="kpi-grid">
              <KpiCard label="Offene Items" value={aggregate.open} />
              <KpiCard label="Kritische Prio" value={aggregate.critical} tone="danger" />
              <KpiCard label="Fälligkeiten (30 Tage)" value={aggregate.upcoming} tone="warn" />
              <KpiCard label="Meilensteine" value={aggregate.milestoneCount} />
            </div>
          </div>
        </aside>

        <section className="content">
          <div className="content-header">
            <div>
              <p className="eyebrow">Arbeitsbereich</p>
              <h2>Projektübersicht & Verantwortung</h2>
            </div>
            <button className="primary">Export Mock-Plan</button>
          </div>

          <div className="cards">
            {visibleProjects.map((project) => (
              <article key={project.id} className="project-card">
                <header>
                  <div>
                    <p className="eyebrow">{project.key}</p>
                    <h3>{project.name}</h3>
                    <p className="meta">Verantwortlich: {project.manager}</p>
                  </div>
                  <div className="status-chip" style={{ color: project.color }}>
                    ● {statusLabels[project.status]}
                  </div>
                </header>
                <div className="objectives">
                  {project.objectives.map((objective) => (
                    <span key={objective} className="objective">
                      {objective}
                    </span>
                  ))}
                </div>
                <div className="milestones">
                  {project.milestones.map((milestone) => (
                    <div key={milestone.name} className="milestone">
                      <div>
                        <p className="milestone-name">{milestone.name}</p>
                        <p className="milestone-owner">Owner: {milestone.owner}</p>
                      </div>
                      <div className="milestone-date">{formatDate(milestone.date)}</div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <section className="table-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Work Items</p>
                <h3>Deadlines, Prioritäten & Zuständigkeiten</h3>
              </div>
              <span className="pill">{selectedWorkItems.length} Einträge</span>
            </div>
            <div className="table">
              <div className="table-row head">
                <div>ID</div>
                <div>Typ</div>
                <div>Projekt</div>
                <div>Titel</div>
                <div>Prio</div>
                <div>Status</div>
                <div>Fällig</div>
                <div>Owner</div>
              </div>
              {selectedWorkItems.map((item) => {
                const project = sampleProjects.find((p) => p.id === item.projectId);
                return (
                  <div key={item.id} className="table-row">
                    <div>{item.id}</div>
                    <div>{item.type}</div>
                    <div className="project-cell">
                      <span className="dot" style={{ background: project.color }} />
                      {project.name}
                    </div>
                    <div>{item.title}</div>
                    <div>
                      <span className="priority" style={{ background: priorityColor[item.priority] }}>
                        {item.priority}
                      </span>
                    </div>
                    <div>{item.status}</div>
                    <div>{formatDate(item.dueDate)}</div>
                    <div>{item.assignee}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function KpiCard({ label, value, tone }) {
  return (
    <div className={`kpi-card ${tone ? `kpi-${tone}` : ''}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
    </div>
  );
}
