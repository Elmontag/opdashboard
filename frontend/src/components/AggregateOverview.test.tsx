import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AggregateOverview } from './AggregateOverview';

describe('AggregateOverview', () => {
  it('zeigt Kennzahlen korrekt an', () => {
    render(
      <AggregateOverview
        isLoading={false}
        metrics={{
          projectCount: 3,
          milestoneCompletion: 0.75,
          highPriorityMilestones: 4,
          highPriorityDeliverables: 2,
          openOffers: 1,
        }}
      />,
    );

    expect(screen.getByText('Projekte')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
