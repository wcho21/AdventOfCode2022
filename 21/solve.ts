import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

abstract class Expression {
  abstract evaluate(): number | null;
  abstract getName(): string;
}

class NumberExpression extends Expression {
  constructor(private name: string, private number: number) {
    super();
  }

  getName() {
    return this.name;
  }

  evaluate() {
    return this.number;
  }
}

class OperationExpression extends Expression {
  private leftOperandValue: number | null;
  private rightOperandValue: number | null;

  constructor(private name: string, private operator: string, private leftOperandName: string, private rightOperandName: string) {
    super();

    this.leftOperandValue = null;
    this.rightOperandValue = null
  }

  getName() {
    return this.name;
  }

  getLeftOperandName(): string {
    return this.leftOperandName;
  }

  getRightOperandName(): string {
    return this.rightOperandName;
  }

  setLeftOperandValue(value: number): void {
    this.leftOperandValue = value;
  }

  setRightOperandValue(value: number): void {
    this.rightOperandValue = value;
  }

  evaluate() {
    if (!this.leftOperandValue || !this.rightOperandValue) {
      return null;
    }

    if (this.operator === '+') {
      return this.leftOperandValue + this.rightOperandValue;
    }
    if (this.operator === '-') {
      return this.leftOperandValue - this.rightOperandValue;
    }
    if (this.operator === '*') {
      return this.leftOperandValue * this.rightOperandValue;
    }
    if (this.operator === '/') {
      return this.leftOperandValue / this.rightOperandValue;
    }

    throw new Error(`Bad operator ${this.operator}`);
  }
}

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  // console.log(solvePart2(inputLines));
})();

function solvePart1(lines: string[]): number {
  const expressions: Expression[] = lines.map(parseLineIntoExpression);

  const nameToExpression = new Map<string, Expression>();
  for (const expr of expressions) {
    nameToExpression.set(expr.getName(), expr);
  }

  const namesToEvaluate = new Set<string>(expressions.map(e => e.getName()));
  const evaluated = new Map<string, number>();

  while (namesToEvaluate.size > 0) {
    for (const name of namesToEvaluate) {
      const expr = nameToExpression.get(name)!;

      if (expr instanceof NumberExpression) {
        evaluated.set(name, expr.evaluate());
        namesToEvaluate.delete(name);
      }
      if (expr instanceof OperationExpression) {
        const leftName = expr.getLeftOperandName();
        const rightName = expr.getRightOperandName();
        if (!evaluated.has(leftName) || !evaluated.has(rightName)) {
          continue;
        }

        const leftValue = evaluated.get(leftName)!;
        const rightValue = evaluated.get(rightName)!;
        expr.setLeftOperandValue(leftValue);
        expr.setRightOperandValue(rightValue);

        evaluated.set(name, expr.evaluate()!);
        namesToEvaluate.delete(name);
      }
    }
  }

  return evaluated.get('root')!;
}

function parseLineIntoExpression(line: string): Expression {
  const numberExpressionRegex = /^([a-z]{4}): (\d+)$/;
  const operationExpressionRegex = /^([a-z]{4}): ([a-z]{4}) (\+|\-|\*|\/) ([a-z]{4})$/;

  if (numberExpressionRegex.test(line)) {
    const [, name, numberStr] = line.match(numberExpressionRegex)!;

    return new NumberExpression(name, Number(numberStr));
  }
  if (operationExpressionRegex.test(line)) {
    const [, name, leftOperand, operator, rightOperand] = line.match(operationExpressionRegex)!;

    return new OperationExpression(name, operator, leftOperand, rightOperand);
  }

  throw new Error(`Bad line ${line}`);
}
