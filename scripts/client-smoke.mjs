import assert from 'node:assert/strict'
let factory
let moduleId
globalThis.window = {
  __ModuleLoader__: {
    load(entry) {
      moduleId = entry.id
      factory = entry.factory
    },
  },
}
await import('../client.js')
assert.equal(moduleId, '@local/dsh-bilibili-live')
assert.equal(typeof factory, 'function')
const React = {
  createElement(tag, props, ...children) { return { tag, props, children } },
  Fragment: 'fragment',
  memo(component) { return component },
  useReducer(initial) { return [initial, () => {}] },
}
const module = factory((id) => {
  if (id === 'react') return React
  throw new Error(`unexpected require: ${id}`)
})
assert.deepEqual(module.inject, ['slots', 'locale'])
const registrations = []
let dictionaryCount = 0
const ctx = {
  effect(fn) { return fn() },
  locale: {
    register() { dictionaryCount += 1; return () => {} },
    bind() { return (key) => key },
    subscribe() { return () => {} },
  },
  slots: {
    inject(key, callback) { callback() },
    register(options, component) { registrations.push({ key: options.name, options, component }); return () => {} },
  },
}
module.apply(ctx)
assert.equal(dictionaryCount, 1)
console.log('module id:', moduleId)
console.log('registrations:', registrations.map(({ key, options, component }) => ({
  slot: key,
  id: options.id,
  mainKey: options.key,
  order: options.order,
  label: options.label ? options.label() : undefined,
  component: component.name,
})))
const sidebar = registrations.find((entry) => entry.key === 'sidebar.panellist')
const main = registrations.find((entry) => entry.key === 'main')
assert.equal(sidebar.options.id, 'bilibili-live')
assert.equal(sidebar.options.order, 11)
assert.equal(sidebar.options.label(), 'panel')
assert.equal(main.options.key, 'bilibili-live')
assert.equal(main.options.inject().t('panel'), 'panel')
console.log('client smoke OK')
