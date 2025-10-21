// Node.js test for ldreactive
const ldreactive = require('./dist/ldreactive.js');

console.log('=== ldreactive Test Suite ===\n');

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
    failedTests++;
  }
}

// Test 1: Basic creation
test('Test 1: Basic creation', () => {
  const r = new ldreactive({ count: 0, name: 'John' });
  if (!r) throw new Error('Failed to create ldreactive instance');
  if (r.raw().count !== 0) throw new Error('Initial count should be 0');
  if (r.raw().name !== 'John') throw new Error('Initial name should be John');
});

// Test 2: Factory pattern
test('Test 2: Factory pattern', () => {
  const r = ldreactive.create({ count: 5 });
  if (!r) throw new Error('Failed to create with factory');
  if (r.raw().count !== 5) throw new Error('Count should be 5');
});

// Test 3: Get reactive proxy
test('Test 3: Get reactive proxy', () => {
  const r = new ldreactive({ count: 0 });
  const proxy = r.get();
  if (!proxy) throw new Error('Failed to get proxy');
  if (proxy.count !== 0) throw new Error('Proxy should return count 0');
});

// Test 4: Set data
test('Test 4: Set data', () => {
  const r = new ldreactive();
  r.set({ count: 10 });
  if (r.raw().count !== 10) throw new Error('Count should be 10 after set');
});

// Test 5: Track dependencies
test('Test 5: Track dependencies', () => {
  const r = new ldreactive({ count: 0, name: 'John' });
  const deps = r.track('myHandler', () => {
    const data = r.get();
    const x = data.count;  // access count
    const y = data.name;   // access name
  });
  if (!deps.includes('count')) throw new Error('Should track count');
  if (!deps.includes('name')) throw new Error('Should track name');
});

// Test 6: Change event
test('Test 6: Change event', () => {
  const r = new ldreactive({ count: 0 });
  let changeTriggered = false;
  let changedKey = null;
  let newValue = null;

  r.on('change', (key, value, oldValue, dependents) => {
    changeTriggered = true;
    changedKey = key;
    newValue = value;
  });

  const data = r.get();
  data.count = 5;

  if (!changeTriggered) throw new Error('Change event should be triggered');
  if (changedKey !== 'count') throw new Error('Changed key should be count');
  if (newValue !== 5) throw new Error('New value should be 5');
});

// Test 7: Deep tracking
test('Test 7: Deep tracking', () => {
  const r = new ldreactive({ user: { profile: { name: 'John' } } });
  const deps = r.track('handler1', () => {
    const data = r.get();
    const x = data.user.profile.name;
  });
  if (!deps.includes('user.profile.name')) {
    throw new Error('Should track deep path: user.profile.name, got: ' + deps.join(', '));
  }
});

// Test 8: Array tracking
test('Test 8: Array tracking', () => {
  const r = new ldreactive({ items: [1, 2, 3] });
  let changeTriggered = false;

  r.on('change', () => { changeTriggered = true; });

  const data = r.get();
  data.items.push(4);

  if (!changeTriggered) throw new Error('Array mutation should trigger change');
  if (data.items.length !== 4) throw new Error('Array should have 4 items');
});

// Test 9: Watch specific property
test('Test 9: Watch specific property', () => {
  const r = new ldreactive({ count: 0 });
  let watchTriggered = false;
  let watchedValue = null;

  r.watch('count', (newVal, oldVal) => {
    watchTriggered = true;
    watchedValue = newVal;
  });

  const data = r.get();
  data.count = 10;

  if (!watchTriggered) throw new Error('Watch should be triggered');
  if (watchedValue !== 10) throw new Error('Watched value should be 10');
});

// Test 10: Batch updates
test('Test 10: Batch updates', () => {
  const r = new ldreactive({ count: 0, name: 'John' });
  let changeCount = 0;

  r.on('change', () => { changeCount++; });
  r.on('batch-change', () => { changeCount++; });

  r.batch(() => {
    const data = r.get();
    data.count = 5;
    data.name = 'Jane';
  });

  if (changeCount !== 1) {
    throw new Error('Should trigger only 1 batch-change event, got ' + changeCount);
  }
});

// Test 11: Exclude properties
test('Test 11: Exclude properties', () => {
  const r = new ldreactive(
    { count: 0, helpers: { fn: () => {} } },
    { exclude: ['helpers'] }
  );

  let changeTriggered = false;
  r.on('change', () => { changeTriggered = true; });

  const data = r.get();
  data.helpers.newProp = 'test';  // should not trigger

  if (changeTriggered) {
    throw new Error('Excluded properties should not trigger changes');
  }
});

// Test 12: Untrack handler
test('Test 12: Untrack handler', () => {
  const r = new ldreactive({ count: 0 });

  r.track('handler1', () => {
    const data = r.get();
    const x = data.count;
  });

  r.untrack('handler1');

  // After untrack, handler1 should not be in dependents
  let dependents = null;
  r.on('change', (key, value, oldValue, deps) => {
    dependents = deps;
  });

  const data = r.get();
  data.count = 5;

  if (dependents && dependents.includes('handler1')) {
    throw new Error('Handler should be untracked');
  }
});

// Test 13: Multiple handlers depending on same property
test('Test 13: Multiple handlers on same property', () => {
  const r = new ldreactive({ count: 0 });

  r.track('handler1', () => { r.get().count; });
  r.track('handler2', () => { r.get().count; });

  let dependents = null;
  r.on('change', (key, value, oldValue, deps) => {
    dependents = deps;
  });

  r.get().count = 5;

  if (!dependents || dependents.length !== 2) {
    throw new Error('Should have 2 dependents, got: ' + (dependents ? dependents.length : 0));
  }
  if (!dependents.includes('handler1')) throw new Error('Missing handler1');
  if (!dependents.includes('handler2')) throw new Error('Missing handler2');
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Total: ${passedTests + failedTests}`);

if (failedTests > 0) {
  process.exit(1);
}
