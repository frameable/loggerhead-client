import test from 'node:test';
import assert from 'node:assert';

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

const { loggerhead } = await import('../index.js');

loggerhead.trackClicks();
loggerhead.trackExceptions();

loggerhead.configure({
  endpoint: 'https://localhost/log',
  userId: 'my-user-id',
  email: 'buckminster@fuller.com',
  tenantId: 'tenable',
  applicationName: 'test-application',
  applicationVersion: 'release-100',
})

test('test payload', (t) => {

  loggerhead.fetch = (url) => {
    const payload = url.split('=')[1]
    assert(payload.includes('%22test%22%2C%22%22%2C%22ubuntu%22%2C%22linux%22%2C%22node%22%2C%22http%3A%2F%2Faltavista.com%22%2C%22release-100%22%2C%22buckminster%40fuller.com%22%2C%22tenable%22%2C%22test-application%22%2Cnull%2C%22UTC%22%2C%22my-user-id%22%2Cnull%2C%22info%22', 'encoded payload'));
  }
  loggerhead.info('test');

});

test('roundtrip payload', (t) => {

  loggerhead.fetch = (url) => {
    const payload = url.split('=')[1]
    const data = loggerhead.decodePayload(payload);
    assert(data.timestamp, 'data has a timestamp');
    assert(data.instanceId, 'data has an instanceId');

    delete data.timestamp;
    delete data.instanceId;
    delete data.uniqueId;
    delete data.sequenceNumber;

    assert.deepEqual(data, {
      eventName: 'test',
      context: '',
      vendor: 'ubuntu',
      platform: 'linux',
      userAgent: 'node',
      url: 'http://altavista.com',
      applicationVersion: 'release-100',
      email: 'buckminster@fuller.com',
      tenantId: 'tenable',
      applicationName: 'test-application',
      displayName: null,
      timezone: 'UTC',
      userId: 'my-user-id',
      userAgentShort: null,
      logLevel: 'info',
      details: '{}',
      schemaVersion: '%%version_2%%',
    }, 'data made round trip');
  };
  loggerhead.info('test');

});

test('custom details', (t) => {

  loggerhead.fetch = (url) => {
    const payload = url.split('=')[1]
    const data = loggerhead.decodePayload(payload);

    assert.deepEqual(
      data.details,
      JSON.stringify({ extra: 1, fortran: 2 }),
      'configured details layered in'
    );
  };

  loggerhead.configure({ details: { extra: 1 } });
  loggerhead.info('test', 'context', { fortran: 2 });

});

test('custom details', (t) => {

  loggerhead.fetch = (url) => {
    const payload = url.split('=')[1]
    const data = loggerhead.decodePayload(payload);

    assert.deepEqual(
      data.details,
      JSON.stringify({ extra: 1, fortran: 2 }),
      'configured details layered in'
    );
  };

  loggerhead.configure({ details: { extra: 1 } });
  loggerhead.info('test', 'context', { fortran: 2 });

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

