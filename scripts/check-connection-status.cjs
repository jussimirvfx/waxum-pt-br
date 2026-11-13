// Execute the panel's real status renderer against read-only HTTP fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const template = fs.readFileSync(path.join(__dirname, '../src/console/templates/session.hbs'), 'utf8');
const start = template.indexOf('  const STATUS =');
const end = template.indexOf('  /* ---- webhooks ---- */', start);
assert.ok(start >= 0 && end > start);
const renderer = template.slice(start, end);

async function render(state, previousSvg = false, provider = 'web') {
  const elements = new Map();
  const calls = [];
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', textContent: '', className: '', hidden: false,
      querySelector: () => previousSvg ? {} : null,
      replaceChildren(child) { this.innerHTML = ''; this.child = child; },
    });
    return elements.get(id);
  }
  if (previousSvg) element('pair-qr').innerHTML = '<svg>expired</svg>';
  const context = vm.createContext({
    $: element, provider, api: '/api/v1/sessions/fixture', enc: 'fixture',
    document: { createElement: () => ({}) },
    call: async (method, url) => {
      calls.push([method, url]);
      assert.equal(method, 'GET');
      return { ok: true, json: state };
    },
    fetch: async url => {
      calls.push(['GET', url]);
      assert.ok(url.startsWith('/qr-svg/fixture?'));
      return { ok: true, status: 200, text: async () => '<svg>fresh-fixture</svg>' };
    },
    renderWebhooks() {},
    show: (id, visible) => { element(id).hidden = !visible; },
    setText: (id, value) => { element(id).textContent = value; },
    ago: () => '',
  });
  vm.runInContext(renderer, context);
  await context.refreshStatus();
  return { elements, calls, element };
}

(async () => {
  let result = await render({ status: 'connecting' });
  assert.equal(result.element('head-status').textContent, 'Conectando');
  assert.match(result.element('pair-qr').innerHTML, /Conectando ao WhatsApp/);
  assert.equal(result.calls.length, 1);

  result = await render({ status: 'connecting' }, true);
  assert.doesNotMatch(result.element('pair-qr').innerHTML, /expired/);

  result = await render({ status: 'waiting_for_qr' });
  assert.equal(result.element('head-status').textContent, 'Aguardando leitura do QR Code');
  assert.equal(result.element('pair-qr').innerHTML, '<svg>fresh-fixture</svg>');
  assert.equal(result.calls.length, 2);

  const untrusted = '<img src=x onerror=alert(1)>';
  result = await render({ status: 'disconnected', pair: { last_error: untrusted } });
  assert.equal(result.element('pair-qr').innerHTML, '');
  assert.equal(result.element('pair-qr').child.textContent, 'A conexão foi encerrada. Motivo: ' + untrusted);
  assert.equal(result.calls.length, 1);

  result = await render({ status: 'disconnected', pair: {} });
  assert.match(result.element('pair-qr').innerHTML, /Desconectada/);

  result = await render({ status: 'logged_in', is_logged_in: true });
  assert.equal(result.element('pair-panel').hidden, true);
  assert.equal(result.calls.length, 1);

  result = await render({ status: 'logged_in' }, false, 'cloud');
  assert.equal(result.element('head-status').textContent, 'Pronta');
  assert.equal(result.calls.length, 1);
  console.log('OK: 7 cenários do painel, sem escritas HTTP ou conexões reais.');
})().catch(error => { console.error(error); process.exitCode = 1; });
