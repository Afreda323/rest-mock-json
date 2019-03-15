#!/usr/bin/env node
import chalk from 'chalk'
import fs from 'fs'
import program from 'commander'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { validateFileName, validateJsonShape } from './validators'
import { addEndpoint } from './helpers'

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// Shape of expected json file
export interface IEndpoint {
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
export interface IJson {
  port: number
  baseUrl: string
  endpoints: IEndpoint[]
  notFound?: any
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

/**
 * Parse the JSON the user has pointed to
 * Validate and handle errors accordingly
 */

let json: IJson
try {
  console.log('Attempting to pull from:', chalk.cyan(program.file))
  const file = fs.readFileSync(program.file, 'utf8')

  console.log('Parsing File:', chalk.cyan(program.file))
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

// Create Express.js API
const app = express()
app.use(cors())
app.use(bodyParser.json())

console.log('Base URL:', chalk.cyan(json.baseUrl))
console.log('\u2500'.repeat(10))
/**
 * Build routes based on endpoints
 * Sorts and loops endpoints, uses endpoint builder helper func
 */
const router = express.Router()
json.endpoints
  .sort((a, b) => METHODS.indexOf(a.method) - METHODS.indexOf(b.method))
  .forEach((endpoint) => {
    addEndpoint(router, endpoint)
  })
app.use(json.baseUrl, router)

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json(json.notFound || { status: 404, message: 'Route not found' })
})
console.log(chalk.bgRed('404'), 'handler has mounted')

// Listen for requests
app.listen(json.port, () => {
  console.log(
    '\nMock JSON server listening on port:',
    chalk.cyan(String(json.port)),
  )
})
