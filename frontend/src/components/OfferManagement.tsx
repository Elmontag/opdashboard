import { FC, useMemo, useState } from 'react';
import { Offer, Project } from '../types';
import { saveOffer } from '../services/api';

type OfferManagementProps = {
  project?: Project;
  onPersist: (offer: Offer) => void;
};

const defaultOffer = (projectId: number): Offer => ({
  id: `OF-${projectId}-${Date.now()}`,
  freelancer: '',
  status: 'draft',
  deadline: new Date().toISOString().slice(0, 10),
  budget: 0,
  documents: [],
  history: [],
});

const statusOptions = ['draft', 'negotiation', 'submitted', 'won', 'lost'];

export const OfferManagement: FC<OfferManagementProps> = ({ project, onPersist }) => {
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const offers = useMemo(() => project?.offers ?? [], [project?.offers]);

  if (!project) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Wähle ein Projekt aus, um Angebotsdaten zu pflegen.
      </section>
    );
  }

  const handleSave = async () => {
    if (!editingOffer) return;

    try {
      const persisted = await saveOffer(project.id, editingOffer);
      onPersist(persisted);
      setEditingOffer(null);
    } catch (error) {
      console.error(error);
      alert('Angebot konnte nicht gespeichert werden.');
    }
  };

  const handleStart = (offer?: Offer) => {
    setEditingOffer(offer ?? defaultOffer(project.id));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800">Offene Angebote</h3>
          <p className="text-sm text-slate-500">Freelancer-Angebote inklusive Budget und Fälligkeit verwalten.</p>
        </header>
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Freelancer</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Budget</th>
              <th className="px-6 py-3">Deadline</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-brand-50/60">
                <td className="px-6 py-3 font-mono text-xs text-slate-500">{offer.id}</td>
                <td className="px-6 py-3 text-sm text-slate-700">{offer.freelancer}</td>
                <td className="px-6 py-3 text-sm capitalize text-slate-700">{offer.status}</td>
                <td className="px-6 py-3 text-sm text-slate-700">{offer.budget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                <td className="px-6 py-3 text-sm text-slate-700">{offer.deadline}</td>
                <td className="px-6 py-3">
                  <button
                    type="button"
                    onClick={() => handleStart(offer)}
                    className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                  >
                    Bearbeiten
                  </button>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-sm text-slate-500">
                  Keine Angebote vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Angebot bearbeiten</h3>
            <button
              type="button"
              onClick={() => handleStart()}
              className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              Neues Angebot
            </button>
          </div>
        </header>

        {editingOffer ? (
          <form
            className="space-y-4 px-6 py-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSave().catch((error) => console.error(error));
            }}
          >
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Freelancer
              <input
                type="text"
                required
                value={editingOffer.freelancer}
                onChange={(event) => setEditingOffer({ ...editingOffer, freelancer: event.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Status
              <select
                value={editingOffer.status}
                onChange={(event) => setEditingOffer({ ...editingOffer, status: event.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status} className="capitalize">
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Budget (EUR)
              <input
                type="number"
                min={0}
                value={editingOffer.budget}
                onChange={(event) => setEditingOffer({ ...editingOffer, budget: Number(event.target.value) })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Deadline
              <input
                type="date"
                value={editingOffer.deadline}
                onChange={(event) => setEditingOffer({ ...editingOffer, deadline: event.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Dokument-Link
              <input
                type="url"
                placeholder="https://…"
                onBlur={(event) => {
                  const value = event.target.value.trim();
                  if (value) {
                    setEditingOffer({
                      ...editingOffer,
                      documents: [...editingOffer.documents, { name: 'Dokument', url: value }],
                    });
                    event.target.value = '';
                  }
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <span className="text-[10px] text-slate-400">Link einfügen und mit Enter bestätigen.</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {editingOffer.documents.map((document, index) => (
                <span key={`${document.url}-${index}`} className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  {document.name}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingOffer({
                        ...editingOffer,
                        documents: editingOffer.documents.filter((_, idx) => idx !== index),
                      })
                    }
                    className="text-brand-500 hover:text-brand-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingOffer(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Speichern
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-slate-500">Wähle ein Angebot oder lege ein neues an.</div>
        )}
      </div>
    </section>
  );
};
