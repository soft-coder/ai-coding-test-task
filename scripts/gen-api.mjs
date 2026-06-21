// Generates the typed API client from the `front` OpenAPI spec using
// openapitools/openapi-generator-cli (npm wrapper; needs a local Java runtime).
//
// The spec URL is read from .env (SWAGGER_URL) so it stays out of git. The spec
// is fetched, stripped of any `servers` (so no host leaks into committed output),
// and written to a gitignored temp file. The generated client under
// src/app/core/api IS committed, so the app builds without Java.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadDotEnv } from './load-dotenv.mjs';

function assertJava() {
  try {
    execSync('java -version', { stdio: 'ignore' });
  } catch {
    console.error('[gen:api] Java runtime not found. openapi-generator-cli needs a JRE.');
    console.error('[gen:api] Install one (e.g. `winget install EclipseAdoptium.Temurin.21.JRE`) and retry.');
    process.exit(1);
  }
}

const specUrl = process.env.SWAGGER_URL ?? loadDotEnv().SWAGGER_URL;
if (!specUrl) {
  console.error('[gen:api] SWAGGER_URL is not set — add it to .env (see .env.example).');
  process.exit(1);
}

assertJava();

const OUT_DIR = 'src/app/core/api';
const SPEC_LOCAL = '_design/front-spec.gen.json'; // gitignored

console.log(`[gen:api] fetching spec from ${specUrl}`);
const spec = await fetch(specUrl).then((r) => {
  if (!r.ok) throw new Error(`spec fetch failed: HTTP ${r.status}`);
  return r.json();
});
delete spec.servers; // never bake the host into generated, committed code
writeFileSync(join(process.cwd(), SPEC_LOCAL), JSON.stringify(spec));

const cmd = [
  'npx --no-install @openapitools/openapi-generator-cli generate',
  `-i ${SPEC_LOCAL}`,
  '-g typescript-angular',
  `-o ${OUT_DIR}`,
  // The spec repeats operationIds across references (categories/channels/etc.);
  // each tag becomes its own service so there's no real collision — skip the check.
  '--skip-validate-spec',
  '--additional-properties=ngVersion=19.2.0,fileNaming=kebab-case,withInterfaces=true,supportsES6=true',
].join(' ');

console.log('[gen:api] running openapi-generator-cli…');
execSync(cmd, { stdio: 'inherit' });
console.log(`[gen:api] done → ${OUT_DIR}`);
