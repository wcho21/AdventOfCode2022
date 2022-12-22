import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

type Coordinate = { x: number, y: number };
class CoordinateSet {
  private static DELIMITER = ',';
  private set: Set<string>;

  constructor(coordinates: Coordinate[] = []) {
    this.set = new Set<string>;

    for (const coord of coordinates) {
      this.set.add(this.getKey(coord));
    }
  }

  add(coordinate: Coordinate): void {
    this.set.add(this.getKey(coordinate));
  }

  delete(coordinate: Coordinate): void {
    this.set.delete(this.getKey(coordinate));
  }

  has(coordinate: Coordinate): boolean {
    return this.set.has(this.getKey(coordinate));
  }

  *[Symbol.iterator](): Iterator<Coordinate> {
    for (const coord of this.set) {
      const [x, y]: number[] = coord.split(CoordinateSet.DELIMITER).map(Number);
      yield { x, y };
    }
  }

  private getKey(coordinate: Coordinate): string {
    return `${coordinate.x}${CoordinateSet.DELIMITER}${coordinate.y}`; // custom hash
  }
}
type Block = CoordinateSet;

const BLOCKS: Block[] = [
  // x = 0 if leftmost, y = 0 if bottom
  new CoordinateSet([
    // - shape
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
  ]),
  new CoordinateSet([
    // + shape
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 },
  ]),
  new CoordinateSet([
    // _| shape
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },
  ]),
  new CoordinateSet([
    // | shape
    { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
  ]),
  new CoordinateSet([
    // o shape
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
  ]),
];
const NEW_BLOCK_X_PAD = 2;
const NEW_BLOCK_Y_PAD = 3;

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  // console.log(solvePart2(inputLines));
})();

// solvePart1: ?
function solvePart1(lines: string[]): number {
  const jetPattern = Array.from(lines[0]);

  let highestBlockY = -1;
  let blockTurn = 0;
  let falling = false;
  let blockCount = 0;
  let fallingBlock: Block;
  const fallenBlocks = new CoordinateSet();
  const memo = new Map<string, any>();
  let prevMemoKey = '';
  const memoKeyChain = new Map<string, string>();
  for (let turn = 0; ; ++turn) {
    if (!falling) {
      fallingBlock = createFallingBlock(blockTurn, highestBlockY);
      falling = true;
    }
    
    const dx: number = jetPattern[turn % jetPattern.length] === '<' ? -1 : 1;
    if (isXMovable(fallenBlocks, fallingBlock!, dx)) {
      fallingBlock = moveBlock(fallingBlock!, dx, 0);
    }
    
    if (isYMovable(fallenBlocks, fallingBlock!, -1)) {
      fallingBlock = moveBlock(fallingBlock!, 0, -1);
      continue;
    }
    
    for (const coord of fallingBlock!) {
      if (coord.y > highestBlockY) {
        highestBlockY = coord.y;
      }
      fallenBlocks.add(coord);
    }
    falling = false;

    ++blockCount;
    if (blockCount === 2022) {
      break;
    }

    const leftX = [...fallingBlock!].map(coord => coord.x).reduce((a, b) => a > b ? a : b);
    const memoKey = `${turn%jetPattern.length},${blockTurn%BLOCKS.length},${leftX}`;
    console.log(`memoKey=${memoKey}`);
    if (memo.has(memoKey)) {
      const [prevBlockCount, prevHighestY] = memo.get(memoKey)!;
      const blockCountDiff = blockCount - prevBlockCount;
      const yDiff = highestBlockY - prevHighestY;
      const repeats = Math.floor((2022 - prevBlockCount) / blockCountDiff);
      const newHighestY = yDiff*repeats + prevHighestY;

      console.log(`blockCountDiff=${blockCountDiff}, yDiff=${yDiff}, blockCount=${blockCount}, prevBlockCount=${prevBlockCount}, prevHighestY=${prevHighestY}, repeats=${repeats}, newHighestY=${newHighestY}`);
      const remainingBlockCount = 2022 - blockCountDiff*repeats - prevBlockCount;
      console.log(`remainingBlockCount=${remainingBlockCount}`);

      let key = memoKey;
      for (let i = 0; i < remainingBlockCount; ++i) {
        key = memoKeyChain.get(key)!;
      }
      const [nBlockCount, nY] = memo.get(key)!;
      return newHighestY + (nY-prevHighestY) + 1;
    }
    memo.set(memoKey, [blockCount, highestBlockY]);
    memoKeyChain.set(prevMemoKey, memoKey);
    prevMemoKey = memoKey;

    ++blockTurn;
  }

  return 0; // from zero-based to one-based
}

function createFallingBlock(blockTurn: number, highestBlockY: number) {
  const fallingBlock = new CoordinateSet();

  const chosenBlock: Block = BLOCKS[blockTurn % BLOCKS.length];
  for (const coord of chosenBlock) {
    const { x, y } = coord;
    fallingBlock.add({ x: x + NEW_BLOCK_X_PAD, y: y + NEW_BLOCK_Y_PAD + highestBlockY + 1 });
  }
  return fallingBlock;
}

function debug(fallingBlock: Block, fallenBlocks: Block, highestBlockY: number) {
  const buffer = Array(highestBlockY+5+3).fill(0).map(() => Array.from('.......'));

  for (const coord of fallenBlocks) {
    buffer[buffer.length-1-coord.y][coord.x] = '#';
  }
  for (const coord of fallingBlock) {
    buffer[buffer.length-1-coord.y][coord.x] = '@';
  }
  
  const render = buffer.map(line => line.join('')).join('\n');
  console.log(render);
}

function moveBlock(fallingBlock: CoordinateSet, dx: number = 0, dy: number = 0): Block {
  const block = new CoordinateSet();

  for (const coord of fallingBlock) {
    block.add({ x: coord.x + dx, y: coord.y + dy });
  }

  return block;
}

function isYMovable(fallenBlocks: CoordinateSet, fallingBlock: CoordinateSet, dy: number): boolean {
  for (const coord of fallingBlock) {
    const x = coord.x;
    const y = coord.y + dy;

    if (y < 0) {
      return false;
    }

    if (fallenBlocks.has({ x, y })) {
      return false;
    }
  }
  return true;
}

function isXMovable(fallenBlocks: CoordinateSet, fallingBlock: CoordinateSet, dx: number): boolean {
  if (![...fallingBlock].every(coord => 0 <= coord.x + dx && coord.x + dx < 7)) {
    return false;
  }

  for (const coord of fallingBlock) {
    const x = coord.x + dx;
    const y = coord.y;

    if (fallenBlocks.has({ x, y })) {
      return false;
    }
  }
  return true;
}
