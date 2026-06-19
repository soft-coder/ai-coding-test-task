// Generates the typed API client from the `front` OpenAPI spec using the
// Dockerized openapitools/openapi-generator-cli (no local Java needed).
//
// The spec URL is read from .env (SWAGGER_URL) so it stays out of git. The spec
// is fetched, stripped of any `servers` (so no host leaks into committed output),
// and written to a gitignored temp file that the container reads. The generated
// client under src/app/core/api IS committed, so the app builds without Docker.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function loadDotEnv() {
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

const specUrl = process.env.SWAGGER_URL ?? loadDotEnv().SWAGGER_URL;
if (!specUrl) {
  console.error('[gen:api] SWAGGER_URL is not set — add it to .env (see .env.example).');
  process.exit(1);
}

const IMAGE = 'openapitools/openapi-generator-cli:v7.11.0';
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
  'docker run --rm',
  `-v "${process.cwd()}:/local"`,
  IMAGE,
  'generate',
  `-i /local/${SPEC_LOCAL}`,
  '-g typescript-angular',
  `-o /local/${OUT_DIR}`,
  '--additional-properties=ngVersion=19.2.0,providedInRootForServices=root,fileNaming=kebab-case,withInterfaces=true',
].join(' ');

console.log('[gen:api] running openapi-generator-cli (Docker)…');
execSync(cmd, { stdio: 'inherit' });
console.log(`[gen:api] done → ${OUT_DIR}`);
