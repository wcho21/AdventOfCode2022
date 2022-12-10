import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

type Register = number;
type Cycle = number;
type ProgramState = [Cycle, Register];
type Command = string;
type Argument = number;
type ScreenBuffer = string[];

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get the sum of signal strenghts
function solvePart1(instructions: string[]): number {
  const programStates = getProgramStateSequence(instructions);

  const filtered = programStates.filter(([cycle]) => (cycle - 20) % 40 === 0);
  const signalStrengths = filtered.map(([cycle, register]) => cycle * register);
  const sum = signalStrengths.reduce(getSum);

  return sum;
}

// solvePart2: get the rendered screen
function solvePart2(instructions: string[]): string {
  const programStates = getProgramStateSequence(instructions);

  const pixels = getPixels(programStates);
  const screen = renderScreen(pixels);

  return screen;

  function getPixels(programStates: ProgramState[]): ScreenBuffer {
    const pixels = programStates.map(([cycle, register]) => {
      const screenPos = cycle-1; // convert from one-based to zero-based
      const screenPosInTheRow = screenPos % 40;

      const inPixelsToRender: boolean = register-1 <= screenPosInTheRow && screenPosInTheRow <= register + 1;
      return inPixelsToRender ? '#' : '.';
    });
  
    return pixels;
  }
  
  function renderScreen(buffer: ScreenBuffer): string {
    const slicedLines: string[] = [0, 1, 2, 3, 4, 5].map(i => {
      const lineBeginIndex = i * 40;
      const lineEndIndex = (i+1) * 40;
      return buffer.slice(lineBeginIndex, lineEndIndex).join('');
    });

    const rendered: string = slicedLines.join('\n');
    return rendered;
  }
}

function getProgramStateSequence(instructions: string[]): ProgramState[] {
  const initialProgramState: [Cycle, Register] = [1, 1];

  return instructions.reduce(execute, [initialProgramState]);
}

function execute(programStates: ProgramState[], instruction: string): ProgramState[] {
  const [command, arg]: [Command, Argument?] = parseInstruction(instruction);
  const [prevCycle, prevRegister]: ProgramState = programStates.at(-1)!;
  
  if (command === 'noop') {
    return [...programStates, [prevCycle+1, prevRegister]];
  }
  if (command === 'addx') {
    return [...programStates, [prevCycle+1, prevRegister], [prevCycle+2, prevRegister+arg!]];
  }
  throw new Error(`Bad command ${command}`);
}

function parseInstruction(instruction: string): [Command, Argument?] {
  const [command, argument] = instruction.split(' ');

  if (command === 'noop') {
    return [command];
  }
  if (command === 'addx') {
    return [command, Number(argument)];
  }
  throw new Error(`Bad command ${command}`);
}

function getSum(a: number, b: number): number {
  return a + b;
}
