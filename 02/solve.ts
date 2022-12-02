import { readFileSync } from 'fs';

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get total score with part 1 guide
function solvePart1(strategies: string[]): number {
  return getTotalScore(strategies, getScoreOfStrategy, getMyHandShape, getScoreOfHandShape);

  function getScoreOfStrategy(strategy: string): number {
    return getScoreWithConditions(strategy, isWinStrategy, isDrawStrategy);
  }

  function isWinStrategy(strategy: string): boolean {
    const winStrategies = ['A Y', 'B Z', 'C X'];
  
    return winStrategies.some(winStrategy => winStrategy === strategy);
  };

  function isDrawStrategy(strategy: string): boolean {
    const drawStrategies = ['A X', 'B Y', 'C Z'];
  
    return drawStrategies.some(drawStrategy => drawStrategy === strategy);
  }

  function getMyHandShape(strategy: string): string {
    return strategy[2];
  }

  function getScoreOfHandShape(handShape: string): number {
    const handShapeToScoreTable = new Map([['X', 1], ['Y', 2], ['Z', 3]]);

    return handShapeToScoreTable.get(handShape)!;
  }
}

// solvePart2: get total score with part 2 guide
function solvePart2(strategies: string[]): number {
  return getTotalScore(strategies, getScoreOfStrategy, getMyHandShape, getScoreOfHandShape);

  function getScoreOfStrategy(strategy: string): number {
    return getScoreWithConditions(strategy, isWinStrategy, isDrawStrategy);
  }

  function isWinStrategy(strategy: string): boolean {
    return strategy[2] === 'Z';
  };

  function isDrawStrategy(strategy: string): boolean {
    return strategy[2] === 'Y';
  };

  function getMyHandShape(strategy: string): string {
    const strategyToHandShapeTable = new Map([
      ['A X', 'C'], ['B X', 'A'], ['C X', 'B'],
      ['A Y', 'A'], ['B Y', 'B'], ['C Y', 'C'],
      ['A Z', 'B'], ['B Z', 'C'], ['C Z', 'A'],
    ]);

    return strategyToHandShapeTable.get(strategy)!;
  }

  function getScoreOfHandShape(handShape: string): number {
    const handShapeToScoreTable = new Map([['A', 1], ['B', 2], ['C', 3]]);

    return handShapeToScoreTable.get(handShape)!;
  }
}

function getTotalScore(
  strategies: string[],
  getScoreOfStrategy: (strategy: string) => number,
  getMyHandShape: (strategy: string) => string,
  getScoreOfHandShape: (handShape: string) => number
) {
  const roundOutcomeScoreSum = strategies.map(getScoreOfStrategy).reduce(getSum);
  const handShapeScoreSum = strategies.map(getMyHandShape).map(getScoreOfHandShape).reduce(getSum);

  const totalScore = roundOutcomeScoreSum + handShapeScoreSum;
  return totalScore;
}

function getScoreWithConditions(strategy: string, doWin: (strategy: string) => boolean, doDraw: (strategy: string) => boolean): number {
  return doWin(strategy) ? 6 : doDraw(strategy) ? 3 : 0;
}

function getSum(a: number, b: number): number {
  return a + b;
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
