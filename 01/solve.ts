// constraint: write every function in five lines or fewer.

import { readFileSync } from 'fs';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get max sum of calories for given calories
function solvePart1(calories: string[]): number {
  const caloriesSums = getCaloriesSums(calories);
  const maxSumCalories = caloriesSums.reduce(maxFunc, 0);

  return maxSumCalories;
}

// solvePart2: get top three sums of calories for given calories
function solvePart2(calories: string[]): number {
  const caloriesSums = getCaloriesSums(calories);
  const topThree = pickTopItems(caloriesSums, 3);
  const sum = topThree.reduce(sumFunc);

  return sum;
}

/*
 * problem-specific
 */

function getCaloriesSums(calories: string[]): number[] {
  const caloriesLists = getCaloriesLists(calories);
  const caloriesSums = caloriesLists.map(list => list.reduce(sumFunc));

  return caloriesSums;
}

function getCaloriesLists(calories: string[]): number[][] {
  const caloriesStringLists = sliceByPredicate(calories, entry => entry === '');
  const caloriesNumberLists = caloriesStringLists.map(list => list.map(Number));

  return caloriesNumberLists;
}

/*
 * command-line arguments
 */

function getInputFileName() {
  validateCommandLineArguments();
  
  return process.argv[2];
}

function validateCommandLineArguments() {
  if (process.argv.length <= 2) {
    throw new Error('missing input file name');
  }
}

/*
 * I/O
 */

function getInputFileLines(path: string): string[] {
  const text = readInputFile(path);
  const lines = text.trim().split('\n');

  return lines;
}

function readInputFile(path: string): string {
  const text = readFileSync(path).toString();
  return text;
}

/*
 * helper
 */

function pickTopItems<T>(array: T[], length: number): T[] {
  const sorted = [...array].sort(sortInIncreasingOrderCompareFunc);
  const topItems = sorted.slice(-3);

  return topItems;
}

// sliceByPredicate(): slice array into two-dimensional array
//   For example, for array = [1, 2, 3, 4, 5] and predicate (e) => e % 2 === 0,
//   the return value will be [[1], [3], [5]]
function sliceByPredicate<T>(array: T[], predicate: (element: T) => boolean): T[][] {
  const sliced = array.reduce((acc: T[][], elem: T) => {
    return predicate(elem) ? [...acc, []] : [...acc.slice(0, acc.length-1), [...acc[acc.length-1], elem]];
  }, [[]]);

  return sliced;
}

/*
 * util
 */

function maxFunc(a: number, b: number): number {
  return (a > b) ? a : b;
}

function sumFunc(a: number, b: number): number {
  return a + b;
}

function sortInIncreasingOrderCompareFunc<T>(a: T, b: T): number {
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}
