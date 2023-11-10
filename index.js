class Loggerhead {

  constructor(options = {}) {
    this.configure(options);
    this.error = this.error.bind(this);
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
  }

  trackClicks() {
    document.addEventListener('click', e => {
      let el = e.target;

      const trackableEl = el.closest('[data-track]');
      const identifier = trackableEl ? trackableEl.getAttribute('data-track') : `${el.tagName.toLowerCase()}.${el.className}`;
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

  log(event, context, details={}, logLevel) {

    if (LOG_LEVELS[this.logLevel] > LOG_LEVELS[logLevel]) return
    if (typeof event != 'string') throw "event must be a string";
    if (event == '') throw "event must not be empty";
    if (typeof context != 'string') throw "context must be a string";
    if (typeof details != 'object') throw "details must be an object";
    if (!this.endpoint) throw "we need a configured log endpoint";
    if (this._sequenceNumber++ > 10000) throw "too many logs";

    const payload = {
      event,
      context,
      details,
      url: window.location.href,
      timestamp: Date.now(),
      ...this.metadata,
      level: logLevel,
      instanceId: this._instanceId,
      sequenceNumber: this._sequenceNumber,
    };

    this.beforeLog(payload);
    const data = this.encodePayload(payload);
    this.fetch(`${this.endpoint}?d=${data}`);
    this.afterLog(payload)
  }

  fetch(url) {
    const i = new Image();
    i.src = url;
  }

  trace(event, context='', details={}) {
    this.log(event, context, details, 'trace');
  }

  debug(event, context='', details={}) {
    this.log(event, context, details, 'debug');
  }

  info(event, context='', details={}) {
    this.log(event, context, details, 'info');
  }

  warn(event, context='', details={}) {
    this.log(event, context, details, 'warn');
  }

  error(event, context='', details={}) {
    this.log(event, context, details, 'error');
  }

  logError(errorEvent) {

    const error = errorEvent.error || errorEvent.message || errorEvent.reason;
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

    this.error(errorMessage.trim(), stack.trim());
    console.error(error);
  }

  encodePayload(data) {
    const d = FIELDS.map(f => data[f]);
    return escape(JSON.stringify(d));
  }

  decodePayload(payload) {
    const values = JSON.parse(unescape(payload))
    return FIELDS.reduce((a, i) => (a[i] = values.shift(), a), {})
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
  'event',
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
  'level',
  'instanceId',
  'sequenceNumber',
];

const loggerhead = new Loggerhead();

export { Loggerhead, loggerhead };
