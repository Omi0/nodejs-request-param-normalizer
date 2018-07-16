import { isEmpty, isNil, has, isNumber, isString } from "lodash";
// import { logger } from "../server";

/**
 * Schema interface for processParams function
 */
interface ParamSchema {
  [key: string]: {
    type: string;
    required: boolean;
  };
}

/**
 * Result object interface for processParams function
 */
interface ParamResult {
  processed: {
    [key: string]: any;
  };
  validated: {
    status: boolean;
    errors: string[];
  };
}

/**
 * Normalizing (converting to specified types)
 * and Validating parameters according to specified schema
 *
 * Property types are: string | number | boolean | array | object
 *
 * schema_example = {
 *  name: {
 *    type: "string",
 *    required: true
 *  },
 *  price: {
 *    type: "number",
 *    required: true
 *  }
 * };
 *
 * @param params<object>
 * @param schema<PSchema>
 *
 * @return object<PResult>
 */
export function processParams(
  params: object,
  schema: ParamSchema
): ParamResult {
  let result = <ParamResult>{
    processed: {},
    validated: {
      status: true,
      errors: []
    }
  };

  if (!isEmpty(params)) {
    // Normalizing types
    for (let prop in params) {
      if (has(schema, prop)) {
        if (schema[prop].type == "string") {
          if (!isString(params[prop])) {
            result.processed[prop] = String(params[prop]);
          } else {
            result.processed[prop] = params[prop];
          }
        }
        if (params[prop] && schema[prop].type == "number") {
          if (typeof params[prop] !== "number") {
            result.processed[prop] = Number(params[prop]);
          } else {
            result.processed[prop] = params[prop];
          }
          if (!isNumber(result.processed[prop])) {
            result.validated.errors.push(
              "Param property '" +
              prop +
              "' must be a type of " +
              schema[prop].type
            );
          }
        }
        if (schema[prop].type == "boolean") {
          if (!isEmpty(params[prop]) && typeof params[prop] !== "boolean") {
            try {
              result.processed[prop] = JSON.parse(params[prop]);
            } catch (err) {
              result.validated.errors.push(
                "Param property '" +
                prop +
                "' caught an error '" +
                err.message +
                "' trying beeing converted to type " +
                schema[prop].type
              );
            }
          } else {
            result.processed[prop] = params[prop];
          }
          //Checking if processed property is a type of boolean
          if (typeof result.processed[prop] !== "boolean") {
            result.validated.errors.push(
              "Param property '" +
              prop +
              "' must be a type of " +
              schema[prop].type
            );
          }
        }
        if (schema[prop].type == "array") {
          if (!isEmpty(params[prop]) && !Array.isArray(params[prop])) {
            try {
              result.processed[prop] = JSON.parse(params[prop]);
            } catch (err) {
              result.validated.errors.push(
                "Param property '" +
                prop +
                "' caught an error '" +
                err.message +
                "' trying beeing converted to type " +
                schema[prop].type
              );
            }
          } else {
            result.processed[prop] = params[prop];
          }
          //Checking if processed property is a type of array
          if (!Array.isArray(result.processed[prop])) {
            result.validated.errors.push(
              "Param property '" +
              prop +
              "' must be a type of " +
              schema[prop].type
            );
          }
        }
        if (schema[prop].type == "object") {
          if (!isEmpty(params[prop])) {
            if (
              typeof result.processed[prop] !== "object" ||
              Array.isArray(result.processed[prop])
            ) {
              try {
                result.processed[prop] = JSON.parse(params[prop]);
              } catch (err) {
                result.validated.errors.push(
                  "Param property '" +
                  prop +
                  "' caught an error '" +
                  err.message +
                  "' trying beeing converted to type " +
                  schema[prop].type
                );
              }
            } else {
              result.processed[prop] = params[prop];
            }
          }
          //Checking if processed property is a type of object. Null considered as a valid object
          if (
            typeof result.processed[prop] !== "object" ||
            Array.isArray(result.processed[prop])
          ) {
            result.validated.errors.push(
              "Param property '" +
              prop +
              "' must be a type of " +
              schema[prop].type
            );
          }
        }
      } else {
        result.validated.errors.push(
          "Param property '" + prop + "' hasn't specified in schema"
        );
      }
    }
  }

  // Checking required properties
  if (!isEmpty(schema)) {
    for (let prop in schema) {
      if (schema[prop].required == true) {
        if (!has(result.processed, prop)) {
          result.validated.errors.push(
            "Required property '" + prop + "' hasn't found in params"
          );
        } else {
          if (
            schema[prop].type == "string" &&
            isEmpty(result.processed[prop])
          ) {
            result.validated.errors.push(
              "Required property '" + prop + "' is empty or has no value"
            );
          }
          //Empty string convert to 0 value. So its always true
          if (schema[prop].type == "number") {
            if (!isNumber(result.processed[prop])) {
              result.validated.errors.push(
                "Required property '" + prop + "' is empty or has no value"
              );
            }
          }
          if (schema[prop].type == "boolean" && isNil(result.processed[prop])) {
            result.validated.errors.push(
              "Required property '" + prop + "' is empty or has no value"
            );
          }
          if (schema[prop].type == "array" && isEmpty(result.processed[prop])) {
            result.validated.errors.push(
              "Required property '" + prop + "' is empty or has no value"
            );
          }
          if (
            schema[prop].type == "object" &&
            isEmpty(result.processed[prop])
          ) {
            result.validated.errors.push(
              "Required property '" + prop + "' is empty or has no value"
            );
          }
        }
      }
    }
  }

  if (result.validated.errors.length > 0) result.validated.status = false;
  return result;
}

/**
 * Request Middleware Normalizer functions
 * Normalize and Validate req.body parameters according to specified schema
 *
 * replaces req.body with processed parameters
 * OR shows error message with 400
 *
 */
export function paramNormalizer(schema: ParamSchema) {
  return (req, res, next) => {
    // logger.info(JSON.stringify(req.body), ["req.body"]);
    const params = processParams(req.body, schema);
    // logger.info(JSON.stringify(params), ["processParams"]);
    if (params.validated.status) {
      req.body = params.processed;
      next();
    } else {
      // logger.error(JSON.stringify(req.body), ["req.body"]);
      // logger.error(JSON.stringify(params), ["processParams"]);
      res.status(400).json({
        message: params.validated.errors.join("; \n")
      });
    }
  };
}