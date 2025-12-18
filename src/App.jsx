import { useCallback, useEffect, useMemo, useState } from 'react';

const statusLabels = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  unknown: 'Unbekannt',
};

const priorityColors = {
  hoch: '#dc2626',
  high: '#dc2626',
  mittel: '#f97316',
  medium: '#f97316',
  niedrig: '#16a34a',
  low: '#16a34a',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function colorFromId(id) {
  const palette = ['#2563eb', '#ea580c', '#16a34a', '#7c3aed', '#dc2626', '#0891b2'];
  if (!id) return palette[0];
  return palette[id % palette.length];
}

function normalizePriority(priorityName) {
  if (!priorityName) return 'n/a';
  const normalized = priorityName.toLowerCase();
  if (normalized.includes('hoch') || normalized.includes('high')) return 'hoch';
  if (normalized.includes('mittel') || normalized.includes('medium')) return 'mittel';
  if (normalized.includes('niedrig') || normalized.includes('low')) return 'niedrig';
  return priorityName;
}

function friendlyFetchError(err, context) {
  const message = err?.message || 'Unbekannter Fehler';
  const isNetworkError = err?.name === 'TypeError' || /Failed to fetch/i.test(message);

  if (isNetworkError) {
    return (
      'Netzwerk-/CORS-Fehler: Browser blockiert die Antwort. ' +
      'Gleicher Origin oder Proxy mit CORS-Headern nötig.' +
      (context ? ` (${context})` : '')
    );
  }

  return context ? `${context}: ${message}` : message;
}

function normalizeApiBase(input) {
  if (!input) return '';
  const trimmed = input.trim();

  try {
    const parsed = new URL(trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const apiIndex = segments.findIndex((part) => part.toLowerCase() === 'api');
    const baseSegments = apiIndex === -1 ? segments : segments.slice(0, apiIndex);
    const basePath = baseSegments.length ? `/${baseSegments.join('/')}` : '';
    return `${parsed.protocol}//${parsed.host}${basePath}`.replace(/\/$/, '');
  } catch (err) {
    console.warn('API-URL konnte nicht geparst werden', err);
  }

  return trimmed.replace(/\/$/, '').replace(/\/api(\/v3)?$/i, '');
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [versionsByProject, setVersionsByProject] = useState({});
  const [workItems, setWorkItems] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiUrl, setApiUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [connectionState, setConnectionState] = useState({ status: 'idle', message: '' });
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingWorkItems, setLoadingWorkItems] = useState(false);
  const [error, setError] = useState('');

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

  const apiBase = useMemo(() => normalizeApiBase(apiUrl), [apiUrl]);
  const apiRoot = useMemo(() => (apiBase ? `${apiBase}/api/v3` : ''), [apiBase]);
  const authHeaders = useMemo(
    () => (apiToken ? { Authorization: `Basic ${btoa(`${apiToken}:X`)}` } : {}),
    [apiToken],
  );

  const testConnection = useCallback(async () => {
    if (!apiRoot || !apiToken) {
      setConnectionState({ status: 'error', message: 'API-URL und Token werden benötigt.' });
      return;
    }

    setConnectionState({ status: 'loading', message: 'Prüfe Verbindung …' });
    try {
      const res = await fetch(`${apiRoot}/users/me`, {
        headers: {
          ...authHeaders,
          Accept: 'application/hal+json',
        },
      });

      if (!res.ok) {
        throw new Error(`Verbindung fehlgeschlagen (${res.status} ${res.statusText || ''} @ ${res.url})`);
      }

      const json = await res.json();
      setConnectionState({
        status: 'success',
        message: `Verbunden als ${json.name || json.login || 'User'}`,
      });
    } catch (err) {
      setConnectionState({ status: 'error', message: friendlyFetchError(err, 'Verbindungstest') });
    }
  }, [apiRoot, apiToken, authHeaders]);

  const loadProjects = useCallback(async () => {
    if (!apiRoot || !apiToken) {
      setError('Bitte trage API-URL und Token ein.');
      return;
    }
    setError('');
    setLoadingProjects(true);

    try {
      const res = await fetch(`${apiRoot}/projects?filters=[{"active":{"operator":"=","values":["t"]}}]`, {
        headers: {
          ...authHeaders,
          Accept: 'application/hal+json',
        },
      });

      if (!res.ok) {
        throw new Error(`Projekte konnten nicht geladen werden (${res.status} ${res.statusText || ''} @ ${res.url})`);
      }

      const json = await res.json();
      const items = json._embedded?.elements || json._embedded?.projects || [];
      const normalized = items.map((project) => ({
        id: project.id,
        name: project.name,
        key: project.identifier,
        manager: project._embedded?.responsible?.name || 'Unbekannt',
        status: project.active ? 'active' : 'inactive',
        color: colorFromId(project.id),
        description: project.description?.raw,
      }));
      setProjects(normalized);
      setSelectedProjects(normalized.map((p) => p.id));
    } catch (err) {
      setError(friendlyFetchError(err, 'Projekte laden'));
      setProjects([]);
      setSelectedProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [apiRoot, apiToken, authHeaders]);

  const loadVersions = useCallback(
    async (projectIds) => {
      if (!projectIds.length || !apiRoot || !apiToken) return;
      const nextVersions = {};

      for (const projectId of projectIds) {
        try {
          const res = await fetch(`${apiRoot}/projects/${projectId}/versions`, {
            headers: {
              ...authHeaders,
              Accept: 'application/hal+json',
            },
          });

          if (!res.ok) continue;
          const json = await res.json();
          const versions = json._embedded?.elements || json._embedded?.versions || [];
          nextVersions[projectId] = versions
            .filter((v) => v.status !== 'closed')
            .map((version) => ({
              id: version.id,
              name: version.name,
              date: version.dueDate,
              owner: version._embedded?.responsible?.name || 'Projektteam',
            }));
        } catch (err) {
          console.warn('Version fetch failed', err);
        }
      }

      setVersionsByProject((prev) => ({ ...prev, ...nextVersions }));
    },
    [apiRoot, apiToken, authHeaders],
  );

  const loadWorkItems = useCallback(async () => {
    if (!selectedProjects.length || !apiRoot || !apiToken) {
      setWorkItems([]);
      return;
    }
    setLoadingWorkItems(true);

    try {
      const filterParam = encodeURIComponent(
        JSON.stringify([{ project: { operator: '=', values: selectedProjects.map(String) } }]),
      );
      const res = await fetch(`${apiRoot}/work_packages?filters=${filterParam}&pageSize=50`, {
        headers: {
          ...authHeaders,
          Accept: 'application/hal+json',
        },
      });

      if (!res.ok) {
        throw new Error(`Work Items konnten nicht geladen werden (${res.status} ${res.statusText || ''} @ ${res.url})`);
      }

      const json = await res.json();
      const items = json._embedded?.elements || [];
      const normalized = items.map((item) => ({
        id: item.id,
        subject: item.subject,
        projectId: item._embedded?.project?.id,
        projectName: item._embedded?.project?.name,
        type: item._embedded?.type?.name,
        priority: normalizePriority(item._embedded?.priority?.name),
        status: item._embedded?.status?.name,
        dueDate: item.dueDate,
        assignee: item._embedded?.assignee?.name || 'Unzugewiesen',
      }));
      setWorkItems(normalized);
    } catch (err) {
      setError(friendlyFetchError(err, 'Work Items laden'));
      setWorkItems([]);
    } finally {
      setLoadingWorkItems(false);
    }
  }, [selectedProjects, apiRoot, apiToken, authHeaders]);

  useEffect(() => {
    if (apiRoot && apiToken) {
      loadProjects();
    }
  }, [apiRoot, apiToken, loadProjects]);

  useEffect(() => {
    if (selectedProjects.length) {
      loadVersions(selectedProjects);
      loadWorkItems();
    }
  }, [selectedProjects, loadVersions, loadWorkItems]);

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      const statusMatches = statusFilter === 'all' || project.status === statusFilter;
      const textMatches = `${project.name} ${project.key}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return selectedProjects.includes(project.id) && statusMatches && textMatches;
    });
  }, [projects, searchTerm, selectedProjects, statusFilter]);

  const aggregate = useMemo(() => {
    const open = workItems.length;
    const critical = workItems.filter((item) => normalizePriority(item.priority) === 'hoch').length;
    const upcoming = workItems.filter((item) => item.dueDate && new Date(item.dueDate) < new Date(Date.now() + 30 * 86400000)).length;
    const milestoneCount = visibleProjects.reduce(
      (count, project) => count + (versionsByProject[project.id]?.length || 0),
      0,
    );

    return { open, critical, upcoming, milestoneCount };
  }, [workItems, visibleProjects, versionsByProject]);

  const toggleProject = (id) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((projectId) => projectId !== id) : [...prev, id],
    );
  };

  const handleExport = useCallback(() => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      projects: visibleProjects,
      workItems,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'opdashboard-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [visibleProjects, workItems]);

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
          <div className="button-row">
            <button className="ghost" onClick={testConnection}>
              Verbindung testen
            </button>
            <button className="primary" onClick={loadProjects} disabled={loadingProjects}>
              {loadingProjects ? 'Lädt …' : 'Projekte laden'}
            </button>
          </div>
          <p className="hint">Normalisierte API-Basis: {apiRoot || '—'}{apiRoot && '/…'}</p>
          {connectionState.status === 'loading' && <p className="hint">{connectionState.message}</p>}
          {connectionState.status === 'success' && <p className="hint success">{connectionState.message}</p>}
          {connectionState.status === 'error' && <p className="hint error">{connectionState.message}</p>}
          {error && <p className="hint error">{error}</p>}
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
                  value="active"
                  checked={statusFilter === 'active'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                Aktiv
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={statusFilter === 'inactive'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                Inaktiv
              </label>
            </div>
            <div className="project-list">
              {projects.length === 0 && <p className="hint">Keine Projekte geladen.</p>}
              {projects.map((project) => (
                <label key={project.id} className="project-item">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => toggleProject(project.id)}
                  />
                  <span className="dot" style={{ background: project.color }} />
                  <div>
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">{project.key || '–'} • {project.manager}</div>
                  </div>
                  <span className={`status status-${project.status}`}>{statusLabels[project.status] || 'Status'}</span>
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
            <div className="button-row">
              <button className="ghost" onClick={loadWorkItems} disabled={loadingWorkItems}>
                {loadingWorkItems ? 'Aktualisiert …' : 'Work Items laden'}
              </button>
              <button className="primary" onClick={handleExport}>
                Exportieren
              </button>
            </div>
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
                  {project.description ? (
                    <span className="objective">{project.description}</span>
                  ) : (
                    <span className="objective muted">Keine Beschreibung hinterlegt</span>
                  )}
                </div>
                <div className="milestones">
                  {(versionsByProject[project.id] || []).map((milestone) => (
                    <div key={milestone.id} className="milestone">
                      <div>
                        <p className="milestone-name">{milestone.name}</p>
                        <p className="milestone-owner">Owner: {milestone.owner}</p>
                      </div>
                      <div className="milestone-date">{formatDate(milestone.date)}</div>
                    </div>
                  ))}
                  {(!versionsByProject[project.id] || versionsByProject[project.id].length === 0) && (
                    <div className="milestone muted">Keine Milestones gefunden</div>
                  )}
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
              <span className="pill">{workItems.length} Einträge</span>
            </div>
            {loadingWorkItems && <p className="hint">Lade Work Items …</p>}
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
              {workItems.map((item) => (
                <div key={item.id} className="table-row">
                  <div>#{item.id}</div>
                  <div>{item.type}</div>
                  <div className="project-cell">
                    <span className="dot" style={{ background: colorFromId(item.projectId) }} />
                    {item.projectName || item.projectId}
                  </div>
                  <div>{item.subject}</div>
                  <div>
                    <span
                      className="priority"
                      style={{ background: priorityColors[normalizePriority(item.priority)] || '#111827' }}
                    >
                      {normalizePriority(item.priority)}
                    </span>
                  </div>
                  <div>{item.status}</div>
                  <div>{formatDate(item.dueDate)}</div>
                  <div>{item.assignee}</div>
                </div>
              ))}
              {workItems.length === 0 && (
                <div className="table-row">
                  <div className="full-width muted">Keine Work Items geladen.</div>
                </div>
              )}
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
