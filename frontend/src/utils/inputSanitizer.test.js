/**
 * Test file for inputSanitizer
 * Run in browser console or with Jest
 */

import { validateClimatInput } from './inputSanitizer';

// Test cases
const testCases = [
  // Valid queries
  {
    input: 'I want somewhere warmer with less rain',
    expectedValid: true,
    description: 'Simple climate query',
  },
  {
    input:
      'I currently live in New Smyrna Beach, FL. I want somewhere 15 degrees cooler from June-October',
    expectedValid: true,
    description: 'Detailed climate query',
  },
  {
    input: 'Looking for a city with mild winters and cool summers',
    expectedValid: true,
    description: 'Season-based query',
  },
  {
    input: 'Where can I find less humidity and more sunshine?',
    expectedValid: true,
    description: 'Question format query',
  },

  // Invalid queries (should be blocked)
  {
    input: 'test',
    expectedValid: false,
    description: 'Too short',
  },
  {
    input: 'aaaaaaaaaa',
    expectedValid: false,
    description: 'Repeated characters (spam)',
  },
  {
    input: 'lololololol',
    expectedValid: false,
    description: 'Spam pattern',
  },
  {
    input: 'What is 2+2?',
    expectedValid: false,
    description: 'No climate keywords',
  },
  {
    input: 'Hello, how are you today?',
    expectedValid: false,
    description: 'General greeting, no climate terms',
  },

  // Edge cases that should pass
  {
    input: 'I need to find somewhere nice to live',
    expectedValid: true,
    description: 'Has "find" and "live" keywords',
  },
  {
    input: 'Where should I move for better weather?',
    expectedValid: true,
    description: 'Has "move" and "weather" keywords',
  },
];

// Run tests
console.log('🧪 Running Input Sanitizer Tests...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = validateClimatInput(testCase.input);
  const success = result.isValid === testCase.expectedValid;

  if (success) {
    console.log(`✅ Test ${index + 1}: ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Result: ${result.isValid ? 'VALID' : 'INVALID'} (${result.reason})\n`);
    passed++;
  } else {
    console.error(`❌ Test ${index + 1}: ${testCase.description}`);
    console.error(`   Input: "${testCase.input}"`);
    console.error(`   Expected: ${testCase.expectedValid ? 'VALID' : 'INVALID'}`);
    console.error(`   Got: ${result.isValid ? 'VALID' : 'INVALID'} (${result.reason})\n`);
    failed++;
  }
});

console.log(
  `\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`
);

export default testCases;

// Jest test to make CI pass
describe('Input Sanitizer', () => {
  test('validates climate input correctly', () => {
    const validInput = 'I want somewhere warmer with less rain';
    const result = validateClimatInput(validInput);
    expect(result.isValid).toBe(true);
  });

  test('rejects invalid input', () => {
    const invalidInput = 'test';
    const result = validateClimatInput(invalidInput);
    expect(result.isValid).toBe(false);
  });
});
