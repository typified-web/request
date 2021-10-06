/**
 * The general JSON definition.
 */
export type Json =
  | null
  | string
  | number
  | boolean
  | Array<Json>
  | {
      [key: string]: Json;
    };

/**
 * Supported HTTP methods.
 */
export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * the path parameter.
 */
type PathParameter = Record<string, string | number | boolean>;

/**
 * The Request Specification.
 */
export type ReqSpec = {
  route?: PathParameter;
  query?: PathParameter;
  headers?: Record<string, string>;
  body?: Json;
};

/**
 * The Request Specification.
 */
export type RespSpec = {
  headers?: Record<string, string>;
  body?: Json;
};

/**
 * The route specification.
 */
export type RouteSepc = {
  /**
   * Request Specification.
   */
  input?: ReqSpec;
  /**
   * Result of the response.
   */
  output?: RespSpec;
};

/**
 * The endpoint specification.
 */
export type EndpointSpec = {
  /**
   * HTTP Methods.
   */
  [M in Method]?: RouteSepc;
};

/**
 * The API Specification.
 */
export type APISpec = {
  /**
   * URL or path of the API endpoint.
   */
  [path: string]: EndpointSpec;
};

/**
 * The inferred supported function to send a request.
 */
export type ActFunc<T> = T extends RouteSepc
  ? T['input'] extends
      | { headers: Record<string, string> }
      | { body: Json }
      | { route: PathParameter }
      | { query: PathParameter }
    ? (p: T['input']) => Promise<T['output']>
    : (p?: T['input']) => Promise<T['output']>
  : never;

/**
 * The request client with inferred supported methods.
 */
export type EndpointRequest<E extends EndpointSpec> = {
  /**
   * Send the actual request.
   */
  [M in Extract<keyof E, Method>]: ActFunc<E[M]>;
};

/**
 * The typed request client.
 */
export type Request<API extends APISpec> = {
  /**
   * Get the specific request client for given endpoint path.
   *
   * @param path the path of the endpoint resource.
   */
  endpoint<P extends Extract<keyof API, string>>(path: P): EndpointRequest<API[P]>;
};

const noop = () => {
  throw new Error('unsupported');
};

/**
 * Map the URL with given parameters.
 *
 * @param url the URL to map.
 * @param params the path parameters.
 * @returns the mapped URL.
 */
function mapUrl(path: string, params?: PathParameter): string {
  if (!params) {
    return path;
  }
  return path
    .split('/')
    .map((part) => {
      if (part.startsWith(':')) {
        return encodeURIComponent(params[part.substr(1)]);
      }
      return part;
    })
    .join('/');
}

/**
 * Append query string to the given path.
 *
 * @param path the path to append query string.
 * @param q the query paramters.
 * @returns the path with query string.
 */
function queryUrl(path: string, q?: PathParameter): string {
  if (!q) {
    return path;
  }
  return (
    path +
    '?' +
    Object.entries(q)
      .map(([k, v]) => `${decodeURIComponent(k)}=${decodeURIComponent(v.toString())}`)
      .join('&')
  );
}
class EndpointRequestImpl {
  constructor(readonly path: string, readonly option: RequestOption) {}

  get(ctx?: ReqSpec): Promise<RespSpec> {
    return this.do('get', ctx);
  }

  post(ctx?: ReqSpec): Promise<RespSpec> {
    return this.do('post', ctx);
  }

  put(ctx?: ReqSpec): Promise<RespSpec> {
    return this.do('put', ctx);
  }

  patch(ctx?: ReqSpec): Promise<RespSpec> {
    return this.do('patch', ctx);
  }

  delete(ctx?: ReqSpec): Promise<RespSpec> {
    return this.do('delete', ctx);
  }

  protected async do(method: Method, ctx?: ReqSpec): Promise<RespSpec> {
    const resp = await this.option.fetch(queryUrl(mapUrl(this.path, ctx?.route), ctx?.query), {
      method,
      headers: {
        ...(ctx?.headers ?? {}),
        'content-type': 'application/json',
      },
      body: ctx?.body != null ? JSON.stringify(ctx.body) : undefined,
    });
    const body = await resp.json();
    return {
      headers: new Proxy(
        {},
        {
          get(target, key) {
            return resp.headers.get(key.toString());
          },
        },
      ),
      body,
    };
  }
}

/**
 * The request options.
 */
export type RequestOption = {
  /**
   * The underly fetch function used to send the actual request to the server.
   *
   * The typical usage will be:
   * - You may override the fetch function to add your logic, like authentication.
   * - You may override the fetch with a custom implementation to use in an environment without a builtin fetch,
   *   like node.
   */
  fetch: typeof fetch;
};

class RequestImpl<API extends APISpec> {
  readonly option: RequestOption;

  constructor(opt?: RequestOption) {
    this.option = {
      fetch: opt?.fetch ?? (typeof fetch === 'function' ? fetch : noop),
    };
  }

  endpoint<P extends Extract<keyof API, string>>(path: P): EndpointRequest<API[P]> {
    return new EndpointRequestImpl(path, this.option);
  }
}

/**
 * Create a typed request client.
 *
 * @param opt the options.
 * @returns the typed request client.
 */
export function createRequest<API extends APISpec>(opt?: { fetch: typeof fetch }): Request<API> {
  return new RequestImpl<API>(opt);
}
