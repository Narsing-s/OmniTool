import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, parseCSV } from '../src/utils.js';

test('parses simple CSV rows', () => {
  assert.deepEqual(parseCSV('name,age\nAsha,29\nRavi,31'), [['name','age'],['Asha','29'],['Ravi','31']]);
});

test('parses quoted commas and escaped quotes', () => {
  assert.deepEqual(parseCSV('name,note\nAsha,"hello, ""world"""'), [['name','note'],['Asha','hello, "world"']]);
});

test('handles CRLF and trailing newline', () => {
  assert.deepEqual(parseCSV('a,b\r\n1,2\r\n'), [['a','b'],['1','2']]);
});

test('rejects an unclosed quoted field', () => {
  assert.throws(() => parseCSV('name,note\nAsha,"oops'), /unclosed quoted field/i);
});

test('quotes CSV values that contain separators or quotes', () => {
  assert.equal(csvCell('hello, world'), '"hello, world"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell('plain'), 'plain');
});

test('analyzes Unicode text, whitespace, UTF-8 bytes and lines', () => {
  assert.deepEqual(analyzeText('Hi 🌍\nthere'), {
    characters: 11,
    unicodeCodePoints: 10,
    utf8Bytes: 13,
    utf8Kilobytes: '0.013',
    words: 3,
    lines: 2,
  });
});

test('returns zero words for whitespace-only text', () => {
  assert.equal(analyzeText('  \n\t ').words, 0);
});
