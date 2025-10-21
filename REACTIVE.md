# ldview Reactive Data Binding

ldview 現在支援響應式數據綁定機制，當數據變更時會自動更新對應的 DOM 元素。

## 概述

響應式系統由兩個部分組成：

1. **ldreactive** - 獨立的響應式數據綁定庫
2. **ldview 整合** - ldview 與 ldreactive 的無縫整合

## 快速開始

### 基本使用

```javascript
// 創建響應式狀態
const state = new ldview.reactive({ count: 0, name: 'John' });

// 創建 ldview 實例
const view = new ldview({
  root: document.body,
  ctx: state,  // 傳入 reactive 實例
  handler: {
    count: ({node, ctx}) => {
      node.textContent = ctx.count;  // 自動追蹤 count 依賴
    },
    name: ({node, ctx}) => {
      node.textContent = ctx.name;   // 自動追蹤 name 依賴
    }
  }
});

// 修改數據會自動觸發對應 handler 重新渲染
const data = state.get();
data.count++;  // 只有 count handler 會重新渲染
data.name = 'Jane';  // 只有 name handler 會重新渲染
```

### HTML 範例

```html
<div id="app">
  <div ld="count"></div>
  <div ld="name"></div>
  <button ld="increment">+1</button>
</div>

<script>
const state = new ldview.reactive({ count: 0, name: 'John' });

new ldview({
  root: '#app',
  ctx: state,
  handler: {
    count: ({node, ctx}) => node.textContent = `Count: ${ctx.count}`,
    name: ({node, ctx}) => node.textContent = `Name: ${ctx.name}`,
    increment: ({node, ctx}) => {
      node.onclick = () => ctx.count++;
    }
  }
});
</script>
```

## ldreactive API

### 建立響應式物件

```javascript
// 方式 1: 使用 new
const state = new ldreactive({ count: 0, name: 'John' });

// 方式 2: 使用 factory pattern
const state = ldreactive.create({ count: 0 });

// 方式 3: 使用 ldview.reactive (推薦)
const state = new ldview.reactive({ count: 0 });

// 帶選項
const state = new ldview.reactive(
  { count: 0, helpers: {...} },
  { exclude: ['helpers'] }  // helpers 不會被追蹤
);
```

### 核心方法

#### `get()` - 取得響應式 Proxy

```javascript
const state = new ldreactive({ count: 0 });
const data = state.get();
console.log(data.count);  // 會被追蹤
data.count = 5;           // 會觸發變更事件
```

#### `raw()` - 取得原始資料（不追蹤）

```javascript
const rawData = state.raw();
console.log(rawData.count);  // 不會被追蹤
rawData.count = 5;           // 不會觸發變更事件
```

#### `set(data)` - 設定/更新資料

```javascript
state.set({ count: 10, name: 'Jane' });
```

#### `track(name, fn)` - 手動追蹤依賴

```javascript
const deps = state.track('myHandler', () => {
  const data = state.get();
  console.log(data.count + data.name.length);
});
// deps = ['count', 'name']
```

#### `untrack(name)` - 停止追蹤

```javascript
state.untrack('myHandler');
```

#### `watch(key, callback)` - 監聽特定屬性

```javascript
state.watch('count', (newValue, oldValue) => {
  console.log(`count changed: ${oldValue} -> ${newValue}`);
});
```

#### `batch(fn)` - 批次更新

```javascript
state.batch(() => {
  const data = state.get();
  data.count = 5;
  data.name = 'Jane';
  data.age = 30;
});
// 只會觸發一次 batch-change 事件
```

### 事件處理

```javascript
// 監聽資料變更
state.on('change', (key, value, oldValue, dependents) => {
  console.log(`${key} changed from ${oldValue} to ${value}`);
  console.log('Affected handlers:', dependents);
});

// 監聽批次變更
state.on('batch-change', (changes, allDependents) => {
  console.log('Batch changes:', changes);
  console.log('All affected handlers:', allDependents);
});

// 監聽依賴追蹤
state.on('track', (handlerName, dependencies) => {
  console.log(`${handlerName} depends on:`, dependencies);
});

// 監聽資料設定
state.on('set', (data) => {
  console.log('Data set to:', data);
});
```

## 進階功能

### 深度追蹤

ldreactive 支援深層物件的精確追蹤：

```javascript
const state = new ldreactive({
  user: {
    profile: {
      name: 'John',
      age: 30
    },
    settings: {
      theme: 'dark'
    }
  }
});

// 只追蹤 user.profile.name
state.track('handler1', () => {
  state.get().user.profile.name;
});

// 只追蹤 user.settings.theme
state.track('handler2', () => {
  state.get().user.settings.theme;
});

// 修改 name 只會影響 handler1
state.get().user.profile.name = 'Jane';

// 修改 theme 只會影響 handler2
state.get().user.settings.theme = 'light';
```

### 陣列追蹤

陣列的變更操作會自動觸發更新：

```javascript
const state = new ldreactive({ items: [1, 2, 3] });

state.track('listHandler', () => {
  const data = state.get();
  console.log(data.items);
});

const data = state.get();
data.items.push(4);      // 觸發更新
data.items.pop();        // 觸發更新
data.items.splice(0, 1); // 觸發更新
data.items.sort();       // 觸發更新
```

### 排除特定屬性

有些屬性不需要響應式追蹤（如 helper 函數、常數等）：

```javascript
const state = new ldreactive(
  {
    count: 0,
    name: 'John',
    helpers: { /* 工具函數 */ },
    constants: { /* 常數 */ }
  },
  { exclude: ['helpers', 'constants'] }
);

// 修改 helpers 或 constants 不會觸發任何更新
state.get().helpers.newFn = () => {};  // 不觸發
state.get().count = 5;                 // 會觸發
```

## ldview 整合

### 自動渲染

當使用 reactive context 時，ldview 會自動：

1. 在 handler 執行時追蹤依賴
2. 當依賴的數據變更時，自動重新渲染對應的 handler

```javascript
const state = new ldview.reactive({ count: 0, name: 'John' });

new ldview({
  root: '#app',
  ctx: state,
  handler: {
    // 這個 handler 依賴 count
    counter: ({node, ctx}) => {
      node.textContent = `Count: ${ctx.count}`;
    },

    // 這個 handler 依賴 name
    username: ({node, ctx}) => {
      node.textContent = `Name: ${ctx.name}`;
    }
  }
});

// 只會重新渲染 counter
state.get().count++;

// 只會重新渲染 username
state.get().name = 'Jane';
```

### 停用響應式（Per-handler）

某些 handler 可能不需要自動更新：

```javascript
new ldview({
  root: '#app',
  ctx: state,
  handler: {
    // 一般的響應式 handler
    counter: ({node, ctx}) => {
      node.textContent = ctx.count;
    },

    // 停用響應式的 handler
    manual: {
      reactive: false,  // 明確停用
      handler: ({node, ctx}) => {
        // 這個 handler 不會自動更新
        // 需要手動調用 view.render('manual')
      }
    }
  }
});
```

### 與 ld-each 搭配

```javascript
const state = new ldview.reactive({
  items: [
    { id: 1, text: 'Task 1' },
    { id: 2, text: 'Task 2' }
  ]
});

new ldview({
  root: '#app',
  ctx: state,
  handler: {
    // 顯示總數
    count: ({node, ctx}) => {
      node.textContent = `Total: ${ctx.items.length}`;
    },

    // 列表項目
    item: {
      list: ({ctx}) => ctx.items,
      key: (item) => item.id,
      handler: {
        text: ({node, ctx}) => {
          node.textContent = ctx.text;
        }
      }
    }
  }
});

// 新增項目會自動更新列表和總數
state.get().items.push({ id: 3, text: 'Task 3' });
```

## 效能考量

### 批次更新

當需要同時修改多個屬性時，使用 `batch()` 來避免多次渲染：

```javascript
// 不好的做法：觸發 3 次渲染
state.get().count = 5;
state.get().name = 'Jane';
state.get().age = 30;

// 好的做法：只觸發 1 次渲染
state.batch(() => {
  const data = state.get();
  data.count = 5;
  data.name = 'Jane';
  data.age = 30;
});
```

### 排除不必要的追蹤

使用 `exclude` 選項來排除不需要追蹤的屬性：

```javascript
const state = new ldview.reactive(
  {
    // 需要追蹤的資料
    count: 0,
    name: 'John',

    // 不需要追蹤的工具函數
    utils: {
      format: (val) => val.toString(),
      validate: (val) => val > 0
    }
  },
  { exclude: ['utils'] }
);
```

### 使用 raw() 讀取不追蹤的資料

當只需要讀取資料而不需要追蹤時：

```javascript
// 會追蹤
const count = state.get().count;

// 不會追蹤（用於調試、日誌等）
const count = state.raw().count;
```

## 範例

完整範例請參考：
- `test-ldreactive.html` - ldreactive 獨立測試
- `test-integration.html` - ldview + ldreactive 整合範例

## 瀏覽器支援

ldreactive 使用 ES6 Proxy，需要以下瀏覽器版本：

- Chrome 49+
- Firefox 18+
- Safari 10+
- Edge 12+

不支援 IE11 及更早版本。

## 授權

MIT License
