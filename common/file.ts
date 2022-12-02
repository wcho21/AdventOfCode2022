// file I/O library

import { readFileSync } from 'fs';

export function getInputFileLines(path: string): string[] {
  const text = readInputFile(path);
  const lines = text.trim().split('\n');

  return lines;
}

function readInputFile(path: string): string {
  const text = readFileSync(path).toString();
  return text;
}
