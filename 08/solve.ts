import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

type Tree = number;
type TreeGrid = Tree[][];

// solvePart1: get the number of visible trees
function solvePart1(lines: string[]): number {
  const grid: TreeGrid = parseLinesIntoTreeGrid(lines);
  const visibleTrees = getVisibleTrees(grid);
  const numOfVisibleTrees = visibleTrees.length;

  return numOfVisibleTrees;

  function getVisibleTrees(grid: TreeGrid): Tree[] {
    // use for-loops for index operations
    const visibleTrees: Tree[] = [];
    for (let y = 0; y < grid.length; ++y) {
      for (let x = 0; x < grid[0].length; ++x) {
        if (!isTreeVisible(grid, x, y)) {
          continue;
        }
  
        const tree = grid[y][x];
        visibleTrees.push(tree);
      }
    }
  
    return visibleTrees;
  }
  
  function isTreeVisible(grid: TreeGrid, x: number, y: number): boolean {
    const visibilityFunctions = [isTreeVisibleFromLeft, isTreeVisibleFromRight, isTreeVisibleFromTop, isTreeVisibleFromBottom];
    return visibilityFunctions.some(_ => _(grid, x, y));
  }
  
  function isTreeVisibleFromLeft(grid: TreeGrid, x: number, y: number): boolean {
    const tree = grid[y][x];
    const leftTrees = grid[y].slice(0, x);
  
    return isTreeHighest(tree, leftTrees);
  }
  
  function isTreeVisibleFromRight(grid: TreeGrid, x: number, y: number): boolean {
    const tree = grid[y][x];
    const rightTrees = grid[y].slice(x+1);
  
    return isTreeHighest(tree, rightTrees);
  }
  
  function isTreeVisibleFromTop(grid: TreeGrid, x: number, y: number): boolean {
    const tree = grid[y][x];
    const upperTrees = grid.map(trees => trees[x]).slice(0, y);
  
    return isTreeHighest(tree, upperTrees);
  }
  
  function isTreeVisibleFromBottom(grid: TreeGrid, x: number, y: number): boolean {
    const tree = grid[y][x];
    const lowerTrees = grid.map(trees => trees[x]).slice(y+1);
  
    return isTreeHighest(tree, lowerTrees);
  }
  
  function isTreeHighest(tree: Tree, treesToCompare: Tree[]) {
    return treesToCompare.every(_ => _ < tree);
  }
}

// solvePart2: get the highest scenic score
function solvePart2(lines: string[]): number {
  const grid: TreeGrid = parseLinesIntoTreeGrid(lines);
  const scenicScores: number[] = getScenicScores(grid);

  return scenicScores.reduce(getMax);

  function getScenicScores(grid: TreeGrid): Tree[] {
    // use for-loops for index operations
    const countFuncs = [countLeftVisibleTrees, countRightVisibleTrees, countUpperVisibleTrees, countLowerVisibleTrees];
    const scenicScores: number[] = [];
    for (let y = 0; y < grid.length; ++y) {
      for (let x = 0; x < grid[0].length; ++x) {
        const scenicScore = countFuncs.map(f => f(grid, x, y)).reduce(getProduct);
        
        scenicScores.push(scenicScore);
      }
    }

    return scenicScores;
  }

  function countLeftVisibleTrees(grid: TreeGrid, x: number, y: number): number {
    const tree = grid[y][x];
    const leftTrees = grid[y].slice(0, x).reverse();

    const visibleTrees = cutInvisibleTrees(tree, leftTrees);
    return visibleTrees.length;
  }

  function countRightVisibleTrees(grid: TreeGrid, x: number, y: number): number {
    const tree = grid[y][x];
    const rightTrees = grid[y].slice(x+1);

    const visibleTrees = cutInvisibleTrees(tree, rightTrees);
    return visibleTrees.length;
  }

  function countUpperVisibleTrees(grid: TreeGrid, x: number, y: number): number {
    const tree = grid[y][x];
    const upperTrees = grid.map(trees => trees[x]).slice(0, y).reverse();

    const visibleTrees = cutInvisibleTrees(tree, upperTrees);
    return visibleTrees.length;
  }

  function countLowerVisibleTrees(grid: TreeGrid, x: number, y: number): number {
    const tree = grid[y][x];
    const lowerTrees = grid.map(trees => trees[x]).slice(y+1);

    const visibleTrees = cutInvisibleTrees(tree, lowerTrees);
    return visibleTrees.length;
  }

  function cutInvisibleTrees(tree: Tree, trees: Tree[]): Tree[] {
    const visibilityBlockingIndex = findIndexOrGetLast(trees, (_: Tree) => _ >= tree);
    const visibleTrees = trees.slice(0, visibilityBlockingIndex+1);
    return visibleTrees;
  }

  function findIndexOrGetLast<T>(array: T[], predicate: (value: T) => boolean) {
    const INDEX_NOT_FOUND = -1;

    const index = array.findIndex(predicate);
    return index === INDEX_NOT_FOUND ? array.length : index;
  }

  function getMax(a: number, b: number): number {
    return a > b ? a : b;
  }

  function getProduct(a: number, b: number): number {
    return a * b;
  }

}

function parseLinesIntoTreeGrid(lines: string[]) {
  const trees: Tree[][] = lines.map(line => Array.from(line).map(Number));

  return trees;
}
