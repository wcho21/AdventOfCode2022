// command-line arguments library

export function getInputFileName() {
  validateCommandLineArguments();
  
  return process.argv[2];
}

function validateCommandLineArguments() {
  if (process.argv.length <= 2) {
    throw new Error('missing input file name');
  }
}
