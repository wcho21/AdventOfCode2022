import { getInputFileName } from '../common/cmdarg';
import { getInputFileLines } from '../common/file';

type Optional<T> = T | null;
type File = { size: number, name: string };
type CommandsAndDirectoriesPair = { commands: string[], directories: string[] };

class TreeNode<T> {
  public parent: Optional<TreeNode<T>>;
  public children: Map<string, TreeNode<T>>;
  public data: T;

  constructor(data: T, parent: Optional<TreeNode<T>> = null) {
    this.parent = parent;
    this.children = new Map<string, TreeNode<T>>();
    this.data = data;
  }

  toArray(): TreeNode<T>[] {
    let array: TreeNode<T>[] = [];
    this.traverseInPostOrder(node => array.push(node));

    return array;
  }

  private traverseInPostOrder(callback: (node: TreeNode<T>) => void) {
    callback(this);

    this.children.forEach(child => {
      child.traverseInPostOrder(callback);
    });
  }
}

(function main() {
  const inputFileName = getInputFileName();
  const inputLines = getInputFileLines(inputFileName);

  console.log(solvePart1(inputLines));
  console.log(solvePart2(inputLines));
})();

// solvePart1: get all directory sizes which are at most 100000
function solvePart1(lines: string[]): number {
  const sizes = getDirectorySizes(lines);
  const filtered = sizes.filter(_ => _ <= 100000);
  const sum = filtered.reduce(getSum);

  return sum;
}

// solvePart2: get the minimum size that makes free space size at least 30000000 when unused
function solvePart2(lines: string[]): number {
  const sizes = getDirectorySizes(lines).sort(compareToSortInDecreasingOrder);
  const sizeToDelete = 30000000 - (70000000 - sizes[0]);

  const minimumSizeToDelete = sizes.slice(1).filter(_ => _ >= sizeToDelete).at(-1)!;

  return minimumSizeToDelete;
}

function getDirectorySizes(lines: string[]): number[] {
  const fileTreeRoot: TreeNode<File[]> = new TreeNode<File[]>([]);
  const pairs = parseLinesIntoCommandsAndDirectoriesPairs(lines);
  populateFileTree(fileTreeRoot, pairs);

  const sizeTreeRoot: TreeNode<number> = new TreeNode<number>(0);
  populateSizeTree(fileTreeRoot, sizeTreeRoot);

  const sizes = sizeTreeRoot.children.get('/')!.toArray().map(node => node.data);
  return sizes;
}

// side effect to 'root'
function populateFileTree(root: TreeNode<File[]>, pairs: CommandsAndDirectoriesPair[]): void {
  let treeNode = root;

  pairs.forEach(pair => {
    const { commands, directories } = pair;

    commands.forEach(command => {
      // change directory
      const dirToMove = command.match(/^\$ cd (.+)$/)![1];
      if (dirToMove === '..') {
        treeNode = treeNode.parent!; // move to parent
        return;
      }

      const child: TreeNode<File[]> = new TreeNode<File[]>([], treeNode);
      treeNode.children.set(dirToMove, child);
      treeNode = child; // move to child
    });

    // populate files
    directories.forEach(directory => {
      if (directory.startsWith('dir')) {
        return;
      }

      const [fileSizeStr, fileName] = directory.split(' ');
      const fileSize = Number(fileSizeStr);
      const file: File = { size: fileSize, name: fileName };
      treeNode.data.push(file);
    });
  });
}

// side effect to 'sizeTreeNode'
function populateSizeTree(fileTreeNode: TreeNode<File[]>, sizeTreeNode: TreeNode<number>): void {
  // traverse in post order to calculate the subdirectory size first
  fileTreeNode.children.forEach((childFileTreeNode, key) => {
    const childSizeTreeNode = new TreeNode<number>(0, sizeTreeNode);
    sizeTreeNode.children.set(key, childSizeTreeNode);
    populateSizeTree(childFileTreeNode, childSizeTreeNode);
  });

  // get directory size with subdirectory sizes
  const fileSizeSum = fileTreeNode.data.map(file => file.size).reduce(getSum, 0);
  const subdirectorySizeSum = Array.from(sizeTreeNode.children.values()).map(child => child.data).reduce(getSum, 0);  
  sizeTreeNode.data = fileSizeSum + subdirectorySizeSum
}

function parseLinesIntoCommandsAndDirectoriesPairs(lines: string[]) {
  const sliced = sliceLinesIntoCommandAndDirectoryArrays(lines);

  const directoriesList = sliced.filter((_, i: number) => i % 2 === 1);
  const commandsList = sliced.filter((_, i: number) => i % 2 === 0);
  
  const zippedPairs = commandsList.map((commands, i) => ({ commands, directories: directoriesList[i] }));
  return zippedPairs;
}

function sliceLinesIntoCommandAndDirectoryArrays(lines: string[]): string[][] {
  const sliced = lines.slice(1).reduce((acc: string[][], line: string) => {
    if (line === '$ ls') {
      return acc;
    }

    const lineIsCommand = line.startsWith('$ cd');
    const previousLineIsCommand = acc.at(-1)![0].startsWith('$ cd');

    const lineIsdirectoryWhilePreviousIsCommand = !lineIsCommand && previousLineIsCommand;
    const lineIsCommandWhilePreviousIsDirectory = lineIsCommand && !previousLineIsCommand;
    if (lineIsdirectoryWhilePreviousIsCommand || lineIsCommandWhilePreviousIsDirectory) {
      return [...acc, [line]];
    }

    return [...acc.slice(0, acc.length-1), [...acc[acc.length-1], line]];
  }, [[lines[0]]]);

  return sliced;
}

function getSum(a: number, b: number): number {
  return a + b;
}

function compareToSortInDecreasingOrder(a: number, b: number) {
  return (a > b) ? -1 : (a === b) ? 0 : 1;
}
