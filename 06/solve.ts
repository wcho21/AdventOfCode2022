import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get the index of start-of-packet marker where four characters are all different
function solvePart1(lines: string[]): number {
  const line = lines[0];
  const windowSize = 4;

  return getMarkerPosition(line, windowSize);
}

// solvePart2: get the index of start-of-message marker where fourteen characters are all different
function solvePart2(lines: string[]): number {
  const line = lines[0];
  const windowSize = 14;

  return getMarkerPosition(line, windowSize);
}

function getMarkerPosition(line: string, windowSize: number) {
  const windows = getWindows(line, windowSize);
  const firstIndexWhereAllCharsAreDifferent = windows.findIndex(window => new Set(window).size === windowSize);

  return windowSize + firstIndexWhereAllCharsAreDifferent;
}

// ex: for line='abcd' and windowSize=2, returns ['ab', 'bc', 'cd']
function getWindows(line: string, windowSize: number) {
  const slicedSequences = createRange(windowSize).map(n => line.slice(n, n-windowSize-1 < 0 ? n-windowSize-1 : undefined));
  const windows = zipStrings(slicedSequences);

  return windows;
}

// ex: for arrays=['abc', 'def'], returns ['ad', 'be', 'cf']
function zipStrings(arrays: string[]): string[] {
  const splitStrings: string[][] = arrays.map((_: string) => Array.from(_));
  const zipped: string[] = splitStrings.reduce((acc: string[], cur: string[]) => {
    return acc.map((char: string, i: number) => char + cur[i]);
  });

  return zipped;
}

// ex: for length=3, returns [0, 1, 2]
function createRange(length: number): number[] {
  return Array(length).fill(0).map((v, index) => index);
}
