import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

type PositionX = number;
type PositionY = number;
type Distance = number;
type Elevation = number;

// solvePart1: get the fewest steps from the beginning position to the end position
function solvePart1(lines: string[]): Distance {
  const [beginX, beginY] = getBeginningPosition(lines);
  const [endX, endY] = getEndPosition(lines);
  const elevationGrid = getElevationGrid(lines);
  const numOfSteps = getMinimumStepsToEndPosition(elevationGrid, beginX, beginY, endX, endY);

  return numOfSteps;

  function getBeginningPosition(lines: string[]): [PositionX, PositionY] {
    try {
      const index = findFirstPosition(lines, char => char === 'S');
  
      return index;
    } catch (e) {
      if (e instanceof Error && e.message === 'Not found') {
        throw new Error(`Begin position not found`);
      }
      throw e;
    }
  }
}

// solvePart2: get the fewest steps from any beginning position with elevation 'a', to the end position
function solvePart2(lines: string[]): Distance {
  const beginPositions: [PositionX, PositionY][] = getBeginningPositions(lines);
  const [endX, endY] = getEndPosition(lines);
  const elevationGrid = getElevationGrid(lines);

  const numOfStepsSortedArray = beginPositions.map(beg => getMinimumStepsToEndPosition(elevationGrid, beg[0], beg[1], endX, endY)).sort();
  const fewest = numOfStepsSortedArray[0];

  return fewest;

  function getBeginningPositions(lines: string[]): [PositionX, PositionY][] {
    const positions = findPositions(lines, char => char === 'S' || char === 'a');
  
    return positions;
  }
}

function getEndPosition(lines: string[]): [PositionX, PositionY] {
  try {
    const index = findFirstPosition(lines, char => char === 'E');

    return index;
  } catch (e) {
    if (e instanceof Error && e.message === 'Not found') {
      throw new Error(`End position not found`);
    }
    throw e;
  }
}

function getElevationGrid(lines: string[]): Elevation[][] {
  const elevationGrid: Elevation[][] = [];

  for (let y = 0; y < lines.length; ++y) {
    const elevationLine: Elevation[] = [];

    for (let x = 0; x < lines[0].length; ++x) {
      const char = lines[y][x];
      elevationLine.push(getElevationFromChar(char));
    }
    elevationGrid.push(elevationLine);
  }

  return elevationGrid;
}

function getElevationFromChar(char: string): Elevation {
  if (char === 'S') {
    char = 'a';
  }
  if (char === 'E') {
    char = 'z';
  }
  return char.charCodeAt(0) - 'a'.charCodeAt(0); // 'a' to 0, 'b' to 1, and so on.
}

function getMinimumStepsToEndPosition(elevationGrid: Elevation[][], beginX: PositionX, beginY: PositionY, endX: PositionX, endY: PositionY) {
  const gridYLength = elevationGrid.length;
  const gridXLength = elevationGrid[0].length;

  const distanceGrid: Distance[][] = Array(gridYLength).fill(Infinity).map(() => Array(gridXLength).fill(Infinity));

  const queue: [Distance, PositionX, PositionY][] = [[0, beginX, beginY]];
  while (queue.length > 0) {
    const [distance, x, y]: [Distance, PositionX, PositionY] = queue.shift()!;

    if (distanceGrid[y][x] <= distance) {
      continue;
    }
    distanceGrid[y][x] = distance;

    if (x === endX && y === endY) {
      break;
    }

    const curElevation = elevationGrid[y][x];
    const nextDistance = distance+1;
    if (x > 0 && isAtMostOneHigher(curElevation, elevationGrid[y][x-1])) {
      queue.push([nextDistance, x-1, y]);
    }
    if (x < gridXLength - 1 && isAtMostOneHigher(curElevation, elevationGrid[y][x+1])) {
      queue.push([nextDistance, x+1, y]);
    }
    if (y > 0 && isAtMostOneHigher(curElevation, elevationGrid[y-1][x])) {
      queue.push([nextDistance, x, y-1]);
    }
    if (y < gridYLength - 1 && isAtMostOneHigher(curElevation, elevationGrid[y+1][x])) {
      queue.push([nextDistance, x, y+1]);
    }
  }

  const stepsToEnd = distanceGrid[endY][endX];
  return stepsToEnd;
}

function isAtMostOneHigher(low: number, high: number) {
  return (low+1) >= high;
}

function findFirstPosition(lines: string[], predicate: (char: String) => boolean): [PositionX, PositionY] {
  for (let y = 0; y < lines.length; ++y) {
    for (let x = 0; x < lines[0].length; ++x) {
      const char = lines[y][x];
      if (!predicate(char)) {
        continue;
      }

      return [x, y];
    }
  }
  throw new Error(`Not found`);
}

function findPositions(lines: string[], predicate: (char: string) => boolean): [PositionX, PositionY][] {
  const positions: [PositionX, PositionY][] = [];

  for (let y = 0; y < lines.length; ++y) {
    for (let x = 0; x < lines[0].length; ++x) {
      const char = lines[y][x];
      if (!predicate(char)) {
        continue;
      }

      positions.push([x, y]);
    }
  }

  return positions;
}
