/* eslint-disable no-console */
/* global process */
'use strict';

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    production: args.has('--production') || args.has('--prod'),
    watch: args.has('--watch'),
  };
}

function tsconfigPathsPlugin({ tsconfigPath }) {
  const absTsconfigPath = path.resolve(tsconfigPath);
  const raw = JSON.parse(fs.readFileSync(absTsconfigPath, 'utf8'));
  const compilerOptions = raw.compilerOptions || {};
  const baseUrl = compilerOptions.baseUrl ? path.resolve(path.dirname(absTsconfigPath), compilerOptions.baseUrl) : path.dirname(absTsconfigPath);
  const paths = compilerOptions.paths || {};

  /** @type {{prefix: string, targets: string[]}[]} */
  const mappings = Object.entries(paths)
    .map(([key, targets]) => {
      const prefix = key.endsWith('/*') ? key.slice(0, -2) : key;
      const targetList = Array.isArray(targets) ? targets : [targets];
      const resolved = targetList.map((t) => {
        const cleaned = typeof t === 'string' ? t : '';
        const withoutStar = cleaned.replace('/*', '').replace('*', '');
        return path.resolve(baseUrl, withoutStar);
      });
      return { prefix, targets: resolved };
    })
    .filter((m) => m.prefix.length > 0 && m.targets.length > 0);

  return {
    name: 'tsconfig-paths',
    setup(build) {
      build.onResolve({ filter: /^[^./].*/ }, (args) => {
        for (const m of mappings) {
          if (args.path === m.prefix || args.path.startsWith(`${m.prefix}/`)) {
            const suffix = args.path === m.prefix ? '' : args.path.slice(m.prefix.length + 1);
            for (const targetBase of m.targets) {
              const candidate = suffix ? path.join(targetBase, suffix) : targetBase;
              const resolved = resolveCandidate(candidate);
              if (resolved) return { path: resolved };
            }
          }
        }
        return null;
      });
    },
  };
}

function resolveCandidate(candidate) {
  try {
    if (fs.existsSync(candidate)) {
      const stat = fs.statSync(candidate);
      if (stat.isFile()) return candidate;
      if (stat.isDirectory()) {
        const idx = resolveCandidate(path.join(candidate, 'index'));
        if (idx) return idx;
      }
    }

    const exts = ['.ts', '.tsx', '.js', '.mjs', '.cjs'];
    for (const ext of exts) {
      const p = `${candidate}${ext}`;
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    }
  } catch {
    // ignore and fall through
  }

  return null;
}

async function buildAll({ production, watch }) {
  const tsconfig = path.resolve(__dirname, 'tsconfig.json');
  const shared = {
    entryPoints: [path.resolve(__dirname, 'src', 'extension.ts')],
    bundle: true,
    sourcemap: true,
    minify: production,
    tsconfig,
    plugins: [tsconfigPathsPlugin({ tsconfigPath: tsconfig })],
    loader: {
      '.html': 'text',
      '.css': 'text',
    },
    logLevel: 'info',
  };

  const nodeOptions = {
    ...shared,
    platform: 'node',
    format: 'cjs',
    outfile: path.resolve(__dirname, 'dist', 'extension.js'),
    external: ['vscode'],
  };

  const webOptions = {
    ...shared,
    platform: 'browser',
    format: 'cjs',
    outfile: path.resolve(__dirname, 'dist', 'web', 'extension.js'),
    external: ['vscode'],
    define: {
      'process.env.BROWSER': 'true',
    },
  };

  if (watch) {
    const nodeCtx = await esbuild.context(nodeOptions);
    const webCtx = await esbuild.context(webOptions);
    await Promise.all([nodeCtx.watch(), webCtx.watch()]);
    console.log('[esbuild] watching…');
    return;
  }

  await Promise.all([esbuild.build(nodeOptions), esbuild.build(webOptions)]);
}

buildAll(parseArgs(process.argv)).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

