import test from 'node:test';
import assert from 'assert';

global.navigator = {
  userAgent: 'node',
  platform: 'linux',
  vendor: 'ubuntu',
}

global.window = {
  location: { href: 'http://altavista.com' },
  addEventListener: new Function
}

global.document = {
  addEventListener: new Function
}

const { loggerhead } = await import('../src/client.js');

loggerhead.initializeClickHandler();
loggerhead.initializeExceptionHandlers();

loggerhead.configure({
  logEndpoint: 'https://localhost/log',
  userId: 'my-user-id',
  email: 'buckminster@fuller.com',
  tenantId: 'tenable',
  applicationName: 'test-application',
})

test('test payload', (t) => {

  loggerhead.fetch = (url) => {
    const payload = url.split('=')[1]
    assert.equal(
      payload.slice(19),
      '%22test%22%2C%22%22%2C%22ubuntu%22%2C%22linux%22%2C%22node%22%2C%22http%3A//altavista.com%22%2Cnull%2C%22buckminster@fuller.com%22%2C%22tenable%22%2C%22test-application%22%2Cnull%2Cnull%2C%22my-user-id%22%2Cnull%2C%22info%22%5D',
      'encoded payload'
    );
  };
  loggerhead.info('test');

});

test('before log', (t) => {

  loggerhead.configure({ beforeLog: x => assert.equal(typeof x, 'object') });
  loggerhead.fetch = new Function;
  loggerhead.info('test');

});

test('before log', (t) => {

  loggerhead.configure({ logLevel: 'error' })
  loggerhead.fetch = x => console.log("ERROR", x);
  loggerhead.info('test');

});

