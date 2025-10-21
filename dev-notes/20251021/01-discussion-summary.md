# 討論摘要 - Reactive 機制實作

**日期**: 2025-10-21
**主題**: 為 ldview 實現響應式數據綁定機制
**分支**: `claude/implement-mvvc-mechanism-011CUKbTLJ4r7Fz5duho22PU`

## 需求起源

使用者希望在 ldview 中實現類似 MVVM 的機制，讓各個 ldselector 對應的 render handler 可以在其所使用的資料變更時自動更新。

## 討論流程

### 1. 理解現有架構 (第一階段)

- **任務**: 深入了解 ldview 的程式碼結構和設計邏輯
- **方法**: 使用 Task/Explore agent 全面分析 codebase
- **成果**: 建立完整的架構文檔，理解：
  - ldview 的核心概念（ld selector、handler、context）
  - 現有的手動更新流程
  - 節點追蹤和渲染機制
  - 已有的基礎設施（事件系統、Promise 支援等）

### 2. 命名演變

- **初始**: MVVC (誤植)
- **修正**: MVVM (Model-View-ViewModel)
- **最終**: **reactive** (響應式)
  - 理由：更直觀、符合現代前端框架慣用術語

### 3. 設計方向討論 (第二階段)

#### 關於 ctx 的彈性問題

使用者提出重要觀察：
- ctx 可能是物件、函式、甚至純量
- 不應該污染使用者的資料結構
- 需要提供開關 reactive 機制的彈性

#### 初步方案探討

討論了幾種方案：
1. **自動偵測** - 對最終得到的物件做 reactive
2. **顯式標記** - 使用特殊欄位標記（被否決，會污染資料）
3. **包裝物件** - 使用特殊建構子包裝（最終採用）

### 4. API 設計確定 (第三階段)

#### 核心決策

1. **獨立套件**: 開發獨立的 ldreactive，但先寄生在 ldview 專案中
2. **命名約定**:
   - 使用 `ldview.reactive` 而非 `ldview.reactive()`
   - 支援 `new ldreactive()` 和 `ldreactive.create()`
3. **參數設計**:
   - 雙參數形式：`ldreactive(data, options)`
   - 第一參數永遠是資料
   - 第二參數是選項物件（exclude 等）
   - 支援空建構，之後用 `set()` 設定

#### 重要設計原則

1. **不污染資料**:
   - 不顯式標記屬性
   - 改用排除名單機制

2. **遵循現有風格**:
   - LiveScript + prototype（不用 class）
   - 事件處理用固定寫法：
     ```livescript
     on: (n, cb) -> (if Array.isArray(n) => n else [n]).map (n) ~> @evthdr.[][n].push cb
     fire: (n, ...v) -> for cb in (@evthdr[n] or []) => cb.apply @, v
     ```
   - 內部變數統一存在 `@_` 下

3. **深度追蹤**:
   - 追蹤完整路徑（如 `user.profile.name`）
   - 而非只追蹤頂層（`user`）

4. **函式處理**:
   - 函式屬性自動不追蹤
   - 函式回傳值的追蹤問題留待未來處理（需要更深層的 reactive 系統）

### 5. 實作執行 (第四階段)

按照以下順序實作：
1. ✅ 建立 `src/ldreactive.ls` - 獨立 reactive 庫
2. ✅ 整合到 `src/ldview.ls`
3. ✅ 更新 build 腳本
4. ✅ 編寫測試（13 個單元測試 + 10 個整合測試）
5. ✅ 撰寫文檔（REACTIVE.md）
6. ✅ 提交並推送代碼

## 關鍵技術點

1. **ES6 Proxy**: 用於攔截屬性存取和修改
2. **WeakMap**: 快取 proxy 物件，避免重複建立
3. **依賴追蹤**: 在 handler 執行時記錄存取的屬性
4. **批次更新**: 避免頻繁觸發渲染
5. **深度代理**: 遞迴建立 nested object 的 proxy

## 成果

- **ldreactive**: 完整的獨立響應式庫（208 行 LiveScript）
- **ldview 整合**: 無縫整合，向後兼容
- **測試覆蓋**: 23 個測試全部通過
- **文檔**: 完整的中文使用手冊
- **範例**: HTML 互動式測試頁面

## 討論特色

1. **迭代式設計**: 通過多輪討論不斷優化 API
2. **尊重現有慣例**: 完全遵循 LiveScript 和專案風格
3. **實用主義**: 優先實現核心功能，複雜功能留待未來
4. **完整交付**: 包含代碼、測試、文檔、範例

## 未來可能的擴展

1. **獨立發布**: 將 ldreactive 發布為 `@loadingio/ldreactive`
2. **Computed 屬性**: 支援計算屬性
3. **Deep watch**: 深度監聽整個物件樹
4. **函式追蹤**: 追蹤函式內部的屬性存取
5. **更好的 diff**: 優化 ld-each 的更新效能
