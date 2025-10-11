export type WorkPackage = {
  id: number;
  subject: string;
  type: string;
  status: string;
  assignee: string;
  dueDate: string;
  priority: string;
};

export type OfferDocument = {
  name: string;
  url: string;
};

export type OfferHistoryEntry = {
  status: string;
  timestamp: string;
};

export type Offer = {
  id: string;
  freelancer: string;
  status: string;
  deadline: string;
  budget: number;
  documents: OfferDocument[];
  history: OfferHistoryEntry[];
};

export type Project = {
  id: number;
  name: string;
  identifier: string;
  status: string;
  workPackages: WorkPackage[];
  offers: Offer[];
};

export type AggregateMetrics = {
  projectCount: number;
  milestoneCompletion: number;
  highPriorityMilestones: number;
  highPriorityDeliverables: number;
  openOffers: number;
};
