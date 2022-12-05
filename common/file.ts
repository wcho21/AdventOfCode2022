// file I/O library

import { readFileSync } from 'fs';

export function getInputFileLines(path: string): string[] {
  const text = readInputFile(path);
  const trimmed = text.trimEnd(); // remove last end-of-line
  const lines = trimmed.split('\n');

  return lines;
}

function readInputFile(path: string): string {
  const text = readFileSync(path).toString();
  return text;
}
