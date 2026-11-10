import { vaultAssets } from 'virtual:vault-assets';

/**
 * Obsidian vault bridge.
 *
 * Markdown notes in /denis_portfolio are imported as raw strings at build
 * time. Frontmatter is parsed with a small YAML subset so the site has no
 * runtime fetch, no API calls and no extra markdown dependencies.
 *
 * Supported frontmatter:
 *   key: value
 *   key: [one, two, three]
 *   key:
 *     - one
 *     - two
 *   key:
 *     child: value
 */

const NOTE_SOURCES = import.meta.glob('/denis_portfolio/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const toPosix = (value) => value.replace(/\\/g, '/');

const basename = (value) =>
  toPosix(value)
    .split('/')
    .pop()
    .replace(/\.md$/i, '');

const stripOrderPrefix = (value) => value.replace(/^\s*\d+\s*[-–—]\s*/, '').trim();

const slugify = (value) =>
  stripOrderPrefix(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const numberOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function splitFrontmatter(raw) {
  const text = String(raw).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) return { yaml: '', body: text.trim() };

  return {
    yaml: match[1],
    body: text.slice(match[0].length).trim(),
  };
}

function splitInline(value) {
  const items = [];
  let current = '';
  let quote = '';
  let depth = 0;

  for (const character of value) {
    if (quote) {
      current += character;
      if (character === quote) quote = '';
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      current += character;
      continue;
    }

    if (character === '[' || character === '{') depth += 1;
    if (character === ']' || character === '}') depth -= 1;

    if (character === ',' && depth === 0) {
      items.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  if (current.trim()) items.push(current.trim());
  return items;
}

function parseScalar(raw) {
  const value = String(raw).trim();

  if (!value) return '';

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    const unquoted = value.slice(1, -1);
    return value.startsWith('"')
      ? unquoted.replace(/\\"/g, '"').replace(/\\n/g, '\n')
      : unquoted.replace(/''/g, "'");
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    return splitInline(value.slice(1, -1)).map(parseScalar);
  }

  if (/^(true|yes)$/i.test(value)) return true;
  if (/^(false|no)$/i.test(value)) return false;
  if (/^(null|~)$/i.test(value)) return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);

  return value;
}

function parseKeyValue(content) {
  const colon = content.indexOf(':');
  if (colon <= 0) return null;

  const key = content.slice(0, colon).trim();
  if (!/^[\w .-]+$/.test(key)) return null;

  return {
    key,
    value: content.slice(colon + 1).trim(),
  };
}

function parseBlock(lines, start, indent) {
  const isList = lines[start].content.startsWith('- ');
  const result = isList ? [] : {};
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) break;
    if (line.indent > indent) {
      index += 1;
      continue;
    }

    if (isList) {
      if (!line.content.startsWith('- ')) break;

      const rest = line.content.slice(2).trim();
      const pair = parseKeyValue(rest);

      if (!pair) {
        result.push(parseScalar(rest));
        index += 1;
        continue;
      }

      const item = {};

      if (pair.value === '') {
        const next = lines[index + 1];
        if (next && next.indent > indent) {
          const [child, nextIndex] = parseBlock(lines, index + 1, next.indent);
          item[pair.key] = child;
          index = nextIndex;
        } else {
          item[pair.key] = null;
          index += 1;
        }
      } else {
        item[pair.key] = parseScalar(pair.value);
        index += 1;
      }

      const next = lines[index];
      if (next && next.indent > indent && !next.content.startsWith('- ')) {
        const [child, nextIndex] = parseBlock(lines, index, next.indent);
        Object.assign(item, child);
        index = nextIndex;
      }

      result.push(item);
      continue;
    }

    if (line.content.startsWith('- ')) break;

    const pair = parseKeyValue(line.content);
    if (!pair) {
      index += 1;
      continue;
    }

    if (pair.value === '') {
      const next = lines[index + 1];
      if (next && next.indent > indent) {
        const [child, nextIndex] = parseBlock(lines, index + 1, next.indent);
        result[pair.key] = child;
        index = nextIndex;
      } else {
        result[pair.key] = null;
        index += 1;
      }
      continue;
    }

    result[pair.key] = parseScalar(pair.value);
    index += 1;
  }

  return [result, index];
}

function parseYaml(source) {
  const lines = source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const indent = line.match(/^ */)[0].length;
      return {
        indent,
        content: line.slice(indent),
      };
    })
    .filter((line) => line.content.trim() && !line.content.trimStart().startsWith('#'));

  if (!lines.length) return {};

  const [result] = parseBlock(lines, 0, lines[0].indent);
  return result && !Array.isArray(result) ? result : {};
}

export function parseNote(raw) {
  const { yaml, body } = splitFrontmatter(raw);
  return {
    data: parseYaml(yaml),
    body,
  };
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

export function renderInline(markdown) {
  if (!markdown) return '';

  let html = escapeHtml(markdown);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (match, label, href) => {
      const external = /^https?:\/\//i.test(href);
      const attributes = external
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      return `<a href="${href}"${attributes}>${label}</a>`;
    },
  );
  html = html.replace(/\[\[([^\]]+)\]\]/g, '<span class="vault-link">$1</span>');

  return html;
}

const isBlockStart = (line) =>
  /^(#{2,4}\s+|[-*+]\s+|\d+\.\s+|>\s?|```|---|\*\*\*)/.test(line.trim());

export function renderMarkdown(markdown) {
  if (!markdown) return '';

  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`);
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trim())) {
        items.push(renderInline(lines[index].trim().replace(/^[-*+]\s+/, '')));
        index += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(renderInline(lines[index].trim().replace(/^\d+\.\s+/, '')));
        index += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push('<hr />');
      index += 1;
      continue;
    }

    const paragraph = [trimmed];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || isBlockStart(next)) break;
      paragraph.push(next);
      index += 1;
    }

    blocks.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return blocks.join('\n');
}

export function plainText(markdown) {
  if (!markdown) return '';

  return String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/^[-+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSections(markdown) {
  const sections = { intro: [] };
  let current = 'intro';

  for (const line of String(markdown || '').replace(/\r\n/g, '\n').split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1].trim().toLowerCase();
      sections[current] = [];
      continue;
    }
    sections[current]?.push(line);
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, lines]) => [key, lines.join('\n').trim()]),
  );
}

export function extractListItems(markdown) {
  if (!markdown) return [];

  return String(markdown)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*+]\s+/.test(line))
    .map((line) => line.replace(/^[-*+]\s+/, '').trim());
}

const noteId = (path, data, base) => data.slug || slugify(base || path);

export const vaultNotes = Object.entries(NOTE_SOURCES)
  .map(([path, raw]) => {
    const relativePath = toPosix(path).replace(/^\/denis_portfolio\//, '');
    const { data, body } = parseNote(raw);
    const title = data.title || stripOrderPrefix(basename(path));

    return {
      id: noteId(relativePath, data, stripOrderPrefix(basename(path))),
      path: relativePath,
      folder: relativePath.includes('/') ? relativePath.split('/')[0] : 'root',
      title,
      graphLabel: data.graphLabel || title,
      group: data.group || (relativePath.includes('/') ? relativePath.split('/')[0] : 'note'),
      order: numberOr(data.order, 999),
      data,
      body,
      html: renderMarkdown(body),
    };
  })
  .filter((note) => note.data.publish === true)
  .sort((a, b) => a.path.localeCompare(b.path));

export function noteByPath(relativePath) {
  return vaultNotes.find((note) => note.path === relativePath) ?? null;
}

export function notesIn(folder) {
  return vaultNotes
    .filter((note) => note.folder === folder)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function resolveAsset(name) {
  if (!name) return null;

  const key = toPosix(String(name).trim()).split('/').pop();
  const asset = vaultAssets[key] ?? null;

  if (!asset && import.meta.env.DEV) {
    console.warn(`[vault] Missing asset "${key}". Add it to src/images or src/certificate.`);
  }

  return asset;
}

const MAX_SIGNALS = 4;

export function parseSignals(value, fallback = []) {
  if (!Array.isArray(value) || !value.length) return fallback;

  const parsed = value
    .map((item) => {
      if (item && typeof item === 'object') {
        return {
          value: numberOr(item.value, 0),
          suffix: item.suffix ?? '',
          decimals: numberOr(item.decimals, 0),
          label: item.label ?? '',
        };
      }

      const parts = String(item).split('|').map((part) => part.trim());
      if (parts.length < 4) return null;

      return {
        value: numberOr(parts[0], 0),
        suffix: parts[1],
        decimals: numberOr(parts[2], 0),
        label: parts[3],
      };
    })
    .filter((item) => item && item.label)
    .slice(0, MAX_SIGNALS);

  return parsed.length ? parsed : fallback;
}

export function parsePairs(value, fallback = []) {
  if (!Array.isArray(value) || !value.length) return fallback;

  const parsed = value
    .map((item) => {
      if (item && typeof item === 'object') {
        return { name: item.name ?? '', level: item.level ?? '' };
      }

      const [name, ...rest] = String(item).split('|');
      return { name: (name || '').trim(), level: rest.join('|').trim() };
    })
    .filter((item) => item.name);

  return parsed.length ? parsed : fallback;
}

/* ------------------------------------------------------------------ *
 * Knowledge graph
 * ------------------------------------------------------------------ */

const normalizeName = (value) =>
  stripOrderPrefix(String(value))
    .replace(/\.md$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const graphNodes = vaultNotes.filter((note) => note.data.graph !== false);
const nodeLookup = new Map();

for (const note of graphNodes) {
  const aliases = new Set([
    note.title,
    note.graphLabel,
    note.id,
    stripOrderPrefix(basename(note.path)),
  ]);

  for (const alias of aliases) {
    if (alias) nodeLookup.set(normalizeName(alias), note.id);
  }
}

const linkSet = new Set();
const graphLinks = [];

const addLink = (source, targetName) => {
  const target = nodeLookup.get(normalizeName(targetName));
  if (!target || target === source) return;

  const key = [source, target].sort().join('::');
  if (linkSet.has(key)) return;

  linkSet.add(key);
  graphLinks.push({ source, target });
};

for (const note of graphNodes) {
  const related = Array.isArray(note.data.related) ? note.data.related : [];
  related.forEach((name) => addLink(note.id, name));

  for (const match of note.body.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) {
    addLink(note.id, match[1]);
  }
}

export const vaultGraph = {
  nodes: graphNodes.map((note) => ({
    id: note.id,
    label: note.graphLabel,
    title: note.title,
    group: note.group,
    path: note.path,
    order: note.order,
  })),
  links: graphLinks,
};

export const vaultStats = {
  notes: vaultGraph.nodes.length,
  links: vaultGraph.links.length,
};
