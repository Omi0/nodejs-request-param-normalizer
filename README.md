# NodeJS Request Param Normalizer

This helper function is used to normalize (to expected format) requiest paramers.
The idea to create this helper was to reduce repeated function and to standartilize request parameter handling process.
Although primary reason to create this function occured when I wrote API for an application and afterwards used Ionic File Transfer (use its own format) I had to double check requested parameters. This helps you to elliminate this problem.

What this helper does is:
1. Check provided parameters normalize them to one of the following formats: "string" , "number", "boolean", "array", "object". If processed parameter is invalid - it returns 400 error response.
2. Check required fiels. There are fields which must be present in the request paramers. Otherwise it returns 400 error response with errors array.
3. All undefined request parameters will return 400 error response with errors array.

## System Requirements

* [NodeJS](https://nodejs.org/en/)
* [Lodash](https://github.com/lodash/lodash)
* [TypeScript](https://github.com/Microsoft/TypeScript)
* [BodyParser](https://github.com/expressjs/body-parser)


## Installation

To install enter the following command, second "npm instal" command is used to download files from repository:

```
npm install --save Omi0/nodejs-request-param-normalizer#master
npm install
```

To update enter the following command. Which removed local files and reupload them from repository again

```
npm uninstall @omio/nodejs-request-param-normalizer && npm install
```

Check that body-parser middleware is executed before this middleware. This middleware inherits JSON body format:

```
app.use(bodyParser.json());
```

To use you need to import function to your TS file

```
import { paramNormalizer } from "./node_modules/@omio/boostrap-mixins/src/request-param-normalizer.ts";
```

## Usage

To use this middleware use the following example:

Parameter interface has the following format:

```
export interface ParamSchema {
  [key: string]: {
    type: string;
    required: boolean;
  };
}
```

so it will be used as follows:

```
app.post("/", paramNormalizer({
    // All expected request parameters must be listed here. For example:
    user: {
      type: "string",
      required: true
    },
    user_status: {
      type: "boolean",
      required: false
    },
    user_images: {
      type: "array",
      required: false
    },
    ,
    user_options: {
      type: "object",
      required: false
    }
  }),
  (req, res) => {
    /*
     * Will get here only if param successfully normalized and validated
     *
     * This example will throw 400 error if:
     * 1. 'user' property not found in req.body object.
     * 2. 'user_status' and 'user_images', 'user_images' properties cannot be normalized or have invalid format
     *
     * After success you know 100% that the required request properties are present and you don't have to ckeck their format
     * You know that 'user' is a string value, 'user_images' is an array and 'user_options' is an object.
     * Although all request parameters can be initially passed as strings.
     * So you don't have to JSON.parse them anymore...
     */
  }
);
```

If normalization and validation fails the output is shows as follows:

```
res.status(400).json({
  message: params.validated.errors.join("; \n")
});
```

Returned Error JSON example:
```
{
  message: "
    Required property "name" is empty or has no value;
    Param property "user_options" must be a type of object;
    Param property "user_password" hasn't specified in schema
  "
}
```
