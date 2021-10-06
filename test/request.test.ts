import { strict as assert } from 'assert';
import { getLocal } from 'mockttp';
import fetch from 'cross-fetch';
import { createRequest } from '../src/request';

type MockAPI = {
  '/test': {
    get: {
      query?: {
        name: string;
      };
      output: {
        body: {
          resCode: string;
          result: Array<{
            name: string;
          }>;
        };
      };
    };
    post: {
      input: {
        body: {
          name: string;
        };
      };
      output: {
        body: {
          resCode: string;
        };
      };
    };
  };
  '/test/:name': {
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

describe('request', () => {
  const server = getLocal();
  before(async () => await server.start());
  after(async () => await server.stop());
  afterEach(async () => server.reset());

  const request = createRequest<MockAPI>({
    fetch: (url, opt) => {
      return fetch(server.urlFor(url as string), opt);
    },
  });

  it('should get list', async () => {
    const respBody = { resCode: '0', result: [{ name: 'test' }] };
    await server.get('/test').thenReply(200, JSON.stringify(respBody));

    assert.deepEqual((await request.endpoint('/test').get()).body, respBody);
  });

  it('should post one', async () => {
    const reqBody = { name: 'test' };
    const respBody = { resCode: '0' };
    await server.post('/test').withBody(JSON.stringify(reqBody)).thenReply(200, JSON.stringify(respBody));

    assert.deepEqual((await request.endpoint('/test').post({ body: reqBody })).body, respBody);
  });

  it('should get one', async () => {
    const name = 'name';
    const respBody = { resCode: '0', result: { name: 'test' } };
    await server.get(`/test/${name}`).thenReply(200, JSON.stringify(respBody));

    assert.deepEqual((await request.endpoint('/test/:name').get({ route: { name } })).body, respBody);
  });

  it('should append query string', async () => {
    const query = { name: 'test' };
    const respBody = { resCode: '0', result: { name: 'test' } };
    await server.get('/test').withQuery(query).thenReply(200, JSON.stringify(respBody));

    assert.deepEqual((await request.endpoint('/test').get({ query: { name: 'test' } })).body, respBody);
  });
});
