### Mock JSON REST un devAPI Generator

This project is aimed to help UI developers create mock Express applications to allow for easier testing, and for setting up API calls to a server that may not exist yet. It is super easy to set up, and supports most use cases for hitting a REST API.

#### Usage

###### Install

`npm install -g rest-mock-json`

###### Create a JSON file

Use the below shape to build out your mock api. [Example Here]('Example.json')

###### Run Server

`rest-mock-json -f <path/to/your/json/filename.json>`

You should be greeted with a few messages in the console, or errors pointing out what went wrong.

#### JSON Shape

All unmarked values are required

```js

  "port": number, // Port the app will listen on
  "baseUrl": string, // starts with "/"
  "notFound": any, // OPTIONAL 404 response
  "endpoints": [
    {
      "method": "GET", // GET | POST | PATCH | DELETE | PUT
      "path": string, // starts with "/"
      "shouldError": boolean, // OPTIONAL should respond with error response?
      "response": {
        "statusCode": number, // Status code for successful response
        "body": any // JSON response for success
      },
      "error": {
        "statusCode": number, // Status code for error response
        "body": any // JSON response for error
      }
    }
  ]
}

```

#### TODO

- More dynamic responses
- Test coverage
