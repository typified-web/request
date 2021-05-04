# typed-fetch-decorator

An experimental almost zero-cost decorator for fetch with your API specification.

## Why?

- types for each API calls with simple declarations for API,
  which means:
  - code auto completion by API declarations.
  - type validation.
- familiar and handy API for both browser & NodeJS.
- almost zero overhead for runtime.

## Getting Started

Installation via npm:

```shell
npm i typed-fetch-decorator
```

Declare your API. E.g. the `GET /test/:name` end point:

```typescript
import decoratedFetch from "typed-fetch-decorator";

// declare your API.
type YourAPI = {
  "/test/:name": {
    GET: {
      req: {
        route: {
          name: string;
        };
      };
      output: {
        resCode: string;
        result: {
          name: string;
        };
      };
    };
  };
};

// the decorated fetch function.
export default decoratedFetch<YourAPI>(fetch);
```

Then, you can use it anywhere you like via `import` and get auto completion and validation for the fetch.

> If you're using NodeJS, install `node-fetch` to provide the `fetch` implementation.

## API

It's quite simple. As you can see in the example above, the API includes two parts: the API declaration and the decorated fetch function.

### API declaration

The API definition is like the Open API specification, but in a more simpler form of typescript declarations.

```typescript
export type APISpec = {
  // URL or path of the API endpoint.
  [path: string]: {
    // HTTP Methods.
    [M in Methods]?: {
      // Request Specification.
      req?: {
        // Path parameters
        route?: PathParameter;
        // Headers
        headers?: Record<string, string>;
        // Request body.
        body?: Json;
      };
      // Result of the response in JSON format.
      output: Json;
    };
  };
};
```

The declaration is just for development only and will be swipped in runtime. That's why we call it zero-overhead.

### The decorated fetch function

The decorator itself is complicatedly typed due to some flaws of typescript. Here we simplified the decorated fetch function as:

```typescript
function fetch(url: string, opt: {
  headers: YOU_API_HEADERS,
  body: YOUR API_BODY,
  // ... other fetch options.
}): Promise<Reponse<YOUR_API_OUTPUT>>
```

In short, you can just use the decorated fetch function like the original `fetch` with types.

for more details, see the project declaration files.

## Limitations

The decorator is not a one-to-one typed decorator to fetch. It just add type declarations to the JSON-like API, which means the input and output are mostly JSON. Anything outside the JSON-like API is not considered well.

Help is welcomed!

## License

MIT.
