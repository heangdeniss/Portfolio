import fs from 'node:fs';
import path from 'node:path';

const VIRTUAL_ID = 'virtual:vault-assets';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const ASSET_EXT = /\.(?:png|jpe?g|webp|gif|svg|pdf)$/i;
const SEARCH_DIRS = ['src/images', 'src/certificate'];

function walk(directory, predicate, files = []) {
  if (!fs.existsSync(directory)) return files;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, files);
    } else if (predicate(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Collects file names referenced by Markdown notes. Both quoted values
 * ("Certificate of Completion.pdf") and bare values (creditrisk_pred.jpg)
 * are supported because Obsidian users write both.
 */
function extractAssetNames(markdown) {
  const names = new Set();
  const pattern = /(?:["']([^"']+\.(?:png|jpe?g|webp|gif|svg|pdf))["']|([^\s"'`[\]{}<>|,;]+\.(?:png|jpe?g|webp|gif|svg|pdf)))/gi;

  for (const match of markdown.matchAll(pattern)) {
    const value = (match[1] || match[2] || '').trim();
    if (value) names.add(path.basename(value));
  }

  return names;
}

/**
 * Vite plugin that exposes only the images/PDFs actually referenced by vault
 * notes. This keeps large unreferenced artwork out of the production bundle
 * while still letting the vault reference new files without code changes.
 */
export default function vaultAssets() {
  let root = process.cwd();
  let assetIndex = new Map();

  const scan = () => {
    const vaultDir = path.join(root, 'denis_portfolio');
    const noteFiles = walk(vaultDir, (file) => file.endsWith('.md'));
    const referenced = new Set();

    for (const noteFile of noteFiles) {
      const raw = fs.readFileSync(noteFile, 'utf8');
      for (const name of extractAssetNames(raw)) referenced.add(name);
    }

    const nextIndex = new Map();
    for (const relativeDir of SEARCH_DIRS) {
      const directory = path.join(root, relativeDir);
      for (const file of walk(directory, (name) => ASSET_EXT.test(name))) {
        const name = path.basename(file);
        if (referenced.has(name) && !nextIndex.has(name)) {
          nextIndex.set(name, file);
        }
      }
    }

    assetIndex = nextIndex;
  };

  const virtualModule = () => {
    const imports = [];
    const entries = [];
    let index = 0;

    for (const [name, file] of assetIndex) {
      const relative = `/${path.relative(root, file).split(path.sep).join('/')}`;
      const identifier = `asset${index}`;
      imports.push(`import ${identifier} from ${JSON.stringify(relative)};`);
      entries.push(`  ${JSON.stringify(name)}: ${identifier},`);
      index += 1;
    }

    return [
      ...imports,
      '',
      'export const vaultAssets = {',
      ...entries,
      '};',
      '',
    ].join('\n');
  };

  return {
    name: 'portfolio-vault-assets',

    configResolved(config) {
      root = config.root;
    },

    buildStart() {
      scan();
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;
      scan();
      return virtualModule();
    },

    configureServer(server) {
      const invalidate = (file) => {
        if (!file.endsWith('.md') || !file.includes('denis_portfolio')) return;
        const module = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (module) server.moduleGraph.invalidateModule(module);
      };

      server.watcher.on('add', invalidate);
      server.watcher.on('change', invalidate);
      server.watcher.on('unlink', invalidate);
    },
  };
}
