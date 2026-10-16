export function csvCell(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (cell !== '' || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
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
  const a = left.split(/\r?\n/);
  const b = right.split(/\r?\n/);
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
      } else if (j < b.length && (i === a.length || dp[i][j + 1] >= dp[i + 1][j])) {
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
