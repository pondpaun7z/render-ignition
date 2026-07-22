import assert from 'node:assert/strict'
import test from 'node:test'
import { progressFor, renderTargetFromPath } from './wake.ts'

test('builds a safe Render hostname from one path segment', () => {
  assert.equal(renderTargetFromPath('/rails-starter-kit'), 'https://rails-starter-kit.onrender.com/')
  assert.equal(renderTargetFromPath('/My-App/'), 'https://my-app.onrender.com/')
  assert.equal(renderTargetFromPath('/two/parts'), null)
  assert.equal(renderTargetFromPath('/-invalid'), null)
})

test('wake progress moves forward without claiming completion', () => {
  assert.ok(progressFor(4, 30) > progressFor(1, 5))
  assert.equal(progressFor(999, 999), 94)
})
