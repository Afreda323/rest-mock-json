import chalk from 'chalk'
import { IJson, METHODS } from './index'

/**
 * Validate that supplied file name is json
 * @param fileName path to file
 */
export const validateFileName = (fileName: string): string | void => {
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
export const validateJsonShape = (json: IJson) => {
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
