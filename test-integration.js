// Node.js integration test for ldview + ldreactive
// Tests basic integration without DOM (using minimal mocks)

const ldreactive = require('./dist/ldreactive.js');

console.log('=== ldview + ldreactive Integration Test ===\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (e) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${e.message}`);
    console.log(`  Stack: ${e.stack}`);
    failedTests++;
  }
}

// Test 1: ldview.reactive should be available
test('Test 1: ldview.reactive exports ldreactive', () => {
  const ldview = require('./dist/index.js');
  if (!ldview.reactive) {
    throw new Error('ldview.reactive should be defined');
  }
  if (ldview.reactive !== ldreactive) {
    throw new Error('ldview.reactive should equal ldreactive');
  }
});

// Test 2: Can create reactive context
test('Test 2: Create reactive context via ldview.reactive', () => {
  const ldview = require('./dist/index.js');
  const state = new ldview.reactive({ count: 0 });
  if (!state) throw new Error('Failed to create reactive state');
  if (state.raw().count !== 0) throw new Error('Initial count should be 0');
});

// Test 3: Reactive context auto-updates
test('Test 3: Reactive context triggers changes', (done) => {
  const state = new ldreactive({ count: 0 });

  let changeTriggered = false;
  let dependents = null;

  // Track a handler
  state.track('counter', () => {
    const data = state.get();
    const x = data.count;
  });

  // Listen for changes
  state.on('change', (key, value, oldValue, deps) => {
    changeTriggered = true;
    dependents = deps;
  });

  // Modify data
  const data = state.get();
  data.count = 5;

  if (!changeTriggered) throw new Error('Change should be triggered');
  if (!dependents || !dependents.includes('counter')) {
    throw new Error('Dependents should include counter');
  }
});

// Test 4: Multiple handlers track different properties
test('Test 4: Different handlers track different properties', () => {
  const state = new ldreactive({ count: 0, name: 'John' });

  // Track count
  const deps1 = state.track('handler1', () => {
    state.get().count;
  });

  // Track name
  const deps2 = state.track('handler2', () => {
    state.get().name;
  });

  if (!deps1.includes('count')) throw new Error('handler1 should track count');
  if (!deps2.includes('name')) throw new Error('handler2 should track name');

  // Change count should only affect handler1
  let affected = null;
  state.on('change', (key, value, oldValue, deps) => {
    affected = deps;
  });

  state.get().count = 10;

  if (!affected.includes('handler1')) throw new Error('Should affect handler1');
  if (affected.includes('handler2')) throw new Error('Should not affect handler2');
});

// Test 5: Deep property tracking
test('Test 5: Deep property tracking works', () => {
  const state = new ldreactive({
    user: {
      profile: {
        name: 'John'
      }
    }
  });

  const deps = state.track('handler', () => {
    state.get().user.profile.name;
  });

  if (!deps.includes('user.profile.name')) {
    throw new Error('Should track deep path: ' + deps.join(', '));
  }

  let triggered = false;
  state.on('change', (key) => {
    if (key === 'user.profile.name') triggered = true;
  });

  state.get().user.profile.name = 'Jane';

  if (!triggered) throw new Error('Deep property change should trigger');
});

// Test 6: Array mutations
test('Test 6: Array mutations trigger changes', () => {
  const state = new ldreactive({ items: [1, 2, 3] });

  state.track('handler', () => {
    state.get().items;
  });

  let triggered = false;
  state.on('change', () => { triggered = true; });

  state.get().items.push(4);

  if (!triggered) throw new Error('Array push should trigger change');
  if (state.get().items.length !== 4) throw new Error('Array should have 4 items');
});

// Test 7: Exclude properties
test('Test 7: Excluded properties don\'t trigger changes', () => {
  const state = new ldreactive(
    { count: 0, helpers: { fn: () => {} } },
    { exclude: ['helpers'] }
  );

  let triggered = false;
  state.on('change', () => { triggered = true; });

  // This should not trigger
  state.get().helpers.newProp = 'test';

  if (triggered) throw new Error('Excluded property should not trigger');

  // This should trigger
  state.get().count = 10;

  if (!triggered) throw new Error('Normal property should trigger');
});

// Test 8: Batch updates
test('Test 8: Batch updates work correctly', () => {
  const state = new ldreactive({ count: 0, name: 'John' });

  state.track('handler1', () => state.get().count);
  state.track('handler2', () => state.get().name);

  let singleChanges = 0;
  let batchChanges = 0;

  state.on('change', () => { singleChanges++; });
  state.on('batch-change', (changes, deps) => {
    batchChanges++;
    if (deps.length !== 2) throw new Error('Should have 2 affected handlers');
  });

  state.batch(() => {
    state.get().count = 5;
    state.get().name = 'Jane';
  });

  if (singleChanges !== 0) throw new Error('Should not fire individual changes in batch');
  if (batchChanges !== 1) throw new Error('Should fire one batch-change');
});

// Test 9: Untrack handlers
test('Test 9: Untrack removes dependencies', () => {
  const state = new ldreactive({ count: 0 });

  state.track('handler1', () => state.get().count);
  state.untrack('handler1');

  let deps = null;
  state.on('change', (key, value, oldValue, dependents) => {
    deps = dependents;
  });

  state.get().count = 5;

  if (deps && deps.includes('handler1')) {
    throw new Error('Untracked handler should not be in dependents');
  }
});

// Test 10: Factory pattern
test('Test 10: Factory pattern creates reactive instance', () => {
  const state = ldreactive.create({ count: 0 });
  if (!state) throw new Error('Factory should create instance');
  if (state.raw().count !== 0) throw new Error('Count should be 0');

  const state2 = ldreactive.create({ count: 5 }, { exclude: ['helpers'] });
  if (state2.raw().count !== 5) throw new Error('Count should be 5');
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Total: ${passedTests + failedTests}`);

if (failedTests > 0) {
  process.exit(1);
}

console.log('\n✓ All integration tests passed!');
