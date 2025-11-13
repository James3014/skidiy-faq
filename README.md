# SkiDIY FAQ System

滑雪教學常見問題系統 - 互動式搜尋、意圖偵測、多語言支援、動態分析

## 專案概述

本系統為 SkiDIY 滑雪教學服務提供完整的 FAQ 知識庫管理與搜尋功能，包含：

- **智慧搜尋**: 基於 Fuse.js 的模糊搜尋引擎
- **意圖偵測**: 自動識別用戶查詢意圖（教練、預約、課程、裝備等）
- **多語言支援**: 中文、英文、泰文三語系
- **動態分析**: 即時追蹤 FAQ 點擊數，自動生成熱門問題
- **響應式設計**: 支援桌面與移動裝置，Modal 彈窗優化手機體驗
- **品牌風格**: 與 diy.ski 官網設計一致

## 功能特色

### 1. 智慧搜尋與分類
- 全文模糊搜尋（Fuse.js）
- 分類瀏覽（課程、裝備、預約、教練等）
- 熱門問題自動推薦
- 搜尋結果信心度評分

### 2. 意圖偵測系統
- 自動識別 12 種意圖類型
- 關鍵詞高亮顯示
- Slot 參數擷取（雪場、日期、人數、板型等）
- 規則引擎 + 可選 LLM 增強

### 3. 多語言支援
- 中文（繁體）- 主要語言
- English - 英文
- ภาษาไทย - 泰文
- 動態切換無需重載頁面

### 4. 動態熱門 FAQ
- **點擊追蹤**: 自動記錄每個 FAQ 的瀏覽與點擊
- **分析 API**: 提供最近 30 天熱門 FAQ 排行
- **智慧降級**: API 失敗時使用手動標記 FAQ
- **即時更新**: 刷新頁面即可看到最新熱門問題

### 5. 移動端優化
- Modal 彈窗展示分類結果
- 減少滾動距離，提升手機操作體驗
- 響應式佈局適配各種螢幕尺寸

## 技術架構

### 前端
- **框架**: 原生 JavaScript ES6+
- **搜尋引擎**: Fuse.js 7.0+
- **安全防護**: DOMPurify 3.0+ (XSS 防護)
- **多語言**: i18n.js (自研輕量級方案)
- **樣式**: 品牌藍 #619AEC + Roboto 字體

### 後端
- **框架**: Node.js 18+ LTS + Express 4.18+
- **資料庫**: SQLite (analytics.db) + JSONL (CRM logs)
- **分析**: better-sqlite3 3.9+
- **LLM**: Anthropic Claude 3.5 Sonnet (可選)

### 部署
- **平台**: Zeabur
- **前端**: Static Site Hosting
- **後端**: Node.js Container
- **網址**: https://skidiy-faq.zeabur.app

## 目錄結構

```
zeabur/
├── frontend/                    # 前端應用
│   ├── index-intent.html        # 主頁面（搜尋 + 意圖偵測）
│   ├── lib/                     # JavaScript 庫
│   │   ├── fuse.min.js          # 模糊搜尋引擎
│   │   ├── purify.min.js        # XSS 防護
│   │   ├── i18n.js              # 多語言管理
│   │   ├── faq-engine.js        # FAQ 核心邏輯
│   │   └── config.js            # 配置管理
│   ├── assets/                  # 靜態資源
│   │   ├── logo.png             # SkiDIY Logo
│   │   ├── env.js               # 環境變數
│   │   └── i18n/                # 多語言檔案
│   │       ├── zh.json          # 中文
│   │       ├── en.json          # 英文
│   │       └── th.json          # 泰文
│
└── zeabur_backend/              # 後端 API
    ├── data/
    │   ├── analytics.db         # SQLite 分析資料庫
    │   ├── customer_inquiries.jsonl
    │   └── faq_kb.phase0a.json  # FAQ 知識庫（唯一來源）
    └── backend/
        ├── src/
        │   ├── server.js        # Express 伺服器
        │   ├── routes/          # API 路由
        │   │   ├── faq.js       # FAQ 搜尋
        │   │   ├── intent.js    # 意圖偵測
        │   │   ├── analytics.js # 分析統計 ⭐ 新增
        │   │   └── crm.js       # CRM 整合
        │   ├── services/        # 業務邏輯
        │   │   ├── intent-detector.js
        │   │   ├── slot-extractor.js
        │   │   ├── llm-manager.js
        │   │   └── analytics-service.js
        │   └── middleware/      # 中介層
        └── package.json
```

## 快速開始

### 本地開發

#### 1. 啟動前端（靜態檔案伺服器）
```bash
cd frontend
python3 -m http.server 8080
```
訪問：http://localhost:8080/index-intent.html

#### 2. 啟動後端 API
```bash
cd zeabur_backend/backend
npm install
PORT=3001 npm start
```
API 端點：http://localhost:3001

**注意**: 本地測試時需修改 `index-intent.html` 第 775 行：
```javascript
const API_BASE = 'http://localhost:3001/api/v1';
```

### 部署到 Zeabur

#### 1. 環境變數配置

在 Zeabur 控制台為後端服務設定以下環境變數：

**必要變數**:
```bash
# 管理員 JWT 密鑰（用於 FAQ 管理後台認證）
ADMIN_JWT_SECRET=your-secure-random-secret-here

# 允許開發登入（FAQ 管理後台需要）
ENABLE_DEV_LOGIN=true

# Node 環境
NODE_ENV=production

# 💾 資料庫永久儲存（重要！）
# 使用 Zeabur Volume 以保留資料，避免重啟後資料遺失
SQLITE_DB_PATH=/data/analytics.db

# 其他資料路徑
DATABASE_PATH=../data/analytics.db
JSONL_LOG_PATH=../data/customer_inquiries.jsonl
```

**可選變數**:
```bash
# LLM API Keys（若要啟用 AI 增強功能）
GEMINI_API_KEY=your-gemini-api-key
CLAUDE_API_KEY=your-claude-api-key

# FAQ Insights API 密鑰
FAQ_INSIGHTS_API_KEYS=your-insights-api-key
```

**設定步驟**:
1. 登入 [Zeabur 控制台](https://dash.zeabur.com)
2. 選擇你的專案 (skidiy-faq)
3. 點擊後端服務 (backend)
4. 進入 "Environment Variables" 標籤
5. 新增上述環境變數
6. 儲存後自動重新部署

#### 3. 配置 Volume 永久儲存（重要！）

**為什麼需要配置 Volume？**
- SQLite 資料庫部署時應固定掛載在 `/data/analytics.db`（Volume）
- Zeabur 重新部署或容器重啟後，未掛 Volume 的資料夾（如 `/tmp`）會被清空
- 配置 Volume 後，資料將永久保存在 `/data/analytics.db`

**快速配置步驟**:

1. **建立 Volume**
   - Backend 服務 → Settings → Volumes
   - 點擊 **Add Volume**
   - Mount Path: `/data`
   - Size: `1 GB`
   - 點擊 **Save**

2. **設定環境變數**（如上方已設定）
   - Key: `SQLITE_DB_PATH`
   - Value: `/data/analytics.db`

3. **重新部署** Backend 服務

4. **驗證配置**
   - 查看 Backend Logs，確認日誌顯示：
     ```
     [Analytics Service] Using database path: /data/analytics.db
     ```

**詳細配置指南**:
- 📖 [ZEABUR_CONFIG_GUIDE.md](./ZEABUR_CONFIG_GUIDE.md) - 完整配置指南（附疑難排解）
- ✅ [ZEABUR_CHECKLIST.md](./ZEABUR_CHECKLIST.md) - 配置檢查清單
- 🔍 [ZEABUR_VOLUME_SETUP.md](./ZEABUR_VOLUME_SETUP.md) - 快速設定指南

**驗證腳本**:
```bash
./scripts/verify-zeabur-volume.sh
```

#### 4. 管理頁面訪問控制（重要！）

**受保護的管理頁面**:
- `/menu.html` - 管理選單
- `/analytics.html` - 分析統計儀表板
- `/admin.html` - 系統管理面板
- `/docs.html` - 系統文檔
- `/faq-admin.html` - FAQ 管理後台
- `/resort-admin.html` - 雪場資料管理

⚠️ **安全提示**:
- 系統已配置密碼保護，訪問管理頁面時會自動彈出登入對話框
- 初始密碼請聯繫系統管理員獲取
- 請立即設定您自己的密碼

**設定/更改密碼步驟**:
```bash
# 1. 生成新密碼雜湊
node scripts/generate-admin-password.js "YourNewPassword"

# 2. 複製生成的雜湊值

# 3. 編輯 frontend/assets/admin-auth.js
#    將 PASSWORD_HASH 替換為新雜湊值

# 4. 提交並推送
git add frontend/assets/admin-auth.js
git commit -m "chore: update admin password"
git push origin main
```

**詳細說明**:
- 📖 [ADMIN_PASSWORD_SETUP.md](./ADMIN_PASSWORD_SETUP.md) - 密碼設定快速指南
- 🔒 [ADMIN_ACCESS_CONTROL.md](./ADMIN_ACCESS_CONTROL.md) - 完整訪問控制方案

#### 5. 前端配置

部署時使用生產配置（zeabur 目錄下的檔案）：
```javascript
const API_BASE = '/api/v1';  // 相對路徑，由 Zeabur 自動路由
```

## API 端點

### Analytics API（新增）

#### 1. 追蹤 FAQ 互動
```bash
POST /api/v1/analytics/track-faq-view
Content-Type: application/json

{
  "faq_id": "faq.instructor.001",
  "clicked": true,
  "language": "zh",
  "source": "search_results",
  "position": 1,
  "query_text": "如何預約教練",
  "timestamp": "2025-11-01T08:00:00.000Z"
}
```

#### 2. 取得熱門 FAQ 排行
```bash
GET /api/v1/analytics/hot-faqs?limit=5&days=30

Response:
{
  "success": true,
  "data": {
    "hot_faqs": [
      {
        "faq_id": "faq.instructor.001",
        "clicks": 45,
        "unique_sessions": 32,
        "last_clicked_at": "2025-11-01T08:00:00.000Z"
      }
    ],
    "period_days": 30,
    "total_faqs": 5,
    "by_language": [
      { "language": "zh", "clicks": 40 },
      { "language": "en", "clicks": 5 }
    ],
    "by_source": [
      { "source": "search_results", "clicks": 35 },
      { "source": "hot_list", "clicks": 10 }
    ]
  }
}
```

### FAQ Search API
```bash
POST /api/v1/faq/search
{
  "query": "教練資格",
  "limit": 10,
  "language": "zh"
}
```

### Intent Detection API
```bash
POST /api/v1/intent/analyze
{
  "query": "2月15日去野澤，2大1小需要什麼裝備",
  "use_llm": false
}
```

## 最近更新

### 2025-11-02 - UI/UX 品牌風格統一 🎨

#### 設計系統更新
1. **統一深藍色 Header**
   - 所有頁面 header 背景色統一為 #2c3e50（深藍色）
   - 移除舊有紫色漸層風格
   - 添加 SkiDIY Logo 到所有管理頁面

2. **更新的頁面**
   - `index-intent.html` - 主 FAQ 搜尋頁（已有深藍 header）
   - `faq-admin.html` - FAQ 管理後台（新增 logo + 深藍 header + 品牌藍按鈕）
   - `analytics.html` - LLM 分析儀表板（深藍 header + logo + 淺灰背景）
   - `admin.html` - 管理後台導航頁（深藍 header + logo + 新佈局）

3. **品牌色系統**
   - 主色：#2c3e50（深藍）
   - 品牌藍：#619AEC（按鈕主色）
   - 深藍：#1d6ee4（hover 狀態）
   - 背景：#f5f7fa（淺灰）

4. **響應式設計**
   - 所有頁面支援手機/平板/桌面
   - 統一的 header 高度和 padding
   - Logo 自適應大小（2.5rem）

### 2025-11-01 - 動態熱門 FAQ 功能 ⭐

#### 新增功能
1. **點擊追蹤系統**
   - 自動追蹤所有 FAQ 的瀏覽與點擊行為
   - 儲存於 SQLite `faq_views` 表
   - 非阻塞式，失敗不影響用戶體驗

2. **熱門 FAQ API**
   - `GET /api/v1/analytics/hot-faqs` - 取得熱門排行
   - `POST /api/v1/analytics/track-faq-view` - 追蹤點擊
   - 支援自訂時間範圍（預設 30 天）

3. **智慧降級機制**
   - 優先：從分析 API 取得實際點擊數據
   - 降級 1：使用手動標記的 `hot: true` FAQ
   - 降級 2：顯示前 5 個 FAQ

4. **前端整合**
   - `renderHotFAQs()` 改為 async，動態載入
   - `toggleFAQItem()` 展開時自動追蹤點擊
   - `showFAQDetail()` 點擊熱門問題時追蹤

#### 技術改進
- 移除 `faqEngine.setLanguage()` 錯誤呼叫
- API_BASE 配置分離（本地 vs 生產環境）
- 新增 `trackFAQInteraction()` 工具函數，記錄語系 / 來源 / 排序資訊

#### 檔案變更
- `frontend/index-intent.html` - 新增動態熱門 FAQ 邏輯
- `zeabur_backend/backend/src/routes/analytics.js` - 新增 2 個端點
- `frontend/assets/logo.png` - 新增品牌 Logo

### 2025-10-28 - UI 品牌風格統一

#### 樣式調整
- 品牌色：#619AEC（主色）、#1d6ee4（深藍）、#F0F0F0（淺灰背景）
- 字體：Roboto + 微軟正黑體
- Header 新增 SkiDIY Logo
- 按鈕圓角統一為 20px

#### 移動端優化
- Modal 彈窗展示分類結果
- 點擊分類後自動彈出，減少滾動
- 點擊外部或 X 按鈕關閉 Modal

### 2025-10-13 - 多語言支援

#### 語言系統
- 中文（繁體）- 主要語言
- English - 完整翻譯
- ภาษาไทย - 完整翻譯
- 動態切換，無需重載頁面

## 開發指南

### 新增 FAQ

編輯 `zeabur_backend/data/faq_kb.phase0a.json`：

```json
{
  "id": "faq.category.001",
  "category": "CATEGORY",
  "section": "分類名稱",
  "canonical_question": "問題（中文）",
  "canonical_question_en": "Question (English)",
  "canonical_question_th": "คำถาม (Thai)",
  "answer": "詳細回答（中文）",
  "answer_en": "Detailed answer (English)",
  "answer_th": "คำตอบ (Thai)",
  "keywords": ["關鍵詞1", "關鍵詞2"],
  "hot": true,  // 手動標記為熱門（可選）
  "last_updated": "2025-11-01"
}
```

### 新增意圖類型

編輯 `zeabur_backend/backend/src/services/intent-detector.js`：

```javascript
this.intentPatterns = {
  NEW_INTENT: {
    keywords: ['關鍵詞1', '關鍵詞2'],
    weight: 1.0
  }
};
```

### 資料庫架構

SQLite `analytics.db` 包含：

#### `faq_views` 表
```sql
CREATE TABLE faq_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  view_id TEXT UNIQUE,
  faq_id TEXT NOT NULL,
  query_id TEXT,
  query_text TEXT,
  position INTEGER DEFAULT 0,
  source TEXT,
  clicked INTEGER DEFAULT 0,
  time_to_click_ms INTEGER,
  language TEXT DEFAULT 'zh',
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 效能指標

- **搜尋速度**: <100ms (P95)
- **頁面載入**: <2s (3G 網路)
- **API 回應**: <200ms
- **意圖偵測**: <50ms (規則引擎), <2s (LLM)
- **Bundle 大小**: <100KB (gzipped)

## 故障排除

### FAQ 管理後台登入失敗 (405 錯誤)

**問題**: 訪問 https://skidiy-faq.zeabur.app/faq-admin.html 時，`POST /api/v1/auth/dev-login` 返回 405 錯誤。

**原因**: 後端環境變數未配置。

**解決方案**:
1. 登入 Zeabur 控制台
2. 進入後端服務的 Environment Variables
3. 新增以下兩個變數：
   ```
   ADMIN_JWT_SECRET=your-secure-random-secret
   ENABLE_DEV_LOGIN=true
   ```
4. 儲存並等待自動重新部署（約 2-3 分鐘）
5. 重新載入 faq-admin.html

### 熱門 FAQ 顯示錯誤

**問題**: 熱門 FAQ 區塊顯示「無法載入熱門問題」。

**原因**: Analytics API 未回應或資料庫未初始化。

**解決方案**:
1. 檢查 `/api/v1/analytics/hot-faqs` 端點是否正常
2. 確認 DATABASE_PATH 環境變數正確
3. 檢查 analytics.db 是否存在於 data/ 目錄

### 多語言切換無效

**問題**: 切換語言後內容沒有更新。

**原因**: 瀏覽器快取或 i18n 檔案載入失敗。

**解決方案**:
1. 強制重新整理 (Ctrl+Shift+R 或 Cmd+Shift+R)
2. 檢查開發者工具 Console 是否有載入錯誤
3. 確認 assets/i18n/ 目錄下的 JSON 檔案存在

## 授權與聯絡

- **專案**: SkiDIY FAQ System
- **所有者**: DIY.Ski 滑雪教學服務
- **部署網址**: https://skidiy-faq.zeabur.app
- **官網**: https://diy.ski
- **訂課系統**: https://booking.diy.ski

---

**最後更新**: 2025-11-02
**版本**: 1.3.0 (UI/UX Brand Unification)
