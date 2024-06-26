const SCHEMA_VERSION = 2;

class Loggerhead {

  constructor(options = {}) {
    this.configure(options);
    this.error = this.error.bind(this);
    this.logError = this.logError.bind(this);
    this._sequenceNumber = 0;
    this._instanceId = Math.random().toString(36).slice(2);
  }

  configure(options = {}) {

    if ('logLevel' in options) this.logLevel = options.logLevel || 'info';
    if ('endpoint' in options) this.endpoint = options.endpoint;

    this.beforeLog = options.beforeLog || this.beforeLog || new Function;
    this.afterLog = options.afterLog || this.afterLog || new Function;

    this.metadata = this.metadata || {};

    const META_FIELDS = ['applicationName', 'applicationVersion', 'email', 'displayName', 'userId', 'tenantId', 'userAgentShort'];

    for (const f of META_FIELDS) {
      if (f in options) this.metadata[f] = options[f];
    }

    this.metadata.timezone = options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.metadata.platform = options.platform || this.metadata.platform || navigator.platform;
    this.metadata.vendor = options.vendor || this.metadata.vendor || navigator.vendor;
    this.metadata.userAgent = options.userAgent || this.metadata.userAgent || navigator.userAgent;
    this.metadata.details = (typeof options.details == 'object') ? options.details : {};
  }

  trackClicks() {
    document.addEventListener('click', e => {
      let el = e.target;

      const trackableEl = el.closest('[data-track]');
      if (trackableEl) {
        var identifier = trackableEl.getAttribute('data-track');
      } else {
        var identifier = el.tagName + '-' + (el.textContent.replace(/[^\w]+/g, '-').slice(0,36) || el.getAttribute('alt') || el.getAttribute('title'))
      }
      this.info('click', identifier);
    }, true);
  }

  trackExceptions() {
    if (this._exceptionHandlersInitialized) {
      console.warn("exception handlers already initialized");
      return;
    }
    window.addEventListener('error', this.logError, true);
    window.addEventListener('unhandledrejection', this.logError, true);
    this._exceptionHandlersInitialized = true;
  }

  log(eventName, context, details={}, logLevel) {

    if (LOG_LEVELS[this.logLevel] > LOG_LEVELS[logLevel]) return
    if (!this.endpoint) throw "we need a configured log endpoint";
    if (this._sequenceNumber++ > 10000) throw "too many logs";

    const detailsJSON = JSON.stringify(Object.assign({}, this.metadata.details, details));

    const payload = Object.assign({}, this.metadata, {
      schemaVersion: `%%version_${SCHEMA_VERSION}%%`,
      eventName,
      context,
      details: detailsJSON,
      url: window.location.href,
      timestamp: Date.now(),
      logLevel,
      instanceId: this._instanceId,
      sequenceNumber: this._sequenceNumber,
      uniqueId: this.uid(),
    });

    this.beforeLog(payload);
    const data = this.encodePayload(payload);
    this.fetch(`${this.endpoint}?d=${data}`);
    this.afterLog(payload)
  }

  fetch(url) {
    const i = new Image();
    i.src = url;
  }

  trace(eventName, context='', details={}) {
    this.log(eventName, context, details, 'trace');
  }

  debug(eventName, context='', details={}) {
    this.log(eventName, context, details, 'debug');
  }

  info(eventName, context='', details={}) {
    this.log(eventName, context, details, 'info');
  }

  warn(eventName, context='', details={}) {
    this.log(eventName, context, details, 'warn');
  }

  error(eventName, context='', details={}) {
    this.log(eventName, context, details, 'error');
  }

  logError(errorEvent) {

    const error = errorEvent.error || errorEvent.message || errorEvent.reason || errorEvent;
    if (!error) return;

    try {
      var errorMessage = error.toString();

      var stack = error.stack && error.stack
        .replace(/@https:\/\/[^\/]+\//g, '@')
        .split('\n').slice(0, 12).join('\n');
    } catch (e) {
      return;
    }

    if (!errorMessage) errorMessage = "null";
    if (!stack) stack = "null";

    if (errorMessage.trim() == '[object Event]') {
      // skip if we don't have useful information to log
      return;
    }

    this.error('error', errorMessage.trim(), { stack: stack.trim() });
    console.error(errorEvent);
  }

  encodePayload(data) {
    const d = FIELDS.map(f => data[f]);
    return encodeURIComponent(JSON.stringify(d));
  }

  decodePayload(payload) {
    const values = JSON.parse(decodeURIComponent(payload))
    return FIELDS.reduce((a, i) => (a[i] = values.shift(), a), {})
  }

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

const LOG_LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
}

const FIELDS = [
  'timestamp',
  'eventName',
  'context',
  'vendor',
  'platform',
  'userAgent',
  'url',
  'applicationVersion',
  'email',
  'tenantId',
  'applicationName',
  'displayName',
  'timezone',
  'userId',
  'userAgentShort',
  'logLevel',
  'instanceId',
  'sequenceNumber',
  'uniqueId',
  'details',
  'schemaVersion',
];

const loggerhead = new Loggerhead();

export { Loggerhead, loggerhead };
