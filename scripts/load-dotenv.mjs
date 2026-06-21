// Minimal .env reader shared by the gen-* scripts. Avoids a dependency just to
// read a couple of keys; `process.env` still takes precedence at the call site.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Parse `.env` in the current working directory into a plain object (empty if absent). */
export function loadDotEnv() {
  const env = {};
  const path = join(process.cwd(), '.env');
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}
