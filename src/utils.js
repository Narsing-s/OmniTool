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
