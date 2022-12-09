import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

// immutable
class Coordinate {
  private _x: number;
  private _y: number;

  constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  static from(coord: Coordinate): Coordinate {
    return new Coordinate(coord.x, coord.y);
  }

  static areSame(coord1: Coordinate, coord2: Coordinate): boolean {
    return coord1.x === coord2.x && coord1.y === coord2.y;
  }

  static areAdjacent(coord1: Coordinate, coord2: Coordinate): boolean {
    const dydxs = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];

    const shiftedCoord1s: Coordinate[] = dydxs.map(([dx, dy]) => new Coordinate(coord1.x + dx, coord1.y + dy));
    const adjacent: boolean = shiftedCoord1s.some(shiftedCoord1 => Coordinate.areSame(shiftedCoord1, coord2));
    return adjacent;
  }

  static areTouching(coord1: Coordinate, coord2: Coordinate): boolean {
    return Coordinate.areSame(coord1, coord2) || Coordinate.areAdjacent(coord1, coord2);
  }

  static getDifference(coord1: Coordinate, coord2: Coordinate): [number, number] {
    return [coord1.x - coord2.x, coord1.y - coord2.y];
  }
}

// custom set class for Coordinate class, which has own internal hash function for set operations (add, delete)
class CoordinateSet {
  private map: Map<string, Coordinate>;

  constructor(coordinates: Coordinate[]) {
    this.map = new Map<string, Coordinate>();

    coordinates.forEach(this.add.bind(this));
  }

  add(coord: Coordinate): void {
    const key = CoordinateSet.getKey(coord);
    if (!this.map.has(key)) {
      this.map.set(key, coord);
    }
  }

  delete(coord: Coordinate): void {
    const key = CoordinateSet.getKey(coord);
    if (this.map.has(key)) {
      this.map.delete(key);
    }
  }

  toArray(): Coordinate[] {
    return Array.from(this.map.values());
  }

  private static getKey(coord: Coordinate): string {
    return `${coord.x},${coord.y}`; // custom hash function
  }
}

// rope consisting head and tail, automatically tracking the trace of the tail
class Rope {
  private head: Coordinate;
  private tail: Coordinate;
  private tailTrace: CoordinateSet;

  constructor(x: number = 0, y: number = 0) {
    this.head = new Coordinate(x, y);
    this.tail = new Coordinate(x, y);
    this.tailTrace = new CoordinateSet([new Coordinate(x, y)]);
  }

  moveHeadBy(dx: number, dy: number): void {
    this.head = new Coordinate(this.head.x + dx, this.head.y + dy);
    
    if (Coordinate.areTouching(this.tail, this.head)) {
      return;
    }

    this.updateTailAndTailTrace();
  }

  getHead(): Coordinate {
    return Coordinate.from(this.head);
  }

  getTail(): Coordinate {
    return Coordinate.from(this.tail);
  }

  getTailTrace(): Coordinate[] {
    return this.tailTrace.toArray();
  }

  private updateTailAndTailTrace(): void {
    const dydxs = [[2, 2], [2, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -2], [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 2]];
    for (const [dx, dy] of dydxs) {
      if (!Coordinate.areSame(this.head, new Coordinate(this.tail.x + dx, this.tail.y + dy))) {
        continue;  
      }

      const [tailDx, tailDy] = [dx % 2 === 0 ? dx/2 : dx, dy % 2 === 0 ? dy/2 : dy]; // move diagonally if necessary
      this.tail = new Coordinate(this.tail.x + tailDx, this.tail.y + tailDy);

      this.tailTrace.add(Coordinate.from(this.tail));

      return;
    }
  }
}

// simulator that executes command which is given externally through execute() method
abstract class RopeSimulator {
  protected static directionToDxdy = new Map<string, [number, number]>([
    ['L', [-1, 0]],
    ['R', [1, 0]],
    ['U', [0, 1]],
    ['D', [0, -1]]
  ]);

  protected parseCommand(command: string): [string, number] {
    const matches = command.match(/^(L|R|U|D) (\d+)$/);
    if (!matches) {
      throw new Error(`Bad command ${command}`);
    }
    
    const [direction, steps] = [matches[1], Number(matches[2])];
    return [direction, steps];
  }

  abstract execute(command: string): void;
  abstract getTailTrace(): Coordinate[];
}

// simulator for two-knot rope
class ShortRopeSimulator extends RopeSimulator {
  private rope: Rope;

  constructor() {
    super();

    this.rope = new Rope();
  }

  execute(command: string): void {
    const [direction, steps] = this.parseCommand(command);
    for (let i = 0; i < steps; ++i) {
      const [dx, dy] = RopeSimulator.directionToDxdy.get(direction)!;
      this.rope.moveHeadBy(dx, dy);
    }
  }

  getTailTrace(): Coordinate[] {
    return this.rope.getTailTrace();
  }
}

// simulator for multi-knot rope, which tracks the trace of the last knot only
class LongRopeSimulator extends RopeSimulator {
  private ropes: Rope[]; // consider long rope as multiple short rope

  constructor(ropeLength: number) {
    super();

    this.ropes = Array(ropeLength).fill(0).map(_ => new Rope());
  }

  execute(command: string): void {
    const [direction, steps] = this.parseCommand(command);
    for (let i = 0; i < steps; ++i) {
      const [dx, dy] = RopeSimulator.directionToDxdy.get(direction)!;

      this.moveHeadAndUpdateRest(dx, dy);
    }
  }

  getTailTrace(): Coordinate[] {
    return this.ropes.at(-1)!.getTailTrace();
  }

  private moveHeadAndUpdateRest(headDx: number, headDy: number): void {
    const headRope = this.ropes[0];
    headRope.moveHeadBy(headDx, headDy);

    this.updateRestForMovedHead();
  }

  private updateRestForMovedHead(): void {
    for (let i = 1; i < this.ropes.length; ++i) {
      const preRopeTailCoord = this.ropes[i-1].getTail();
      const curRopeHeadCoord = this.ropes[i].getHead();
      const [dx, dy] = Coordinate.getDifference(preRopeTailCoord, curRopeHeadCoord);

      const curRope = this.ropes[i];
      curRope.moveHeadBy(dx, dy);
    }
  }
}

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get the length of the trace of the tail knot for short rope
function solvePart1(lines: string[]): number {
  const ropeSimulator = new ShortRopeSimulator();
  lines.forEach(line => ropeSimulator.execute(line));

  const tailTraceLength = ropeSimulator.getTailTrace().length;
  return tailTraceLength;
}

// solvePart2: get the length of the trace of the last knot for 10-knot rope
function solvePart2(lines: string[]): number {
  const ropeSimulator = new LongRopeSimulator(9);
  lines.forEach(line => ropeSimulator.execute(line));

  const tailTraceLength = ropeSimulator.getTailTrace().length;
  return tailTraceLength;
}
