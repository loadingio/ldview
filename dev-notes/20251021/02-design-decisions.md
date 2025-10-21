# 設計決策記錄

## 1. 為什麼開發獨立的 ldreactive？

### 決策
開發獨立的 reactive 套件，但先寄生在 ldview 專案中作為 prototype。

### 理由
1. **關注點分離**: Reactive 是通用功能，不限於 ldview
2. **可測試性**: 獨立套件更容易單獨測試
3. **可重用性**: 未來可以在其他專案中使用
4. **漸進開發**: 先在 ldview 中驗證，成熟後再獨立發布

### 實作方式
```
ldview/
├── src/
│   ├── ldreactive.ls    # 獨立檔案
│   └── ldview.ls        # 整合使用
├── dist/
│   ├── ldreactive.js    # 可獨立使用
│   └── index.js         # ldview (包含整合)
```

---

## 2. API 參數設計

### 問題
如何設計建構子參數才能兼顧簡潔性和彈性？

### 討論過的方案

#### 方案 A: 混合判斷
```livescript
ldreactive = ({data, exclude, onChange} = {}) -> ...
```
問題：`data` 和 `exclude` 是常見欄位名，可能與使用者資料衝突。

#### 方案 B: 雙參數形式（採用）
```livescript
ldreactive = (data, options = {}) -> ...
```
優點：
- 第一參數永遠是資料，清晰明確
- 第二參數是選項，不會衝突
- 支援空建構 `new ldreactive()`

### 語法糖討論

**需求**: 簡化常見用法

**考慮的方案**:
```livescript
# 方案 1: 多載檢測
ldreactive.create = (arg1, arg2) ->
  if arg2? then new ldreactive {data: arg1, exclude: arg2}
  else if typeof(arg1.data) != \undefined then new ldreactive arg1
  else new ldreactive {data: arg1}

# 方案 2: 簡單檢測（未採用，太 magic）
if !options.data and !options.exclude => options = {data: options}
```

**最終決定**: 保持簡單，不做過多 magic
- 明確的雙參數形式
- 支援 factory pattern `ldreactive.create()`

---

## 3. 排除機制設計

### 問題
如何讓某些屬性不被 reactive 追蹤？

### 討論過的方案

#### 方案 A: 顯式標記（被否決）
```javascript
ctx: {
  data: { count: 0 },      // 會追蹤
  $static: { helpers: {} } // 不追蹤
}
```
問題：污染使用者的資料結構

#### 方案 B: 排除名單（採用）
```javascript
new ldreactive(
  { count: 0, helpers: {} },
  { exclude: ['helpers'] }
)
```
優點：
- 不污染資料
- 集中管理排除規則
- 清晰明確

### 實作細節
```livescript
_create-proxy: (obj, path) ->
  # 檢查是否在排除名單中
  if path.length and path[0] in @_.exclude => return obj
  # ... 建立 proxy
```

---

## 4. 依賴追蹤粒度

### 問題
追蹤 `user.profile.name` 時，應該記錄為：
- A) `user` (粗粒度)
- B) `user.profile.name` (細粒度)

### 決策：細粒度追蹤（B）

### 理由
```javascript
// 細粒度的好處
handler1: ({ctx}) => ctx.user.profile.name  // 追蹤 'user.profile.name'
handler2: ({ctx}) => ctx.user.settings.theme // 追蹤 'user.settings.theme'

// 修改 name 只觸發 handler1
ctx.user.profile.name = 'Jane'  // ✓ 只重渲染 handler1

// 修改 theme 只觸發 handler2
ctx.user.settings.theme = 'dark' // ✓ 只重渲染 handler2
```

如果用粗粒度（追蹤 `user`），兩個 handler 都會被觸發，浪費效能。

### 實作
```livescript
get: (target, key) ->
  # 建立完整路徑
  full-path = if path.length
    then "#{path.join '.'}.#{key}"
    else key.toString!

  # 記錄依賴
  if self._.tracking and self._.current-deps
    self._.current-deps.add full-path
```

---

## 5. 事件系統設計

### 決策：使用專案既有的 on/fire pattern

### 使用者要求的固定寫法
```livescript
on: (n, cb) ->
  (if Array.isArray(n) => n else [n]).map (n) ~>
    @evthdr.[][n].push cb

fire: (n, ...v) ->
  for cb in (@evthdr[n] or []) =>
    cb.apply @, v
```

### 優點
1. **一致性**: 與 ldview 使用相同模式
2. **支援多事件**: `on(['change', 'track'], callback)`
3. **簡潔**: 不需要額外的事件庫

### 事件類型設計
```livescript
# 單一變更
fire 'change', key, value, oldValue, dependents

# 批次變更
fire 'batch-change', changes, allDependents

# 依賴追蹤
fire 'track', handlerName, dependencies

# 資料設定
fire 'set', data
```

---

## 6. 內部狀態組織

### 決策：統一放在 `@_` 命名空間下

### 使用者要求
```livescript
@_.data = data
@_.exclude = exclude
@_.deps = {}
# ...
```

### 優點
1. **命名空間隔離**: 避免與原型方法衝突
2. **清晰可見**: 一眼看出是內部狀態
3. **易於調試**: `console.log(instance._)` 查看所有狀態

### 實作
```livescript
ldreactive = (data, options = {}) ->
  # ...
  @_ = {}
  @_.exclude = options.exclude or []
  @_.computed = options.computed or {}
  @_.deps = {}
  @_.tracking = null
  @_.proxy = null
  @_.proxy-cache = new WeakMap!
  # ...
```

---

## 7. Proxy 快取策略

### 問題
每次 `get()` 都建立新 Proxy 會浪費記憶體和效能。

### 決策：使用 WeakMap 快取

```livescript
@_.proxy-cache = new WeakMap!

_create-proxy: (obj, path) ->
  # 檢查快取
  if @_.proxy-cache.has obj
    return @_.proxy-cache.get obj

  # 建立新 proxy
  proxy = new Proxy obj, { ... }

  # 存入快取
  @_.proxy-cache.set obj, proxy
  proxy
```

### 為什麼用 WeakMap？
1. **自動 GC**: 當原始物件被回收時，proxy 也會被回收
2. **不影響垃圾回收**: 不會造成記憶體洩漏
3. **效能**: O(1) 查找

### 替代方案（Map）的問題
- 需要手動清理
- 可能造成記憶體洩漏

---

## 8. 陣列處理

### 挑戰
陣列的 mutating methods (push, pop, splice, etc.) 需要特殊處理。

### 決策：攔截陣列方法

```livescript
_create-array-proxy: (arr, path) ->
  proxy = new Proxy arr,
    get: (target, key) ->
      # 攔截陣列方法
      if key in <[push pop shift unshift splice sort reverse]>
        return (...args) ->
          result = target[key].apply target, args
          # 觸發陣列整體變更
          full-path = if path.length then path.join '.' else 'root'
          self._trigger full-path, target, target
          result
```

### 為什麼不用 Proxy 的其他 traps？
- `set` trap 只能捕獲 `arr[0] = x`
- 不能捕獲 `arr.push(x)`
- 必須在 `get` trap 中包裝方法

---

## 9. ctx 函式的處理

### 問題
ldview 的 ctx 可以是函式：
```javascript
ctx: ({node, ctxs, views}) => ({
  timestamp: Date.now(),
  data: globalData
})
```

### 討論的問題
1. 函式每次執行返回新物件，是否每次建立新 proxy？
2. 函式內部存取其他屬性，如何追蹤？

### 第一階段決策
- ctx 是函式時，每次 render 都會執行
- 返回的物件每次都建立新 proxy
- 這是可接受的（已經是現有行為）

### 未來擴展
追蹤函式內部的屬性存取需要：
1. 更深層的 reactive 系統
2. 可能需要獨立的 computed property 機制
3. 留待 Phase 2 處理

---

## 10. ldview 整合策略

### 決策：自動偵測 + 可選關閉

### 自動啟用條件
```livescript
if @_ctx and ldreactive and (@_ctx instanceof ldreactive or @_ctx._isReactiveContext)
  @_reactive = @_ctx
  @_reactive-enabled = true
```

### Per-handler 覆寫
```javascript
handler: {
  auto: ({node, ctx}) => { ... },  // 自動 reactive

  manual: {
    reactive: false,  // 明確關閉
    handler: ({node, ctx}) => { ... }
  }
}
```

### 實作位置
在 `_render()` 方法中包裝 handler 執行：
```livescript
if handler =>
  if reactive-allowed and @_reactive
    @_reactive.track n, -> handler(d)
  else
    handler(d)
```

---

## 11. 向後相容性

### 原則：零破壞性變更

### 保證
1. **不影響現有代碼**: 沒用 reactive 的 ldview 實例行為不變
2. **選擇性啟用**: 必須明確傳入 reactive instance
3. **API 不變**: 所有現有方法和選項繼續有效

### 驗證
- 現有 ldview 的所有測試應該繼續通過
- 只有明確使用 `new ldview.reactive()` 時才啟用新功能

---

## 總結

這些設計決策的共同特點：

1. **實用主義**: 優先解決核心問題
2. **漸進式**: 複雜功能留待未來
3. **尊重慣例**: 遵循專案既有風格
4. **清晰明確**: 避免 magic，明確的 API
5. **可擴展**: 為未來功能預留空間
