const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { createHmac } = require('node:crypto');
const template = readFileSync(`${__dirname}/../template.tpl`, 'utf8');
const section = name => template.split(`___${name}___`)[1].split(/___[A-Z_]+___/)[0].trim();
const code = section('SANDBOXED_JS_FOR_WEB_TEMPLATE');
const click = 'mgf.1.100.200.300.1670000000000.123456789';
const oldClick = 'mgf.1.50.60.70.1660000000000.987654321';
// Local signed fixture only, not a Conversion Manager token or server contract test.
function signed(exp) {
  const payload = Buffer.from(JSON.stringify({ sid: 'local-fixture', exp })).toString('base64url');
  return payload + '.' + createHmac('sha256', 'unit-test-only').update(payload).digest('base64url');
}
function harness(fields = {}, options = {}) {
  const calls = {}, pixels = [], jar = { ...options.cookies };
  let listener;
  let random = 100000000;
  const api = {
    sendPixel: (url, success, failure) => { pixels.push(new URL(url)); (options.fail ? failure : success)(); },
    setCookie: (name, value) => { jar[name] = value; },
    getCookieValues: name => jar[name] ? [jar[name]] : [],
    getQueryParameters: () => options.click || '',
    getUrl: part => part === 'host' ? 'shop.example' : '/checkout',
    getReferrerUrl: part => part === 'host' ? 'ref.example' : '/landing',
    generateRandom: () => ++random,
    getTimestampMillis: () => options.now || 1800000000000,
    encodeUriComponent: encodeURIComponent,
    queryPermission: () => true,
    isConsentGranted: () => options.consent !== false,
    addConsentListener: (type, fn) => { listener = fn; }
  };
  const data = { trackingId: 'TRK-123', eventType: 'page_view',
    gtmOnSuccess: () => { calls.success = (calls.success || 0) + 1; },
    gtmOnFailure: () => { calls.failure = (calls.failure || 0) + 1; }, ...fields };
  const requireMock = name => {
    assert.ok(api[name], `Unexpected sandbox API: ${name}`);
    return (...args) => { (calls[name] ||= []).push(args); return api[name](...args); };
  };
  const fire = () => runInNewContext('(function(data) {' + code + '\n})(data);', { data, require: requireMock });
  fire();
  return { calls, pixels, jar, data, fire, consent: granted => listener('analytics_storage', granted) };
}
function minimal(h, marker, commerce = false) {
  assert.equal(h.pixels.length, 1);
  const url = h.pixels[0];
  assert.equal(url.origin + url.pathname, 'https://events.magfiads.com/gtm/api/v1/events');
  const keys = ['tid', 'eid', 'et', 'ts', 'cid'];
  if (marker !== undefined) keys.push('test_session');
  if (commerce) keys.push('val', 'cur');
  assert.deepEqual([...url.searchParams.keys()].sort(), keys.sort());
  assert.equal(url.searchParams.get('cid'), '');
  if (marker !== undefined) assert.equal(url.searchParams.get('test_session'), marker);
  for (const name of ['setCookie', 'getUrl', 'getReferrerUrl']) assert.equal(h.calls[name], undefined, name);
  if (marker !== undefined) {
    assert.equal(h.calls.getCookieValues, undefined);
    assert.equal(h.calls.getQueryParameters, undefined);
  }
}
test('optional field and unchanged permission scope', () => {
  const field = JSON.parse(section('TEMPLATE_PARAMETERS')).find(p => p.name === 'testSession');
  assert.equal(field.type, 'TEXT');
  assert.equal(field.valueValidators, undefined);
  assert.deepEqual(JSON.parse(section('WEB_PERMISSIONS')).map(p => p.instance.key.publicId),
    ['send_pixel', 'set_cookies', 'get_cookies', 'get_url', 'get_referrer', 'access_consent']);
});
test('matched landing preserves attribution, cookie options and commerce', () => {
  const h = harness({ eventType: 'purchase', eventValue: '19.95', eventCurrency: 'TRY' }, { click,
    cookies: { mgfcid: 'old-session', mgfcid_uid: 'existing-user', mgfcid_fcid: oldClick } });
  const p = h.pixels[0].searchParams;
  for (const [key, value] of Object.entries({ tid: 'TRK-123', et: 'purchase', cid: click,
    community_id: '100', ads_id: '200', match_id: '300', uid: 'existing-user', fcid: oldClick,
    fc_community_id: '50', fc_ads_id: '60', url: 'shop.example/checkout', ref: 'ref.example/landing',
    val: '19.95', cur: 'TRY' })) assert.equal(p.get(key), value, key);
  assert.match(p.get('sid'), /^s_/);
  assert.equal(p.has('test_session'), false);
  assert.equal(h.jar.mgfcid_cid, click);
  for (const [name, , options] of h.calls.setCookie) {
    assert.equal(options.domain, 'auto'); assert.equal(options.path, '/');
    assert.equal(options.secure, true); assert.equal(options.samesite, 'Lax');
    assert.equal(options['max-age'], (name.endsWith('_uid') || name.endsWith('_fcid') ? 365 : 30) * 86400);
  }
});
test('cookie match preserves session and does not refresh click cookie', () => {
  const h = harness({}, { cookies: { mgfcid: 'session', mgfcid_cid: click } });
  assert.equal(h.pixels[0].searchParams.get('sid'), 'session');
  assert.equal(h.pixels[0].searchParams.get('cid'), click);
  assert.deepEqual(h.calls.setCookie.map(c => c[0]), ['mgfcid_uid', 'mgfcid_fcid']);
});
test('unmatched request is minimal, even with stale visitor cookies', () => {
  for (const cookies of [{}, { mgfcid: 'old', mgfcid_uid: 'visitor', mgfcid_fcid: oldClick }]) {
    const h = harness({}, { cookies }); minimal(h);
    assert.deepEqual(h.calls.getCookieValues, [['mgfcid_cid']]);
  }
});
test('signed marker travels on every actual supported event without attribution access', () => {
  const token = signed(2000000000);
  for (const eventType of ['page_view', 'purchase', 'lead', 'sign_up', 'add_to_cart', 'custom']) {
    const h = harness({ testSession: token, eventType, customEventName: 'video_play', eventValue: '9', eventCurrency: 'USD' },
      { click, cookies: { mgfcid_cid: click, mgfcid_uid: 'visitor' } });
    minimal(h, token, true);
    assert.equal(h.pixels[0].searchParams.get('et'), eventType === 'custom' ? 'video_play' : eventType);
    assert.equal(h.pixels[0].searchParams.get('val'), '9');
    assert.equal(h.pixels[0].searchParams.get('cur'), 'USD');
    h.fire();
    assert.equal(h.pixels.length, 2);
    assert.equal(h.pixels[1].searchParams.get('test_session'), token);
    assert.notEqual(h.pixels[0].searchParams.get('eid'), h.pixels[1].searchParams.get('eid'));
  }
});
test('expired strings stay marked; unsafe or oversized values use rejecting sentinel', () => {
  for (const token of [signed(1), 'expired.signature', 'not-a-valid-signature']) minimal(harness({ testSession: token }), token);
  for (const token of [' ', 'bad&token=1', 'ü', 'a'.repeat(2049), false, 0, {}, []]) {
    minimal(harness({ testSession: token }, { click }), 'invalid_test_session');
  }
  minimal(harness({ testSession: 'a'.repeat(2048) }), 'a'.repeat(2048));
});
test('consent defers all modes and preserves marker on later firing', () => {
  for (const marker of [undefined, signed(1)]) {
    const h = harness({ testSession: marker }, { consent: false, click });
    assert.equal(h.pixels.length, 0);
    assert.equal(h.calls.getCookieValues, undefined);
    assert.equal(h.calls.setCookie, undefined);
    assert.equal(h.calls.success, 1);
    h.consent(false); assert.equal(h.pixels.length, 0);
    h.consent(true); assert.equal(h.pixels.length, 1);
    if (marker) minimal(h, marker);
    else assert.equal(h.pixels[0].searchParams.get('cid'), click);
  }
});
test('explicit field clear restores matched or unmatched normal firing', () => {
  for (const urlClick of ['', click]) {
    const h = harness({ testSession: signed(1) }, { click: urlClick });
    h.data.testSession = ''; h.fire();
    assert.equal(h.pixels.length, 2);
    assert.equal(h.pixels[1].searchParams.has('test_session'), false);
    assert.equal(h.pixels[1].searchParams.get('cid'), urlClick);
    assert.equal(h.pixels[1].searchParams.has('uid'), !!urlClick);
  }
});
test('configuration and transport failures are not reported as success', () => {
  const invalid = harness({ trackingId: '', testSession: signed(1) });
  assert.equal(invalid.pixels.length, 0); assert.equal(invalid.calls.failure, 1);
  const failed = harness({ testSession: signed(1) }, { fail: true });
  assert.equal(failed.calls.failure, 1); assert.equal(failed.calls.success, undefined);
});

// Run the inline GTM scenarios too, against the same extracted sandbox source.
const inline = section('TESTS');
for (const match of inline.matchAll(/^- name: (.+)\n  code: \|-\n([\s\S]*?)(?=^- name: |$(?![\s\S]))/gm)) {
  test('inline: ' + match[1], () => {
    const mocks = { generateRandom: () => 123456789, getTimestampMillis: () => 1800000000000,
      encodeUriComponent: encodeURIComponent };
    let runs = 0;
    const context = {
      mock: (name, fn) => { mocks[name] = fn; },
      assertThat: value => ({ contains: expected => assert.ok(value.includes(expected)),
        isFalse: () => assert.equal(value, false), isTrue: () => assert.equal(value, true),
        isEqualTo: expected => assert.equal(value, expected), isNotEqualTo: expected => assert.notEqual(value, expected) }),
      runCode: data => { runs++; runInNewContext('(function(data) {' + code + '\n})(data);',
        { data, require: name => mocks[name] || (() => { throw Error('Unmocked API ' + name); }) }); }
    };
    runInNewContext(match[2].replace(/^    /gm, ''), context);
    assert.ok(runs > 0);
  });
}
