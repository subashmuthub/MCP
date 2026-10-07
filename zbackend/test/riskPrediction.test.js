import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePredictionInputs } from '../src/controllers/predictionController.js';

test('prediction input validation accepts complete real measurements', () => {
  const result = validatePredictionInputs({
    usageHours: 320,
    failureCount: 2,
    temperature: 52,
    vibration: 4.5,
    age: 6,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.values, {
    usageHours: 320,
    failureCount: 2,
    temperature: 52,
    vibration: 4.5,
    age: 6,
  });
});

test('prediction input validation rejects missing measurements', () => {
  assert.equal(validatePredictionInputs({ usageHours: 320, age: 6 }).valid, false);
});
