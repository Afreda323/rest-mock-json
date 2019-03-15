import chalk from 'chalk'
import { Request, Response, Router } from 'express'
import { IEndpoint } from './index'

/**
 * Function used by addEndpoint,
 * Creates the args used for making an express route
 * Should be spread into a route method(ie: Router.get(...makeResponse(endpoint)))
 * Returns a tuple [path, route callback]
 * @param endpoint endpoint obj
 */
export const makeResponse = (
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

/**
 * Generate a route based on the endpoint method
 * Logs colored notifications for routrs being mounted
 * @param router express router
 * @param endpoint endpoint obj
 */
export const addEndpoint = (router: Router, endpoint: IEndpoint) => {
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
