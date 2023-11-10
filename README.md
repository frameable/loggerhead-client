# loggerhead-client

Client-side error and event tracking

```javascript
import { loggerhead } from 'loggerhead-client'

loggerhead.configure({
  endpoint: 'https://my-corp.biz/log',
  logLevel: 'info',
})

loggerhead.trackExceptions();
loggerhead.trackClicks();

loggerhead.info('user_created_post', 'onboarding_flow', { postId: 492 })
```

## API

#### loggerhead.configure(options)

Configure the loggerhead singleton client instance.  Options include...

- `endpoint` - server HTTP endpoint provided by you that will ingest these messages
- `logLevel` - verbosity setting for logging messages by severity (`trace`, `debug`, `info`, `warn`, `error`); defaults to `info`.
- `beforeLog` - callback before the log message is sent; takes the data payload to be sent
- `afterLog` - callback after the message is sent; takes the sent data payload
- `applicationName` - name of the application
- `applicationVersion` - version identifier such as a sha or tag or release number
- `email` - email address of the logged in user
- `userId` - user identifier for the logged in user
- `tenantId` - identifier for the tenant or organization to which the logged in user belongs
- `userAgent` - user agent string; defaults to `navigator.userAgent`
- `vendor` - user agent vendor; defaults to `navigator.vendor`
- `platform` - operating system identifier; defaults to `navigator.platform`

#### loggerhead.trackExceptions()

Install event handlers to `window.onerror` and `window.onunhandledrejection` in order to ship these events as error log messages.  The aim is that when any error occurs, a corresponding log message is sent.

#### loggerhead.trackClicks()

Install a `click` event handler that will ship click events.  If the target element of the event or any of its paretn elements has a `data-track` attribute, then that will be populated as the `context` parameter of the log message.

#### log.info(event[, context, details])

Log a message that something expected happened.  The `event` parameter is a string that describes or identifies the action that took place.  The optional `context` parameter is also a string describing the surroundings of the event.  The optional `details` parameter is an object to be stored as JSON with any extra metadata.

#### log.trace(event[, context, details])

Log a message that something happened

#### log.debug(event[, context, details])

Log a message that something happened

#### log.warn(event[, context, details])

Log a message that something happened that should probably not have happened

#### log.error(event[, context, details])

Log a message that something happened that should definitely not have happened

## License

Copyright © 2023 Frameable, Inc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
