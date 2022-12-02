// constraint: write every function in five lines or fewer.

import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

type CaloriesList = number[];

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get max sum of calories for given calories
function solvePart1(calories: string[]): number {
  const caloriesSums: number[] = getCaloriesSums(calories);
  const maxSumCalories = caloriesSums.reduce(getMax, 0);

  return maxSumCalories;
}

// solvePart2: get top three sums of calories for given calories
function solvePart2(calories: string[]): number {
  const caloriesSums: number[] = getCaloriesSums(calories);
  const topThree: number[] = pickTopItems(caloriesSums, 3);
  const sum = topThree.reduce(getSum);

  return sum;
}

/*
 * problem-specific
 */

function getCaloriesSums(calories: string[]): number[] {
  const caloriesLists: CaloriesList[] = getCaloriesLists(calories);
  const caloriesSums: number[] = caloriesLists.map(list => list.reduce(getSum));

  return caloriesSums;
}

function getCaloriesLists(calories: string[]): CaloriesList[] {
  const caloriesStringLists: string[][] = sliceByPredicate(calories, entry => entry === '');
  const caloriesNumberLists: CaloriesList[] = caloriesStringLists.map(list => list.map(Number));

  return caloriesNumberLists;
}

/*
 * helper
 */

function pickTopItems<T>(array: T[], length: number): T[] {
  const sorted: T[] = [...array].sort(compareToSortInIncreasingOrder);
  const topItems: T[] = sorted.slice(-3);

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

function getMax(a: number, b: number): number {
  return (a > b) ? a : b;
}

function getSum(a: number, b: number): number {
  return a + b;
}

function compareToSortInIncreasingOrder<T>(a: T, b: T): number {
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}
