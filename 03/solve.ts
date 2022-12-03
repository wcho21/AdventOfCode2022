import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

type RucksackItem = string;
type Rucksack = string;
type Compartment = string;

// solvePart1: get sum of priorities of common items in compartments
function solvePart1(rucksacks: Rucksack[]): number {
  const compartments: Compartment[][] = rucksacks.map(getCompartments);
  const commonItems: RucksackItem[] = compartments.map(getCommonItemInCompartments);
  const sum: number = getPrioritySum(commonItems);

  return sum;

  function getCompartments(rucksack: Rucksack): Compartment[] {
    return halveString(rucksack);
  }

  function getCommonItemInCompartments(compartments: Compartment[]): RucksackItem {
    return getOneCommonCharacter(compartments);
  }
}

// solvePart2: get sum of priorities of badges
function solvePart2(rucksacks: Rucksack[]): number {
  const grouped: Rucksack[][] = divideRucksacksIntoGroupsOfThree(rucksacks);
  const badges: RucksackItem[] = grouped.map(getCommonItemInRucksacks);
  const sum: number = getPrioritySum(badges);

  return sum;

  function divideRucksacksIntoGroupsOfThree(rucksacks: Rucksack[]): Rucksack[][] {
    const appendMakingGroupsOfThree = (acc: Rucksack[][], elem: Rucksack) => (acc.at(-1)!.length === 3) ? [...acc, [elem]] : [...acc.slice(0, -1), [...acc.at(-1)!, elem]];
    const grouped = rucksacks.reduce(appendMakingGroupsOfThree, [[]]);
    
    return grouped;
  }

  function getCommonItemInRucksacks(rucksacks: Rucksack[]): RucksackItem {
    return getOneCommonCharacter(rucksacks);
  }
}

function halveString(s: string): string[] {
  const halfIndex = Math.floor(s.length / 2);
  const firstHalf: string = s.slice(0, halfIndex);
  const secondHalf: string = s.slice(halfIndex);

  return [firstHalf, secondHalf];
}

function getOneCommonCharacter(array: string[]): string {
  const sets: Set<string>[] = array.map((item: string) => new Set(item));
  const common: Set<string> = getIntersection(...sets);

  if (common.size !== 1) {
    throw new Error(`Expected only one common character, but ${common.size} common characters found (${[...common]})`);
  }
  return [...common][0];
}

function getIntersection<T>(...sets: Set<T>[]): Set<T> {
  const getIntersectionFromTwoSets = (set1: Set<T>, set2: Set<T>) => new Set([...set2].filter(item => set1.has(item)));
  const intersection: Set<T> = sets.slice(1).reduce(getIntersectionFromTwoSets, sets[0]);

  return intersection;
}

function getPrioritySum(items: RucksackItem[]): number {
  const priorities: number[] = items.map(getItemPriority);
  const sum: number = priorities.reduce(getSum);

  return sum;
}

function getItemPriority(item: RucksackItem): number {
  const cc: number = item.charCodeAt(0);
  const acc: number = 'a'.charCodeAt(0);
  const zcc: number = 'z'.charCodeAt(0);
  const Acc: number = 'A'.charCodeAt(0);
  const Zcc: number = 'Z'.charCodeAt(0);

  if (acc <= cc && cc <= zcc) {
    return cc - acc + 1;
  }
  if (Acc <= cc && cc <= Zcc) {
    return cc - Acc + 27;
  }
  throw new Error(`Bad item character ${item}`);
}

function getSum(a: number, b: number) {
  return a + b;
}
