// Run with Node.js. Translation must not change API requests or HTML controls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const base = '851bedf3189bda742433ef57bc06e75be590860b';
const original = path => execFileSync('git', ['show', `${base}:${path}`], { encoding: 'utf8' });
const read = path => fs.readFileSync(path, 'utf8');
function registry(source) {
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return JSON.parse(JSON.stringify(context.window));
}
function contract(value) {
  if (Array.isArray(value)) return value.map(contract);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !['label', 'title', 'hint', 'description', 'placeholder'].includes(key))
      .map(([key, item]) => [key, contract(item)]));
  }
  return value;
}
const path = 'src/console/assets/playground.js';
const before = registry(original(path));
const after = registry(read(path));
assert.deepEqual(contract(after), contract(before), 'API registry contract changed');
assert.equal(after.__ENDPOINTS__.length, before.__ENDPOINTS__.length);

for (const name of fs.readdirSync('src/console/templates')) {
  if (!name.endsWith('.hbs')) continue;
  const path = `src/console/templates/${name}`;
  const source = read(path);
  const attrs = text => [...text.matchAll(/\b([\w-]+)="([^"]*)"/g)]
    .filter(([, key]) => !['aria-label', 'placeholder', 'lang'].includes(key))
    .map(([, key, value]) => [key, value]);
  assert.deepEqual(attrs(source), attrs(original(path)), `${name}: control attributes changed`);
  const expressions = text => text.match(/{{{?[\s\S]*?}}}?/g) || [];
  assert.deepEqual(expressions(source), expressions(original(path)), `${name}: template bindings changed`);
  for (const [, script] of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    new vm.Script(script.replace(/{{{(?:sid_json|provider_json)}}}/g, '"qa"'));
  }
}
console.log(`OK: ${after.__ENDPOINTS__.length} operações com rotas, métodos, campos, valores e vínculos preservados; JavaScript válido.`);
require('./check-connection-status.cjs');
