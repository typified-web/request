# typed-fetch-decorator

An experimental almost zero-cost decorator for fetch with your API specification.

## Why?

- types for each API calls with simple declarations for API,
  which means:
  - code auto completion by API declarations.
  - type validation.
- familiar and handy API.
- almost zero cost for encapsulation.

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

## API

It's quite simple. As you can see in the example above, the API includes two parts: the API declaration and the decorated fetch function. The decorated fetch function is mostly typed so you can just use it without any pain. The API definition is like the Open API specification, but in a more simpler form of typescript declarations.

See the project declaration files for more details.

## Limitations

The decorator is not a one-to-one typed decorator to fetch. It just add type declarations to the JSON-like API, which means the input and output are mostly JSON. Anything outside the JSON-like API is not considered well.

Help is welcomed!

## License

MIT.
