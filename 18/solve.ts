import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

type Coordinate = { x: number, y: number, z: number };
class CoordinateSet {
  private set: Set<string>;

  static fromArray(coordinates: Coordinate[]): CoordinateSet {
    const set = new CoordinateSet();
    for (const coord of coordinates) {
      set.add(coord);
    }

    return set;
  }

  constructor() {
    this.set = new Set<string>;
  }

  add(coordinate: Coordinate): void {
    this.set.add(this.getKey(coordinate));
  }

  has(coordinate: Coordinate): boolean {
    return this.set.has(this.getKey(coordinate));
  }

  getSize(): number {
    return this.set.size;
  }

  *[Symbol.iterator](): Iterator<Coordinate> {
    for (const coord of this.set) {
      const [x, y, z]: number[] = coord.split(',').map(Number);
      yield { x, y, z };
    }
  }

  private getKey(coordinate: Coordinate) {
    return `${coordinate.x},${coordinate.y},${coordinate.z}`;
  }
}

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get the surface area of lava droplet
function solvePart1(coordinateLines: string[]): number {
  const cubes: CoordinateSet = CoordinateSet.fromArray(coordinateLines.map(parseLineIntoCoordinate));

  const countNeighborCubes: (coordinate: Coordinate) => number = countAdjacentCoordinates.bind(null, cubes);
  const surface: number = [...cubes].map(countNeighborCubes).map(countNotConnectedSides).reduce(getSum);

  return surface;
}

// solvePart2: get the external surface area of lava droplet
function solvePart2(coordinateLines: string[]): number {
  const cubes: CoordinateSet = CoordinateSet.fromArray(coordinateLines.map(parseLineIntoCoordinate));

  const [maxX, maxY, maxZ, minX, minY, minZ] = getOuterBoxCoordinates(cubes);

  const beginCoord = { x: minX, y: minY, z: minZ };
  const stack = [beginCoord];
  const visited = new CoordinateSet();

  while (stack.length > 0) {
    const coord: Coordinate = stack.pop()!;
    
    if (visited.has(coord)) {
      continue;
    }
    visited.add(coord);

    const dxdydzs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    dxdydzs.forEach(([dx, dy, dz]) => {
      const newCoord: Coordinate = { x: coord.x + dx, y: coord.y + dy, z: coord.z + dz };

      if (newCoord.x < minX || newCoord.x > maxX || newCoord.y < minY || newCoord.y > maxY || newCoord.z < minZ || newCoord.z > maxZ) {
        return;
      }
      if (cubes.has(newCoord)) {
        return;
      }
      stack.push(newCoord);
    });
  }
  
  const countNeighborCubes: (coordinate: Coordinate) => number = countAdjacentCoordinates.bind(null, cubes);
  const surface: number = [...visited].map(countNeighborCubes).reduce(getSum);
  
  return surface;
}

function getOuterBoxCoordinates(cubes: CoordinateSet): number[] {
  const cubesArray = [...cubes];
  const maxX = cubesArray.map(coord => coord.x).reduce(getMax);
  const maxY = cubesArray.map(coord => coord.y).reduce(getMax);
  const maxZ = cubesArray.map(coord => coord.z).reduce(getMax);
  const minX = cubesArray.map(coord => coord.x).reduce(getMin);
  const minY = cubesArray.map(coord => coord.y).reduce(getMin);
  const minZ = cubesArray.map(coord => coord.z).reduce(getMin);

  return [maxX+1, maxY+1, maxZ+1, minX-1, minY-1, minZ-1];
}

function countNotConnectedSides(numOfNeighbors: number): number {
  const cubeSides = 6;

  return cubeSides - numOfNeighbors;
}

function countAdjacentCoordinates(coordinateSet: CoordinateSet, coordinate: Coordinate): number {
  const dxdydzs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const numOfNeighbors: number = dxdydzs.map(([dx, dy, dz]) => coordinateSet.has({ x: coordinate.x + dx, y: coordinate.y + dy, z: coordinate.z + dz })).reduce(countTrue, 0);

  return numOfNeighbors;
}

function parseLineIntoCoordinate(line: string): Coordinate {
  const coordNums: number[] = line.split(',').map(Number);
  const coord = { x: coordNums[0], y: coordNums[1], z: coordNums[2] };

  return coord;
}

function countTrue(acc: number, cur: boolean) {
  return cur ? acc + 1 : acc;
}

function getSum(a: number, b: number) {
  return a + b;
}

function getMax(a: number, b: number) {
  return a > b ? a : b;
}

function getMin(a: number, b: number) {
  return a < b ? a : b;
}
