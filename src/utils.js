export function csvCell(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false, quoteClosed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { quoted = false; quoteClosed = true; }
      else cell += c;
      continue;
    }
    if (quoteClosed) {
      if (c === ',') { row.push(cell); cell = ''; quoteClosed = false; }
      else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
        row.push(cell); rows.push(row); row = []; cell = ''; quoteClosed = false;
        if (c === '\r') i++;
      } else {
        throw new Error('CSV has unexpected characters after a closing quote.');
      }
    } else if (c === '"') {
      if (cell !== '') throw new Error('CSV quotes must begin at the start of a field.');
      quoted = true;
    } else if (c === ',') {
      row.push(cell); cell = '';
    } else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
      row.push(cell); rows.push(row); row = []; cell = '';
      if (c === '\r') i++;
    } else {
      cell += c;
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (quoteClosed || cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export function analyzeText(text) {
  const bytes = new TextEncoder().encode(text).length;
  return {
    characters: text.length,
    unicodeCodePoints: Array.from(text).length,
    utf8Bytes: bytes,
    utf8Kilobytes: (bytes / 1024).toFixed(3),
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split('\n').length : 0,
  };
}

export function transformLines(text, mode) {
  const lines = text.split(/\r?\n/);
  switch (mode) {
    case 'sort-asc': return [...lines].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })).join('\n');
    case 'sort-desc': return [...lines].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' })).join('\n');
    case 'unique': {
      const seen = new Set();
      return lines.filter(line => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      }).join('\n');
    }
    case 'trim': return lines.map(line => line.trim()).join('\n');
    case 'reverse': return [...lines].reverse().join('\n');
    default: throw new Error('Choose a valid line operation.');
  }
}


export function compareText(left, right) {
  const a = left === '' ? [] : left.split(/\r?\n/);
  const b = right === '' ? [] : right.split(/\r?\n/);
  const maxCells = 100000;
  let edits = [];

  if (a.length * b.length <= maxCells) {
    const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    let i = 0, j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i] === b[j]) {
        edits.push({ type: 'same', text: a[i++] });
        j++;
      } else if (j < b.length && (i === a.length || dp[i][j + 1] > dp[i + 1][j])) {
        edits.push({ type: 'added', text: b[j++] });
      } else {
        edits.push({ type: 'removed', text: a[i++] });
      }
    }
  } else {
    const count = Math.max(a.length, b.length);
    for (let i = 0; i < count; i++) {
      if (i < a.length && i < b.length && a[i] === b[i]) edits.push({ type: 'same', text: a[i] });
      else {
        if (i < a.length) edits.push({ type: 'removed', text: a[i] });
        if (i < b.length) edits.push({ type: 'added', text: b[i] });
      }
    }
  }

  const added = edits.filter(edit => edit.type === 'added').length;
  const removed = edits.filter(edit => edit.type === 'removed').length;
  const unchanged = edits.filter(edit => edit.type === 'same').length;
  const lines = edits.map(edit => (edit.type === 'same' ? '  ' : edit.type === 'added' ? '+ ' : '- ') + edit.text);
  return `Summary: ${added} added, ${removed} removed, ${unchanged} unchanged ${unchanged === 1 ? 'line' : 'lines'}\n\n${lines.join('\n')}`;
}


export function validateWorkspaceBackup(data, toolIds) {
  if (!data || data.format !== 'OmniTool workspace backup' || data.version !== 1 ||
      !data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) return false;

  const allowed = new Set(['omni:dark', 'omni:fav', 'omni:recent', 'omni:profile', 'omni:checklist']);
  for (const [key, value] of Object.entries(data.settings)) {
    if (!allowed.has(key)) return false;
    if (value === null) continue;
    if (key === 'omni:dark' && typeof value !== 'boolean') return false;
    if ((key === 'omni:fav' || key === 'omni:recent') &&
        (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !toolIds.includes(id)))) return false;
    if (key === 'omni:profile' &&
        (!value || typeof value !== 'object' || Array.isArray(value) ||
         typeof value.name !== 'string' || (value.email !== undefined && typeof value.email !== 'string'))) return false;
    if (key === 'omni:checklist' &&
        (!value || typeof value !== 'object' || Array.isArray(value) ||
         !Array.isArray(value.items) || value.items.some(item => typeof item !== 'string') ||
         !Array.isArray(value.checked) ||
         value.checked.some(index => !Number.isInteger(index) || index < 0 || index >= value.items.length))) return false;
  }
  return true;
}


export function convertJsonToCSV(input) {
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(data) || data.length === 0 ||
      data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('JSON input must be a non-empty array of objects.');
  }
  const headers = [...new Set(data.flatMap(row => Object.keys(row)))];
  if (!headers.length) throw new Error('Provide objects with at least one property.');
  return [headers.map(csvCell).join(','), ...data.map(row =>
    headers.map(key => csvCell(row[key] === undefined || row[key] === null ? '' : row[key])).join(',')
  )].join('\\n');
}
