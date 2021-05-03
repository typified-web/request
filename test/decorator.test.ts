import { strict as assert } from "assert";
import { getLocal } from "mockttp";
import fetch from "cross-fetch";
import decorateFetch from "../src/decorator";

type MockAPI = {
  "/test": {
    GET: {
      output: {
        resCode: string;
        result: Array<{
          name: string;
        }>;
      };
    };
    POST: {
      req: {
        body: {
          name: string;
        };
      };
      output: {
        resCode: string;
      };
    };
  };
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

describe("decorated fetch", () => {
  const server = getLocal();
  before(async () => await server.start());
  after(async () => await server.stop());
  afterEach(async () => server.reset());

  const decoratedFetch = decorateFetch<MockAPI>((url, opt) => {
    return fetch(server.urlFor(url), opt);
  });

  it("should get list", async () => {
    const respBody = { resCode: "0", result: [{ name: "test" }] };
    await server.get("/test").thenReply(200, JSON.stringify(respBody));

    assert.deepEqual(
      await (await decoratedFetch("/test", { method: "GET" })).json(),
      respBody
    );
  });

  it("should post one", async () => {
    const reqBody = { name: "test" };
    const respBody = { resCode: "0" };
    await server
      .post("/test")
      .withBody(JSON.stringify(reqBody))
      .thenReply(200, JSON.stringify(respBody));

    assert.deepEqual(
      await (
        await decoratedFetch("/test", { method: "POST", body: reqBody })
      ).json(),
      respBody
    );
  });

  it("should get one", async () => {
    const name = "name";
    const respBody = { resCode: "0", result: { name: "test" } };
    await server.get(`/test/${name}`).thenReply(200, JSON.stringify(respBody));

    assert.deepEqual(
      await (
        await decoratedFetch("/test/:name", { method: "GET", route: { name } })
      ).json(),
      respBody
    );
  });

  it("should append query string", async () => {
    const query = { name: 'test' };
    const respBody = { resCode: "0", result: { name: "test" } };
    await server.get(`/test`).withQuery(query).thenReply(200, JSON.stringify(respBody));
    
    assert.deepEqual(
      await (
        await decoratedFetch("/test", { method: "GET", query })
      ).json(),
      respBody
    );
  })
});
