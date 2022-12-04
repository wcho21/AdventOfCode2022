import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

type section = [number, number];
type sectionPair = [section, section];

// solvePart1: count section pairs where one contains the other
function solvePart1(lines: string[]): number {
  return countFilteredPairs(lines, isContainedByTheOther);

  function isContainedByTheOther(pair: section[]): boolean {
    const isSecondContainedByFirst = ([first, second]: section[]): boolean => (first[0] <= second[0] && second[1] <= first[1]);
    const containedByTheOther = [pair, pair.slice(0).reverse()].some(isSecondContainedByFirst);

    return containedByTheOther;
  }
}

// solvePart2: count section pairs that overlap
function solvePart2(lines: string[]): number {
  return countFilteredPairs(lines, isOverlapped);

  function isOverlapped(pair: section[]): boolean {
    const [first, second] = pair;
    const overlapped = first[0] <= second[1] && second[0] <= first[1];

    return overlapped;
  }
}

function countFilteredPairs(lines: string[], filterCondition: (pairs: section[]) => boolean): number {
  const pairs: sectionPair[] = lines.map(getSectionPair);
  const filtered: sectionPair[] = pairs.filter(filterCondition);
  const count = filtered.length;

  return count;
}

function getSectionPair(line: string): sectionPair {
  const split: section[] = line.split(',').map(parseSection);

  if (split.length !== 2) {
    throw new Error(`Expected two elements but ${split.length}.`);
  }
  const pair: sectionPair = split as sectionPair;

  return pair;
}

function parseSection(section: string): section {
  const [beg, end] = section.split('-');
  return [Number(beg), Number(end)];
}
