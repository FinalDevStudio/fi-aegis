# Fi Aegis

[![Build Status](https://travis-ci.org/FinalDevStudio/fi-aegis.svg?branch=master)](https://travis-ci.org/FinalDevStudio/fi-aegis)
[![npm version](https://badge.fury.io/js/fi-aegis.svg)](https://badge.fury.io/js/fi-aegis)


### Web Application Security Middleware

This fork is based on [lusca](https://github.com/krakenjs/lusca) [v1.4.1](https://github.com/krakenjs/lusca/releases/tag/v1.4.1) but has changed greatly since.

The most relevant changes are minor optimizations, code refactoring and improved documentation with the addition of some functionality.


## Usage

```js
const session = require('express-session');
const express = require('express');
const aegis = require('fi-aegis');

const app = express();

/* This or other session management will be required */
app.use(session({
  secret: 'abc',
  resave: true,
  saveUninitialized: true
}));

app.use(aegis({
  csrf: true,
  csp: {
    angular: true
  },
  xframe: 'SAMEORIGIN',
  p3p: 'ABCDEF', /*[DEPRECATED]*/
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssProtection: true,
  nosniff: true
}));
```

Setting any value to `false` will disable it. Alternately, you can opt into methods one by one:

```js
app.use(aegis.csrf());
app.use(aegis.csp({ angular: true }));
app.use(aegis.xframe('SAMEORIGIN'));
app.use(aegis.p3p('ABCDEF')); /*[DEPRECATED]*/
app.use(aegis.hsts({ maxAge: 31536000 }));
app.use(aegis.xssProtection(true));
app.use(aegis.nosniff());
```

__Please note that you must use [express-session](https://github.com/expressjs/session), [cookie-session](https://github.com/expressjs/cookie-session), their express 3.x alternatives, or other session object management in order to use Fi Aegis.__


## API


### Cross-Site Request Forgery

![Status](https://img.shields.io/badge/status-active-green.svg)

Enables [Cross Site Request Forgery](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_\(CSRF\)) (CSRF) headers.

If enabled, the CSRF token must be in the payload when modifying data or you will receive a *403 Forbidden*. To send the token you'll need to echo back the `_csrf` value you received from the previous request.

Furthermore, parsers must be registered before **Fi Aegis**.


#### Usage:

```js
aegis.csrf(options);
```


#### Options:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `key` | `String` | No | `_csrf` | The name of the CSRF token added to the model. |
| `secret` | `String` | No | `_csrfSecret` | The key to place on the session object which maps to the server side token. |
| `impl` | `Function` | No | See [lib/token.js](https://github.com/FinalDevStudio/fi-aegis/blob/master/lib/token.js). | Custom implementation to generate a token.
| `angular` | `Boolean` | No | `false` | Shorthand setting to set **Fi Aegis** up to use the default settings for CSRF validation according to the [AngularJS docs](https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection). |
| `cookie` | `String|Object` | Yes (if `angular` is `false`) | None | If set, a cookie with the name you provide will be set with the CSRF token. |
| `cookie.name` | `String` | Yes (if `angular` is `false` and cookie is `Object`) | None | The name you provide will be set as the cookie with the CSRF token. |
| `cookie.options` | `Object` | No | None | A valid Express cookie options object. See [Express response cookies](http://expressjs.com/en/4x/api.html#res.cookie) for more information. |
| `header` | `String` | Yes (if `angular` is `false`) | None | If set, the header name you provide will be set with the CSRF token. |

---


### Content Security Policy

![Status](https://img.shields.io/badge/status-active-green.svg)

Enables [Content Security Policy](https://www.owasp.org/index.php/Content_Security_Policy) (CSP) headers.

See the [MDN CSP usage](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Using_Content_Security_Policy) page for more information on available policy options.

See the [AngularJS ngCsp directive docs](https://docs.angularjs.org/api/ng/directive/ngCsp) to learn the how to implement it when using CSP on your server.


#### Usage:

```js
aegis.csp(options);
```


#### Options:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `policy` | `String`, `Object` or `Array` | Yes | Empty | Object definition of policy. Valid policies examples include. |
| `reportOnly` | `Boolean` | No | `false` | Enable report only mode. |
| `reportUri` | `String` | No | Empty | URI where to send the report data |


#### Example Options:

Everything but images can only come from own domain (excluding subdomains):

```js
{
  policy: {
    'default-src': '\'self\'',
    'img-src': '*'
  }
}
```

Pre-existing site that uses too much inline code to fix but wants to ensure resources are loaded only over https and disable plugins:

```js
{
  policy: 'default-src https: \'unsafe-inline\'; object-src \'none\''
}
```

Load images only through HTTPS and from self domain and upgrade all insecure requests:

```js
{
  policy: [
    {
      'img-src': '\'self\' https:'
    },

    'upgrade-insecure-requests'
  ]
}
```

See [MDN CSP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) for more examples and directives.

---


### X-Frame-Options

![Status](https://img.shields.io/badge/status-active-green.svg)

Enables X-FRAME-OPTIONS headers to help prevent [Clickjacking](https://www.owasp.org/index.php/Clickjacking).

See [MDN X-Frame-Options docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) to learn more about it.


#### Usage:

```js
aegis.xframe(value);
```


#### Value:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `value` | `String` | Yes | None | The value for the header, e.g. `DENY`, `SAMEORIGIN` or `ALLOW-FROM uri`. |

---


### HTTP Strict Transport Security

![Status](https://img.shields.io/badge/status-active-green.svg)

Enables [HTTP Strict Transport Security](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security) for the host domain. The preload flag is required for HSTS domain submissions to [Chrome's HSTS preload list](https://hstspreload.appspot.com).

See [MDN Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) for more information.


#### Usage:

```js
aegis.hsts(options);
```


#### Options:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `maxAge` | `Number` | Yes | None | Number of seconds HSTS is in effect. |
| `includeSubDomains` | `Boolean` | No | None | Applies HSTS to all subdomains of the host. |
| `preload` | `Boolean` | No | None | Adds preload flag. This is not part of the specification. See [this](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#Preloading_Strict_Transport_Security) for more details about why. |

---


### X-Content-Type-Options

![Status](https://img.shields.io/badge/status-active-green.svg)

Enables [X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options) header to prevent MIME-sniffing a response away from the declared content-type.


#### Usage:

```js
aegis.nosniff();
```

---


### X-XSS-Protection

![Status](https://img.shields.io/badge/status-obsolete-lightgrey.svg)

Enables [X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection) headers to help prevent cross site scripting (XSS) attacks in older IE browsers (IE8).


#### Usage:

```js
aegis.xssProtection(options);
```


#### Options:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enabled` | `Boolean` | No | `1` | If the header is enabled or not. |
| `mode` | `String` | No | `block` | Mode to set on the header. |

---

### Platform for Privacy Preferences (P3P) Project

![Status](https://img.shields.io/badge/status-suspended-yellow.svg)

Enables [Platform for Privacy Preferences (P3P) Project](https://www.w3.org/P3P/Overview.html) headers.

> The development of P3P has been suspended. This is still available in order to maintain compatibility. See [Platform for Privacy Preferences (P3P) Project](https://www.w3.org/P3P/Overview.html) on [W3C](https://www.w3.org) for more information.


#### Usage:

```js
aegis.p3p(value);
```


#### Value:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `value` | `String` | Yes | None | The compact privacy policy. |