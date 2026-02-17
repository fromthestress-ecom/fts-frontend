import { mkdir, readdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src', 'favicon');
const outDir = path.join(projectRoot, 'public', 'favicon');

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(srcDir))) return;
  await mkdir(outDir, { recursive: true });

  const entries = await readdir(srcDir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);

  await Promise.all(
    files.map(async (name) => {
      await copyFile(path.join(srcDir, name), path.join(outDir, name));
    })
  );

  // eslint-disable-next-line no-console
  console.log(`[sync-favicon] Copied ${files.length} file(s) to public/favicon`);
}

await main();

