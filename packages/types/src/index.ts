// packages/types/src/index.ts
// Single export point — both backend (NestJS) and frontend (Next.js) import from here.
// Frontend forms use these Zod schemas via @hookform/resolvers/zod.
// Backend DTOs use these same schemas via ZodValidationPipe.
// Zero duplication anywhere.

export * from './schemas';
export * from './api-response';
export * from './activity-labels';
