import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

type MonkeyOperation = (old: number) => number;
type MonkeyTest = (numberToTest: number) => boolean;

interface Monkey {
  id: number;
  worryLevels: number[];
  operation: MonkeyOperation;
  test: MonkeyTest;
  idToThrowToIfTestIsTrue: number;
  idToThrowToIfTestIsFalse: number;
  inspectionCount: number
}

class KeepAwayGame {
  private monkeys: Monkey[];

  constructor(monkeys: Monkey[]) {
    this.monkeys = monkeys;
  }

  getNextRound() {
    this.monkeys.forEach(({id, worryLevels, operation, test, idToThrowToIfTestIsTrue, idToThrowToIfTestIsFalse}) => {
      const currentMonkey = this.monkeys[id];

      // throw worry levels to other monkeys
      worryLevels.forEach(worryLevel => {
        ++currentMonkey.inspectionCount;
        const nextWorryLevel: number = Math.floor(operation(worryLevel) / 3);
        const target: number = test(nextWorryLevel) ? idToThrowToIfTestIsTrue : idToThrowToIfTestIsFalse;
        const targetMonkey = this.monkeys[target];

        targetMonkey.worryLevels.push(nextWorryLevel);
      });
  
      // remove worry levels for curernt monkey
      currentMonkey.worryLevels = [];
    })
  }

  getTwoMostActiveMonkeysInspectionCounts() {
    const sortedInspectionCount = this.monkeys.map(_ => _.inspectionCount).sort(compareToSortInDecreasingOrder);
    console.log(sortedInspectionCount)
    return sortedInspectionCount.slice(0, 2);
  }
}

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  // console.log(solvePart2(inputLines));
})();

// solvePart1: get the monkey business after 20 keep-away-game rounds
function solvePart1(lines: string[]): number {
  const monkeys = getMonkeys(lines);

  const keepAwayGame = new KeepAwayGame(monkeys);
  let rounds = 20;
  while (rounds-- > 0) {
    keepAwayGame.getNextRound();
  }

  const inspectionCounts = keepAwayGame.getTwoMostActiveMonkeysInspectionCounts();
  const monkeyBusiness = inspectionCounts.reduce(getProduct);

  return monkeyBusiness;
}

function getMonkeys(lines: string[]): Monkey[] {
  const sliced = sliceLineArrayByPredicate(lines, line => line === '');
  const monkeys = sliced.map(parseMonkeyLines);

  return monkeys;
}

function sliceLineArrayByPredicate(lines: string[], predicate: (line: string) => boolean): string[][] {
  const sliced = lines.reduce((acc: string[][], line: string) => predicate(line) ? [...acc, []] : [...acc.slice(0, -1), [...acc.at(-1)!, line]], [[]]);

  return sliced;
}

function parseMonkeyLines(lines: string[]): Monkey {
  if (lines.length !== 6) {
    throw new Error(`Bad monkey lines '${lines}'; expected 6 lines but ${lines.length} lines received`);
  }

  const matchers = [
    /^Monkey (\d+):$/,
    /^  Starting items: (\d+(?:, \d+)*)$/,
    /^  Operation: new = (old (?:\*|\+) (?:\d+|old))$/,
    /^  Test: divisible by (\d+)$/,
    /^    If true: throw to monkey (\d+)$/,
    /^    If false: throw to monkey (\d+)$/,
  ];
  const matches = zip(matchers, lines).map(([matcher, line]) => line.match(matcher)![1]);

  const monkey = {
    id: Number(matches[0]),
    worryLevels: matches[1].split(', ').map(Number),
    operation: parseIntoMonkeyOperation(matches[2]),
    test: getMonkeyTest(matches[3]),
    idToThrowToIfTestIsTrue: Number(matches[4]),
    idToThrowToIfTestIsFalse: Number(matches[5]),
    inspectionCount: 0,
  };
  return monkey;
}

function parseIntoMonkeyOperation(line: string): MonkeyOperation {
  if (line === 'old * old') {
    return old => old * old;
  }

  let match;

  match = line.match(/^old \* (.+)$/);
  if (match !== null && match[1] === 'old') {
    return old => old * old;
  }
  if (match !== null) {
    const multiplier = Number(match[1]);
    return old => old * multiplier;
  }

  match = line.match(/^old \+ (\d+)$/);
  if (match !== null) {
    const adder = Number(match[1]);
    return old => old + adder;
  }

  throw new Error(`Bad line '${line}'`);
}

function getMonkeyTest(numStr: string): MonkeyTest {
  return numberToTest => (numberToTest % Number(numStr) === 0);
}

function zip<T, U>(t: T[], u: U[]): [T, U][] {
  const zipped: [T, U][] = t.map((value: T, index: number) => [value, u[index]]);

  return zipped;
}

function compareToSortInDecreasingOrder(a: number, b: number): number {
  return (a > b) ? -1 : (a === b) ? 0 : 1;
}

function getProduct(a: number, b: number): number {
  return a * b;
}

// solvePart2: ?
function solvePart2(lines: string[]): number {
  return 0;
}
