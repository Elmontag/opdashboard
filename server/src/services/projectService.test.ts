import { calculateAggregate } from './projectService';
import { Project } from './mockDataService';

describe('calculateAggregate', () => {
  it('berechnet Kennzahlen für mehrere Projekte', () => {
    const projects: Project[] = [
      {
        id: 1,
        name: 'Alpha',
        identifier: 'alpha',
        status: 'active',
        workPackages: [
          {
            id: 1,
            subject: 'M1',
            type: 'Milestone',
            status: 'closed',
            assignee: 'Alex',
            dueDate: '2024-05-01',
            priority: 'high',
          },
          {
            id: 2,
            subject: 'D1',
            type: 'Deliverable',
            status: 'open',
            assignee: 'Bob',
            dueDate: '2024-05-02',
            priority: 'normal',
          },
        ],
        offers: [
          {
            id: 'OF-1',
            freelancer: 'Test',
            status: 'negotiation',
            deadline: '2024-05-10',
            budget: 1000,
            documents: [],
            history: [],
          },
        ],
      },
      {
        id: 2,
        name: 'Beta',
        identifier: 'beta',
        status: 'active',
        workPackages: [
          {
            id: 3,
            subject: 'M2',
            type: 'Milestone',
            status: 'open',
            assignee: 'Cara',
            dueDate: '2024-06-01',
            priority: 'high',
          },
        ],
        offers: [],
      },
    ];

    const result = calculateAggregate(projects);

    expect(result.projectCount).toBe(2);
    expect(result.highPriorityMilestones).toBe(2);
    expect(result.highPriorityDeliverables).toBe(0);
    expect(result.openOffers).toBe(1);
    expect(result.milestoneCompletion).toBeCloseTo(0.5);
  });
});
