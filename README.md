# @typified-web/request

A tiny request library to provide compile-time type-safe with your API specification.

## Features

- Types for each API calls with simple declarations for API,

  which means:

  - Code completion by API declarations with supported editor (like VSCode).

  - Type validation at compile-time (design-time).

- Natural API to request resources.

- Tiny footprint for runtime of browser and NodeJS (about **4kb** uncompressed).

## Getting Started

Installation via npm:

```shell
npm i @typified-web/request
```

Declare your API. E.g. the `GET /greet/:name` end point:

```typescript
type YourAPI = {
  '/greet/:name': {
    get: {
      input: {
        route: {
          name: string;
        };
      };
      output: {
        body: {
          resCode: string;
          result: {
            name: string;
          };
        };
      };
    };
  };
};
```

Then create your API request client:

```typescript
import { createRequest } from '@typified-web/request';

// the decorated reuqest function.
export default createRequest<YourAPI>();
```

> If you're using NodeJS, install `node-fetch` to provide the `fetch` implementation, like:
>
> ```typescript
> import fetch from 'node-fetch';
>
> export default createRequest<YourAPI>({
>   fetch: (path, opt) => {
>     return fetch(`${host}${path}`, opt);
>   },
> });
> ```

Then, you can use it anywhere you like via `import` and get auto completion and validation for each request:

```typescript
import request from './the/newly/created/request';

// send a request.
request.endpoint('/greet/:name').get({ route: { name: 'Jack' } });
```

Code-completion and type validation works like a charm.

## API

The API includes two parts: the API declaration for design-time and the decorated request client for runtime.

### API declaration

The API definition is like the Open API specification, but in a more simpler form of typescript declarations.

```typescript
export type APISpec = {
  // URL or path of the API endpoint.
  [path: string]: {
    // HTTP Methods.
    [M in Method]?: {
      // Request Specification.
      input?: {
        // Path parameters
        route?: PathParameter;
        // Path parameters
        query?: PathParameter;
        // Headers
        headers?: Record<string, string>;
        // Request body.
        body?: Json;
      };
      // Response Specification.
      output: {
        headers?: Record<string, string>;
        body?: Json;
      };
    };
  };
};
```

The declaration is just for design-time only and will be swiped in runtime. That's why we call it almost **zero-overhead**.

> **Too large for a single API declaration?**
>
> You can split your API declaration into several types and use intersection type to join them together.
>
> e.g.
>
> ```typescript
> // first part of API declaration.
> type YourAPI_1 = {
>   '/greet/:name': {
>     get: {
>       input: {
>         route: {
>           name: string;
>         };
>       };
>       output: {
>         body: {
>           resCode: string;
>           result: {
>             name: string;
>           };
>         };
>       };
>     };
>   };
> };
>
> // second part of API declaration.
> type YourAPI_2 = {
>   '/say-hello/:name': {
>     get: {
>       input: {
>         route: {
>           name: string;
>         };
>       };
>       output: {
>         body: {
>           resCode: string;
>           result: {
>             name: string;
>           };
>         };
>       };
>     };
>   };
> };
>
> // join them with type intersection.
> export type API = YourAPI_1 & YourAPI_2;
> ```

### The request client

To create a request client, you can specify your customized fetch implemenation for easy extention:

```typescript
import fetch from 'node-fetch';

const request = createRequest<YourAPI>({
  fetch: (path, opt) => {
    return fetch(`${host}${path}`, opt);
  },
});
```

The request client itself is complicatedly typed as it uses generics massively.

However, the usage is quite simple.

```typescript
request.endpoint('PATH').method({ params });
```

The path is the resource key defined in your API specification and method is the supported method(`get`/`post`/`put`/`patch`/`delete`) for your endpoint declaration. The parameters will be inferred for you.

## Limitations

It just add type declarations to the JSON-like API, which means the input and output are mostly JSON. Anything outside the JSON-like API is not considered well.

Help is welcomed!

## License

MIT.
