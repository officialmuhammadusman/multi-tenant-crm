// apps/api/src/common/env.validation.ts
import { EnvSchema } from '@crm/types';

export function validateEnv(config: Record<string, unknown>) {
  const result = EnvSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  [${e.path.join('.')}] ${e.message}`)
      .join('\n');

    console.error('\n❌ Environment validation failed:\n' + errors + '\n');
    process.exit(1);
  }

  return result.data;
}
