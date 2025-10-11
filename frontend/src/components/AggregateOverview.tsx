import { FC } from 'react';
import { AggregateMetrics } from '../types';

type AggregateOverviewProps = {
  metrics?: AggregateMetrics;
  isLoading: boolean;
};

const formatPercent = (value: number | undefined): string => {
  if (value === undefined) {
    return '–';
  }
  return `${Math.round(value * 100)}%`;
};

export const AggregateOverview: FC<AggregateOverviewProps> = ({ metrics, isLoading }) => (
  <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {[
      {
        label: 'Projekte',
        value: metrics?.projectCount?.toString() ?? '0',
        description: 'Anzahl ausgewählter Projekte',
      },
      {
        label: 'Meilensteinerfüllung',
        value: formatPercent(metrics?.milestoneCompletion),
        description: 'Erfüllte Meilensteine vs. offen',
      },
      {
        label: 'Priorisierte Meilensteine',
        value: metrics?.highPriorityMilestones?.toString() ?? '0',
        description: 'Hohe Priorität über alle Projekte',
      },
      {
        label: 'Priorisierte Deliverables',
        value: metrics?.highPriorityDeliverables?.toString() ?? '0',
        description: 'Offene Deliverables mit hoher Priorität',
      },
      {
        label: 'Offene Angebote',
        value: metrics?.openOffers?.toString() ?? '0',
        description: 'Offene Angebote und Follow-Ups',
      },
    ].map((card) => (
      <article
        key={card.label}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-sm font-medium text-slate-500">{card.label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{isLoading ? '…' : card.value}</p>
        <p className="mt-1 text-xs text-slate-500">{card.description}</p>
      </article>
    ))}
  </section>
);
