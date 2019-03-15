import chalk from 'chalk'
import fs from 'fs'
import program from 'commander'
import express, { Router, Request, Response, IRouterMatcher } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// Shape of expected json file
interface IEndpoint {
  method?: string
  path: string
  shouldError?: boolean
  response: {
    statusCode: number
    body: any
  }
  error: {
    statusCode: number
    body: any
  }
}
interface IJson {
  port: number
  baseUrl: string
  endpoints: IEndpoint[]
  notFound?: any
}

/**
 * Validate that supplied file name is json
 * @param fileName path to file
 */
const validateFileName = (fileName: string): string | void => {
  const isValid = /.json$/i.test(fileName)
  if (isValid) {
    return fileName
  } else {
    console.error(
      chalk.bgRed('Invalid File Name:'),
      'Please provide a file name with the extension ".json"',
    )
    process.exit(1)
  }
}

/**
 * Validate that the json provided has the correct shape for parsing
 * @param json json content you want to validate
 */
const validateJsonShape = (json: IJson) => {
  if (
    typeof json !== 'object' ||
    !json.baseUrl ||
    !json.port ||
    !json.endpoints ||
    !Array.isArray(json.endpoints)
  ) {
    throw new Error('Invalid JSON Shape')
  }
  // Base Url must start with /
  if (!/^\//.test(json.baseUrl)) {
    throw new Error(`Invalid Base URL Path: ${json.baseUrl}`)
  }

  json.endpoints.forEach((endpoint: any) => {
    // Required values must be present
    if (!endpoint.path || !endpoint.response || !endpoint.error) {
      throw new Error('Invalid Endpoint Shape')
    }
    // Method must be legit
    if (endpoint.method && !METHODS.includes(endpoint.method.toUpperCase())) {
      throw new Error(`Invalid Endpoint Method: ${endpoint.method}`)
    }
    // Path must start with /
    if (!/^\//.test(endpoint.path)) {
      throw new Error(`Invalid Endpoint Path: ${endpoint.path}`)
    }
  })
  return json
}

const makeResponse = (
  endpoint: IEndpoint,
): [string, (req: Request, res: Response) => void] => [
  endpoint.path,
  (req, res) => {
    res
      .status(
        endpoint.shouldError
          ? endpoint.error.statusCode
          : endpoint.response.statusCode,
      )
      .json(endpoint.shouldError ? endpoint.error.body : endpoint.response.body)
  },
]

const addEndpoint = (router: Router, endpoint: IEndpoint) => {
  switch (endpoint.method) {
    case 'POST':
      router.post(...makeResponse(endpoint))
      console.log(
        chalk.green(endpoint.method),
        chalk.cyan(endpoint.path),
        'has mounted',
      )
      break
    case 'PUT':
      router.put(...makeResponse(endpoint))
      console.log(
        chalk.yellow(endpoint.method),
        chalk.cyan(endpoint.path),
        'has mounted',
      )
      break
    case 'PATCH':
      router.patch(...makeResponse(endpoint))
      console.log(
        chalk.yellowBright(endpoint.method),
        chalk.cyan(endpoint.path),
        'has mounted',
      )
      break
    case 'DELETE':
      router.delete(...makeResponse(endpoint))
      console.log(
        chalk.red(endpoint.method),
        chalk.cyan(endpoint.path),
        'has mounted',
      )
      break
    case 'GET':
    default:
      router.get(...makeResponse(endpoint))
      console.log(
        chalk.magenta(endpoint.method),
        chalk.cyan(endpoint.path),
        'has mounted',
      )
      break
  }
}

// Clear terminal
process.stdout.write('\x1Bc')

// Commander setup
program
  .version(process.version)
  .option('-f, --file <file>', 'File Name', validateFileName)
  .parse(process.argv)

// Verify that a file name was specified
if (!program.file) {
  console.error(chalk.bgRed('Please specify a file:'), '-f <YOUR_FILE_PATH>')
  process.exit(1)
}

console.log('Attempting to pull from:', chalk.cyan(program.file))

let json: IJson

try {
  const file = fs.readFileSync(program.file, 'utf8')
  json = validateJsonShape(JSON.parse(file))
} catch (e) {
  console.error(
    chalk.bgRed('Invalid file specified:'),
    'Please select an existing JSON file, and verify that it is of the correct shape',
  )
  console.error(e)
  process.exit(1)
}

console.log('Successfully parsed:', chalk.cyan(program.file))
console.log('\n')

const app = express()
app.use(cors())
app.use(bodyParser.json())

console.log('Base URL:', chalk.cyan(json.baseUrl))
const router = express.Router()
json.endpoints
  .sort((a, b) => METHODS.indexOf(a.method) - METHODS.indexOf(b.method))
  .forEach((endpoint) => {
    addEndpoint(router, endpoint)
  })

app.use(json.baseUrl, router)
// 404 handler
app.use((req, res) => {
  res.status(404).json(json.notFound || { status: 404, message: 'Route not found' })
})
console.log(
    chalk.bgRed('404'),
    'handler has mounted',
  )
const server = app.listen(json.port, () => {
  console.log(
    '\nMock JSON server listening on port:',
    chalk.cyan(String(json.port)),
  )
})
