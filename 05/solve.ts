import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

type Stack = string[];
interface Instruction { moves: number, from: number, to: number };

// solvePart1: rearrange stacks by moving crates one at a time
function solvePart1(lines: string[]): string {
  const tops = rearrangeStacksAndReadTopCrates(lines, rearrangeStacksByMovingOneAtATime);

  return tops;

  function rearrangeStacksByMovingOneAtATime(stacks: Stack[], instructions: Instruction[]): Stack[] {
    stacks = stacks.map(stack => [...stack]); // deep copy to make this function pure
  
    for (const instruction of instructions) {
      const { moves, from, to }: Instruction = instruction;
      
      for (let i = 0; i < moves; ++i) {
        const popped = stacks[from-1].pop();
        if (!popped) {
          throw new Error(`Stack underflow`);
        }
  
        stacks[to-1].push(popped);
      }
    }
  
    return stacks;
  }
}

function solvePart2(lines: string[]): string{
  const tops = rearrangeStacksAndReadTopCrates(lines, rearrangeStacksByMovingAllAtOnce);
  
  return tops;

  function rearrangeStacksByMovingAllAtOnce(stacks: Stack[], instructions: Instruction[]): Stack[] {
    stacks = stacks.map(stack => [...stack]); // deep copy to make this function pure
  
    for (const instruction of instructions) {
      const { moves, from, to }: Instruction = instruction;

      const stackFrom: Stack = stacks[from-1];
      const toMove: Stack = stackFrom.slice(stackFrom.length-moves);
      stacks[from-1] = stackFrom.slice(0, stackFrom.length-moves);
      stacks[to-1] = [...stacks[to-1], ...toMove];
    }
  
    return stacks;
  }
}

function rearrangeStacksAndReadTopCrates(lines: string[], rearrangeStacks: (stacks: Stack[], instructions: Instruction[]) => Stack[]): string {
  const [stacks, instructions] = parseLines(lines);
  const rearrangedStacks = rearrangeStacks(stacks, instructions);
  const tops = getTopsFromStacks(rearrangedStacks);

  return tops;
}

function getTopsFromStacks(stacks: Stack[]) {
  const tops = stacks.map(getLastElement).join('');

  return tops;
}

function parseLines(lines: string[]): [Stack[], Instruction[]] {
  const splitIndex = lines.findIndex(_ => _ === '');
  const [stackLines, instructionLines] = [lines.slice(0, splitIndex), lines.slice(splitIndex+1)];
  
  const stacks: Stack[] = parseStackLines(stackLines);
  const instructions: Instruction[] = parseInstructionLines(instructionLines);
  
  return [stacks, instructions];
}

// parse from bottom line
function parseStackLines(lines: string[]): any {
  if (lines.length === 0) {
    throw new Error(`No lines given`);
  }

  const bottomLineChars: string[] = Array.from(getLastElement(lines));

  const beginColumnIndex: number[] = bottomLineChars.map((char, index) => (char === ' ') ? null : index).filter(_ => _ !== null) as number[];

  const columns: string[] = beginColumnIndex.map(index => reverseString(getColumn(lines, index)));
  const stacks: Stack[] = columns.map(_ => [..._.trim()].slice(1)); // slice to drop stack number at first place
  
  return stacks;
}

function getColumn(lines: string[], columnIndex: number) {
  const columnChars: string[] = lines.map(line => line[columnIndex]);
  const column: string = columnChars.join('');

  return column;
}

function parseInstructionLines(lines: string[]): Instruction[] {
  const parsed = lines.map(parseInstructionLine);

  return parsed;
}

function parseInstructionLine(line: string): Instruction {
  const format = /^move (\d+) from (\d+) to (\d+)$/;
  const matches = line.match(format);
  if (!matches) {
    throw new Error(`Bad instruction line ${line}`);
  }

  const [, moves, from, to]: number[] = matches.map(Number);
  const instruction: Instruction = { moves, from, to };

  return instruction;
}

function getLastElement(array: any[]) {
  if (array.length === 0) {
    throw new Error(`Expected non-empty array but received empty`);
  }

  return array[array.length-1];
}

function reverseString(s: string): string {
  return [...s].reverse().join('');
}
