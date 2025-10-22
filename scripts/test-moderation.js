// Test script for moderation system
const { moderateMessage } = require('../src/utils/moderationUtils');

const testCases = [
  { message: "Hello everyone!", expected: false },
  { message: "fuck you", expected: true },
  { message: "f*ck you", expected: true },
  { message: "f u c k", expected: true },
  { message: "sh1t", expected: true },
  { message: "You're a dumbass", expected: true },
  { message: "go kill yourself", expected: true },
  { message: "9ahba", expected: true },
  { message: "sharmouta", expected: true },
  { message: "🖕", expected: true },
  { message: "Nice work!", expected: false },
  { message: "What's the assignment?", expected: false },
  { message: "f0ck this sh1t", expected: true },
];

console.log("🧪 Testing Moderation System\n");

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = moderateMessage(test.message);
  const success = result.blocked === test.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: PASS`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: FAIL`);
    console.log(`   Message: "${test.message}"`);
    console.log(`   Expected blocked: ${test.expected}, Got: ${result.blocked}`);
  }
  
  if (result.blocked) {
    console.log(`   Categories: ${result.categories?.join(', ')}`);
    console.log(`   Severity: ${result.severity}`);
    console.log(`   Matched: ${result.matched_terms?.slice(0, 3).join(', ')}${result.matched_terms?.length > 3 ? '...' : ''}`);
  }
  console.log();
});

console.log(`\n📊 Results: ${passed}/${testCases.length} passed, ${failed} failed`);

if (failed === 0) {
  console.log("🎉 All tests passed!");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed!");
  process.exit(1);
}
