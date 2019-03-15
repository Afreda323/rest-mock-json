import chalk from 'chalk'
import fs from 'fs'
import program from 'commander'

const validateFileName = (fileName: string): string | void => {
  const isValid = /.json$/i.test(fileName)
  if (isValid) {
    return fileName
  } else {
    console.error(
      chalk.red('Invalid File Name:'),
      'Please provide a file name with the extension ".json"',
    )
    process.exit(1)
  }
}

program
  .version(process.version)
  .option('-f, --file <file>', 'File Name', validateFileName)
  .parse(process.argv)

if (!program.file) {
  console.error(chalk.red('Please specify a file:'), '-f <YOUR_FILE_PATH>')
  process.exit(1)
}

console.log(program.file)

let json

try {
  const file = fs.readFileSync(program.file, 'utf8')
  json = JSON.parse(file)
} catch (e) {
  console.error(
    chalk.red('Invalid file specified:'),
    'Please select an existing JSON file',
  )
  console.error(e)
  process.exit(1)
}



console.log(json)

console.log(chalk.cyan('HELLO'))
