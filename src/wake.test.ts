import assert from 'node:assert/strict'
import test from 'node:test'
import { machineStageFor, progressFor, renderTargetFromPath } from './wake.ts'

test('builds a safe Render URL and preserves its subpath', () => {
  assert.equal(renderTargetFromPath('/rails-starter-kit'), 'https://rails-starter-kit.onrender.com/')
  assert.equal(renderTargetFromPath('/My-App/'), 'https://my-app.onrender.com/')
  assert.equal(renderTargetFromPath('/rails-starter-kit/admin/users'), 'https://rails-starter-kit.onrender.com/admin/users')
  assert.equal(renderTargetFromPath('/-invalid'), null)
})

test('wake progress moves forward without claiming completion', () => {
  assert.ok(progressFor(4, 30) > progressFor(1, 5))
  assert.equal(progressFor(999, 999), 94)
})

test('changes machine animation stage at progress thresholds', () => {
  assert.equal(machineStageFor(34), 'ignition')
  assert.equal(machineStageFor(35), 'warmup')
  assert.equal(machineStageFor(70), 'full-load')
  assert.equal(machineStageFor(100), 'online')
  assert.equal(machineStageFor(0, true), 'showcase')
  assert.equal(machineStageFor(0, false, true), 'locked')
})
