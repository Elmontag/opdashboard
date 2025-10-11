import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../../.env.test') : undefined,
});

type TargetType = {
  milestone: string;
  deliverable: string;
  externalGoal: string;
  internalGoal: string;
  offer: string;
};

const parseTargetTypes = (input: string | undefined): TargetType => {
  const [milestone = 'Milestone', deliverable = 'Deliverable', externalGoal = 'Goal', internalGoal = 'Internal Goal', offer = 'Angebot'] = (input ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    milestone,
    deliverable,
    externalGoal,
    internalGoal,
    offer,
  };
};

export const env = {
  port: Number(process.env.PORT ?? 8080),
  baseUrl: process.env.OP_BASE_URL ?? 'https://example.openprojectcloud.de',
  apiToken: process.env.OP_API_TOKEN ?? '',
  username: process.env.OP_USERNAME ?? 'apikey',
  useMock: process.env.OP_USE_MOCK?.toLowerCase() === 'true',
  targetTypes: parseTargetTypes(process.env.OP_TARGET_TYPES),
};
