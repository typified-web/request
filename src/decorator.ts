/// <reference lib="dom" />

/**
 * The supported HTTP methods.
 */
export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Common JSON definition.
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
 * the path parameter.
 */
type PathParameter = Record<string, string | number | boolean>;

/**
 * The Request Specification.
 */
export type ReqSpec = {
  route?: PathParameter;
  headers?: Record<string, string>;
  body?: Json;
};

/**
 * The API Specification.
 */
export type APISpec = {
  /**
   * URL or path of the API endpoint.
   */
  [path: string]: {
    /**
     * HTTP Methods.
     */
    [M in Methods]?: {
      /**
       * Request Specification.
       */
      req?: ReqSpec;
      /**
       * Result of the response.
       */
      output: Json;
    };
  };
};

/**
 * The typed request options.
 */
export type ReqOpt<Req extends ReqSpec> =
  Omit<RequestInit, "method" | "headers" | "body">
  & { query?: PathParameter; }
  & (Req extends Record<string, any>
    ? Req["headers"] extends Record<string, string>
    ? { headers: Req["headers"] }
    : {}
    : {})
  & (Req extends Record<string, any>
    ? Req["body"] extends Json
    ? { body: Req["body"] }
    : {}
    : {})
  & (Req extends Record<string, any>
    ? Req["route"] extends PathParameter
    ? { route: Req["route"] }
    : {}
    : {})

/**
 * The typed response.
 */
export interface Resp<T> extends Response {
  json(): Promise<T>;
}

const pathSep = "/";

/**
 * Map the URL with given parameters.
 * 
 * @param url the URL to map.
 * @param params the path parameters.
 * @returns the mapped URL.
 */
function mapUrl(url: string, params?: PathParameter) {
  return params
    ? url
      .split(pathSep)
      .map((part) => {
        if (part.startsWith(":")) {
          return encodeURIComponent(params[part.substr(1)]);
        }
        return part;
      })
      .join(pathSep)
    : url;
}

function toQueryString(params: PathParameter) {
  return Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
}

function appendQueryString(url: string, params?: PathParameter) {
  return params
    ? url.indexOf('?') ? `${url}?${toQueryString(params)}` : `${url}&${toQueryString(params)}`
    : url;
}

/**
 * Decorate the given fetch function and return a typed one.
 * 
 * @param fetch the original fetch.
 * @returns the decorated fetch.
 */
export default function decorateFetch<API extends APISpec>(
  fetch: (url: string, opt?: RequestInit) => Promise<Response>
) {
  return function (url: string, opt?: any) {
    return fetch(appendQueryString(mapUrl(url, opt.route), opt.query), {
      ...opt,
      body: (
        typeof opt.body === 'undefined' || typeof opt.body === 'string'
          ? opt.body
          : JSON.stringify(opt.body)
      )
    });
  } as <K extends keyof API, M extends keyof API[K]>(
      url: K,
      opt: { method: M } & ReqOpt<
        API[K][M] extends Record<string, any> ? API[K][M]["req"] : never
      >
    ) => Promise<
      Resp<API[K][M] extends Record<string, any> ? API[K][M]["output"] : never>
    >;
}
