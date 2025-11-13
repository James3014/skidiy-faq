# 📝 FAQ 維護工作流程

**文件版本**: v1.0
**最後更新**: 2025-11-08
**維護者**: SkiDIY 開發團隊

---

## 📋 目錄

1. [系統架構概述](#系統架構概述)
2. [新增 FAQ 工作流](#新增-faq-工作流)
3. [修改 FAQ 工作流](#修改-faq-工作流)
4. [刪除 FAQ 工作流](#刪除-faq-工作流)
5. [FAQ 資料格式](#faq-資料格式)
6. [部署流程](#部署流程)
7. [常見問題](#常見問題)
8. [快速檢查清單](#快速檢查清單)

---

## 系統架構概述

### 🏗️ 兩層式架構

```
┌─────────────────────────────────────────┐
│  SPA 動態搜尋 (index.html)              │
│  - 使用者直接搜尋 FAQ                  │
│  - 即時語言切換（中/英/泰）            │
│  - 展示 faq_kb.phase0a.json 的所有內容         │
└─────────────────────────────────────────┘
           ↑ 讀取
           │
    ┌──────────────┐
    │ faq_kb.phase0a.json  │  ← 唯一的真實資料來源 (Single Source of Truth)
    └──────────────┘
           ↑ 讀取
           │
┌─────────────────────────────────────────┐
│  靜態頁面 (frontend/faq/*.html)         │
│  - Google SEO 爬蟲獨立訪問              │
│  - 預先渲染的 HTML（包含 Schema、hreflang）│
│  - 每個 FAQ × 3 語言 = 213 個頁面      │
└─────────────────────────────────────────┘
```

### 📌 關鍵原則

- **單一資料來源**: 所有內容都來自 `zeabur_backend/data/faq_kb.phase0a.json`
- **自動生成靜態頁面**: 修改 JSON 後執行生成腳本，自動產出 213 個 HTML
- **無手工編輯 HTML**: 靜態頁面由腳本生成，不需手工修改
- **三語言必須完整**: 新增 FAQ 時必須提供中文、英文、泰文的完整翻譯

---

## 新增 FAQ 工作流

### ✅ 完整步驟（新增 1 個 FAQ）

#### 步驟 1：決定 FAQ ID 和分類

```json
{
  "id": "faq.category.###",
  "section": "分類名稱"
}
```

**ID 格式說明**:
- `faq.` - 固定前綴
- `category` - 分類代碼（例如 itinerary, booking, gear, kids 等）
- `###` - 三位數序號（001, 002, 003...）

**現有分類**:
```
faq.itinerary    - 行程與費用
faq.booking      - 預約與變更
faq.course       - 課程相關
faq.service      - 客服與支援
faq.general      - 一般常見問題
faq.kids         - 小朋友滑雪
faq.gear         - 裝備與租賃
faq.instructor   - 教練相關
faq.grouping     - 分組與集合
faq.refund_policy - 退費機制
```

**選擇分類**: 根據 FAQ 內容選擇最相關的分類

#### 步驟 2：編寫 FAQ 資料（三語言）

```json
{
  "id": "faq.booking.067",
  "intent": "BOOKING",
  "section": "預約與變更",
  "canonical_question": "如何取消預約？",
  "canonical_question_translations": {
    "en": "How do I cancel a booking?",
    "th": "ฉันจะยกเลิกการจองได้อย่างไร"
  },
  "utterance_patterns": [
    "如何取消預約",
    "預約可以取消嗎",
    "怎樣取消訂單",
    "退訂",
    "想取消課程"
  ],
  "utterance_patterns_translations": {
    "en": [
      "How do I cancel a booking",
      "Can I cancel a booking",
      "How to cancel an order",
      "Unbook",
      "Want to cancel a class"
    ],
    "th": [
      "ฉันจะยกเลิกการจองได้อย่างไร",
      "ฉันสามารถยกเลิกการจองได้หรือไม่",
      "วิธียกเลิกการสั่งซื้อ",
      "ยกเลิกการจอง",
      "ต้องการยกเลิกชั้นเรียน"
    ]
  },
  "keywords": [
    "取消",
    "退訂",
    "預約"
  ],
  "keywords_translations": {
    "en": [
      "cancel",
      "unbook",
      "booking"
    ],
    "th": [
      "ยกเลิก",
      "ยกเลิกการจอง",
      "การจอง"
    ]
  },
  "crm_tags": [
    "#預約",
    "#取消"
  ],
  "crm_tags_translations": {
    "en": [
      "#Booking",
      "#Cancellation"
    ],
    "th": [
      "#การจอง",
      "#การยกเลิก"
    ]
  },
  "answer_template": {
    "summary": "取消預約需要至少提前 48 小時通知。",
    "text_translations": {
      "en": "Cancellations must be made at least 48 hours in advance.",
      "th": "ต้องยกเลิกอย่างน้อย 48 ชั่วโมงก่อนหน้า"
    }
  },
  "metadata": {
    "created_at": "2025-11-08",
    "last_updated": "2025-11-08",
    "author": "你的名字"
  }
}
```

#### 步驟 3：驗證 FAQ 資料完整性

**檢查清單**:
- [ ] `id` 格式正確（faq.category.###）
- [ ] `canonical_question` 完整且清晰（10-30 字）
- [ ] `utterance_patterns` 至少 3-5 個變體
- [ ] 所有 `*_translations` 都有對應的英文和泰文翻譯
- [ ] `utterance_patterns_translations.en` 個數 = `utterance_patterns` 個數
- [ ] `utterance_patterns_translations.th` 個數 = `utterance_patterns` 個數
- [ ] `keywords_translations` 個數 = `keywords` 個數
- [ ] `crm_tags_translations` 個數 = `crm_tags` 個數
- [ ] `answer_template.text_translations.en` 和 `.th` 都存在

#### 步驟 4：新增到 faq_kb.phase0a.json

```bash
# 1. 編輯 FAQ 資料檔案
vi zeabur_backend/data/faq_kb.phase0a.json

# 2. 在 items 陣列末尾新增你的 FAQ
# 3. 確保 JSON 格式正確（可用 jq 驗證）
jq . zeabur_backend/data/faq_kb.phase0a.json > /dev/null && echo "✅ JSON 格式正確"
```

#### 步驟 5：執行驗證腳本

```bash
# 1. 執行多語言完整性檢查
node scripts/validate-all.js

# 預期輸出應該包含：
# ✅ 語言檢查：
#    - 中文 (zh): 72/72 FAQ 頁面 (100%)  ← 新增了 1 個
#    - 英文 (en): 72/72 FAQ 頁面 (100%)
#    - 泰文 (th): 72/72 FAQ 頁面 (100%)
#
# ✅ 連結檢查：所有 tokens 都已定義
# ✅ 翻譯一致性：所有數量相符
```

#### 步驟 6：生成靜態頁面

```bash
# 1. 生成新的 FAQ 靜態頁面（213 → 216 個）
node scripts/generate-static-faq-pages.js

# 預期輸出：
# ✅ 生成 FAQ 靜態頁面
#    位置: frontend/faq/
#    - FAQ 詳細頁: 72 (原 71 + 新增 1)
#    - 語言版本: 中文/英文/泰文
#    總計生成: 216 個頁面

# 2. 生成分類頁面（無變化）
node scripts/generate-category-pages.js

# 3. 更新 sitemap
node scripts/gen-seo-files.js

# 預期輸出：
# ✅ 生成 sitemap.xml (91 個 URLs)
#    - FAQ 詳細頁: 72
#    - 分類頁面: 16
#    - 首頁: 1 (+ 6 個新 URL = 91)
```

#### 步驟 7：驗證生成結果

```bash
# 1. 檢查新 FAQ 頁面是否生成
ls -lh frontend/faq/faq.booking.067-*.html

# 預期：
# -rw-r--r--  faq.booking.067-zh.html (4.3 KB)
# -rw-r--r--  faq.booking.067-en.html (5.2 KB)
# -rw-r--r--  faq.booking.067-th.html (6.1 KB)

# 2. 抽查新頁面內容
head -30 frontend/faq/faq.booking.067-zh.html | grep -E "<title>|<h1>"

# 預期：
# <title>如何取消預約？ | DIY Ski FAQ</title>
# <h1>如何取消預約？</h1>

# 3. 驗證 hreflang 標籤
grep "hreflang" frontend/faq/faq.booking.067-zh.html

# 預期：
# <link rel="alternate" hreflang="zh-Hant" href="...">
# <link rel="alternate" hreflang="en" href="...">
# <link rel="alternate" hreflang="th" href="...">
```

#### 步驟 8：提交到 GitHub

```bash
# 1. 檢查變化
git status

# 預期：
# modified:   zeabur_backend/data/faq_kb.phase0a.json
# modified:   frontend/faq/ (新增 3 個 HTML 檔)
# modified:   frontend/sitemap.xml
# 等等

# 2. 新增檔案
git add zeabur_backend/data/faq_kb.phase0a.json
git add frontend/faq/
git add frontend/sitemap.xml
git add frontend/robots.txt

# 3. 提交
git commit -m "feat: add FAQ faq.booking.067 - How to cancel a booking

新增 1 個 FAQ：
- ID: faq.booking.067
- 問題：如何取消預約？
- 語言：中文、英文、泰文（完整翻譯）
- 自動生成 3 個靜態頁面 (zh/en/th)
- Sitemap 已更新（91 URLs）"

# 4. 推送
git push origin main
```

#### 步驟 9：Zeabur 自動部署

```bash
# 等待 5-10 分鐘，Zeabur 會自動部署
# 你可以驗證：
curl https://faq.diy.ski/faq/faq.booking.067-zh.html | head -20

# 預期：返回靜態頁面（含 <h1>如何取消預約？</h1>）
# 而非 SPA shell
```

---

## 修改 FAQ 工作流

### ✏️ 修改現有 FAQ（例如修改 faq.booking.064）

#### 步驟 1：定位 FAQ

```bash
# 在 zeabur_backend/data/faq_kb.phase0a.json 中找到要修改的 FAQ
grep -A 10 '"id": "faq.booking.064"' zeabur_backend/data/faq_kb.phase0a.json
```

#### 步驟 2：修改內容

修改任何欄位（以下是範例）：
- 修改 `canonical_question` → 自動更新所有語言頁面標題
- 修改 `answer_template` → 自動更新所有語言頁面內容
- 新增/刪除 `utterance_patterns` → **重要：須同時修改翻譯版本**

**注意**: 如果你修改了 `utterance_patterns` 的個數，必須確保：
```
utterance_patterns.length
= utterance_patterns_translations.en.length
= utterance_patterns_translations.th.length
```

#### 步驟 3：驗證修改

```bash
# 1. 執行驗證腳本
node scripts/validate-all.js

# 如果看到錯誤（例如翻譯數量不符）
# ❌ faq.booking.064:
#    utterance_patterns (6)
#    != utterance_patterns_translations.en (5)
# 修正後再執行一次
```

#### 步驟 4：重新生成靜態頁面

```bash
# 1. 生成新頁面（舊頁面會被覆蓋）
node scripts/generate-static-faq-pages.js

# 2. 更新 sitemap
node scripts/gen-seo-files.js

# 3. 驗證新頁面內容
head -50 frontend/faq/faq.booking.064-zh.html | grep -E "<title>|<h1>|canonical"
```

#### 步驟 5：提交修改

```bash
git add zeabur_backend/data/faq_kb.phase0a.json
git add frontend/faq/
git add frontend/sitemap.xml

git commit -m "fix: update FAQ faq.booking.064 - 修改預約取消說明

修改內容：
- 更新取消期限：48 小時 → 72 小時
- 新增退款說明
- 修改三語言版本（中/英/泰）"

git push origin main
```

---

## 刪除 FAQ 工作流

### 🗑️ 刪除已發布的 FAQ

#### 步驟 1：從 faq_kb.phase0a.json 移除

```bash
# 1. 編輯檔案
vi zeabur_backend/data/faq_kb.phase0a.json

# 2. 刪除該 FAQ 的整個 JSON 物件
# 例如移除：
# {
#   "id": "faq.booking.064",
#   ...
# }
```

#### 步驟 2：重新生成

```bash
node scripts/generate-static-faq-pages.js
node scripts/gen-seo-files.js
```

#### 步驟 3：提交刪除

```bash
git add zeabur_backend/data/faq_kb.phase0a.json
git add frontend/faq/
git add frontend/sitemap.xml

git commit -m "feat: remove FAQ faq.booking.064

原因：此 FAQ 已不再需要，內容已合併到 faq.booking.065"

git push origin main
```

---

## FAQ 資料格式

### 📐 完整欄位說明

```json
{
  "id": "faq.category.###",          // ✅ 必填：唯一識別碼
  "intent": "BOOKING",                // ✅ 必填：CRM Intent 類型
  "section": "預約與變更",             // ✅ 必填：FAQ 分類名稱

  "canonical_question": "...",        // ✅ 必填：中文原問題
  "canonical_question_translations": {
    "en": "...",                     // ✅ 必填：英文版問題
    "th": "..."                      // ✅ 必填：泰文版問題
  },

  "utterance_patterns": [            // ✅ 必填：中文問法變體（3-9 個）
    "...", "...", "..."
  ],
  "utterance_patterns_translations": {
    "en": [...],                     // ✅ 必填：英文變體（個數必須 = zh）
    "th": [...]                      // ✅ 必填：泰文變體（個數必須 = zh）
  },

  "keywords": ["...", "..."],        // ✅ 必填：中文關鍵字（3-5 個）
  "keywords_translations": {
    "en": [...],                     // ✅ 必填：英文關鍵字
    "th": [...]                      // ✅ 必填：泰文關鍵字
  },

  "crm_tags": ["#標籤1", "#標籤2"],  // ✅ 必填：CRM 分類標籤
  "crm_tags_translations": {
    "en": [...],                     // ✅ 必填：英文標籤
    "th": [...]                      // ✅ 必填：泰文標籤
  },

  "answer_template": {
    "summary": "簡短摘要...",         // ✅ 必填：中文摘要（1 句話）
    "text_translations": {
      "en": "...",                   // ✅ 必填：英文完整答案
      "th": "..."                    // ✅ 必填：泰文完整答案
    }
  },

  "metadata": {
    "created_at": "2025-11-08",      // 記錄建立時間
    "last_updated": "2025-11-08",    // 記錄修改時間
    "author": "你的名字"              // 記錄建立者
  }
}
```

### ✅ 驗證清單

每個 FAQ 都必須滿足：

```
欄位驗證：
- [ ] id: 格式 faq.{category}.{###}，且唯一
- [ ] section: 必須是現有分類或新分類
- [ ] canonical_question: 完整問句，10-30 字

翻譯驗證：
- [ ] canonical_question_translations.en 存在且自然
- [ ] canonical_question_translations.th 存在且準確
- [ ] utterance_patterns 與 .en 與 .th 個數完全相同
- [ ] keywords 與 .en 與 .th 個數完全相同
- [ ] crm_tags 與 .en 與 .th 個數完全相同
- [ ] answer_template.text_translations.en 和 .th 存在

內容驗證：
- [ ] 沒有 HTML 標籤或特殊符號
- [ ] 沒有機器翻譯痕跡（意思是翻譯要自然流暢）
- [ ] 專有名詞在所有語言中保持一致
```

---

## 部署流程

### 🚀 完整部署步驟速查表

```bash
# ===== 步驟 1: 修改 JSON ═════
vi zeabur_backend/data/faq_kb.phase0a.json
# 新增、修改或刪除 FAQ

# ===== 步驟 2: 驗證 ═════
node scripts/validate-all.js
# 確保沒有錯誤

# ===== 步驟 3: 生成靜態頁面 ═════
node scripts/generate-static-faq-pages.js
node scripts/generate-category-pages.js
node scripts/gen-seo-files.js

# ===== 步驟 4: 驗證生成結果 ═════
ls frontend/faq/ | wc -l           # 應該是 213 或更多
curl https://faq.diy.ski/faq/faq.booking.067-zh.html | head -20  # 在本地驗證

# ===== 步驟 5: 提交 GitHub ═════
git add zeabur_backend/data/faq_kb.phase0a.json
git add frontend/faq/
git add frontend/category/
git add frontend/sitemap.xml
git add frontend/robots.txt

git commit -m "feat/fix: 說明修改內容"
git push origin main

# ===== 步驟 6: 等待自動部署 ═════
# Zeabur 會在 5-10 分鐘內自動部署
# 你可以監控：https://faq.diy.ski/

# ===== 步驟 7: 驗證生產環境 ═════
curl https://faq.diy.ski/faq/faq.booking.067-zh.html
# 應該返回靜態頁面內容（含 <h1>...</h1>）
```

---

## 常見問題

### Q1: 我只想修改中文，不修改英文和泰文，可以嗎？

**A**: ❌ **不可以**。系統遵循「三語言完整」原則：

- 如果你修改了 `canonical_question`，必須同時更新 `canonical_question_translations.en` 和 `.th`
- 如果你新增了 `utterance_patterns`，必須同時新增英文和泰文翻譯

**原因**：靜態頁面自動生成，如果翻譯不完整會生成破損的頁面。

**解決方案**：
1. 先修改中文
2. 用翻譯工具（Google Translate）生成英文和泰文初稿
3. 由懂該語言的人審核修正
4. 再提交

### Q2: 生成靜態頁面失敗，怎麼辦？

**A**: 常見原因和解決方案：

```bash
# 錯誤 1: JSON 格式錯誤
$ node scripts/generate-static-faq-pages.js
# Error: JSON parse error at line 123

解決：
jq . zeabur_backend/data/faq_kb.phase0a.json  # 找出具體錯誤位置
# 修正 JSON 後重試

# 錯誤 2: 翻譯個數不符
$ node scripts/validate-all.js
# ❌ faq.booking.064: utterance_patterns (6) != translations.en (5)

解決：
# 確保 utterance_patterns 與其翻譯個數完全相同
# 重新執行 validate-all.js 直到通過
```

### Q3: 我不小心刪除了一個 FAQ，能恢復嗎？

**A**: ✅ **可以**，使用 Git 恢復：

```bash
# 檢查最近的提交
git log --oneline | head -5

# 回到刪除前的狀態
git show <commit-hash>:zeabur_backend/data/faq_kb.phase0a.json > temp.json

# 從 temp.json 復制被刪除的 FAQ 物件
# 貼回 faq_kb.phase0a.json
```

### Q4: 修改 FAQ 後，靜態頁面多久才會更新？

**A**: 分為兩個階段：

```
本地修改 faq_kb.phase0a.json
    ↓ (執行生成腳本，立即）
靜態頁面在 frontend/faq/ 更新
    ↓ (git commit + push)
提交到 GitHub
    ↓ (Zeabur 自動部署，5-10 分鐘)
線上 https://faq.diy.ski/ 更新
```

### Q5: Sitemap.xml 多久會自動更新？

**A**: 執行 `node scripts/gen-seo-files.js` 後立即更新。

包含的 URLs：
- FAQ 詳細頁：N 個 FAQs × 1
- 分類頁面：16 個分類 × 1
- 首頁：1 個
- **總計**：N + 16 + 1 個 URLs

### Q6: 我想修改某個 LINK token 的 URL，怎麼做？

**A**: **不要**在 faq_kb.phase0a.json 修改，改在 meta.link_tokens.json：

```bash
# 編輯連結配置
vi zeabur_backend/data/meta.link_tokens.json

# 例如修改預約系統連結：
{
  "LINK_SCHEDULE": "https://booking.diy.ski/schedule"  ← 改這裡
}

# 重新生成靜態頁面
node scripts/generate-static-faq-pages.js

# 所有 213 個頁面會自動使用新連結
```

---

## 快速檢查清單

### 新增 FAQ 時

```
準備階段：
- [ ] 決定 FAQ ID（id 格式、分類）
- [ ] 準備中文問題和答案
- [ ] 翻譯英文版本（檢查自然度）
- [ ] 翻譯泰文版本（檢查準確度）
- [ ] 準備 3-5 個中文問法變體
- [ ] 翻譯所有變體（英文 + 泰文）
- [ ] 準備 3-5 個中文關鍵字
- [ ] 翻譯關鍵字（英文 + 泰文）

編輯階段：
- [ ] 新增 FAQ JSON 到 faq_kb.phase0a.json
- [ ] 確保 JSON 格式正確
- [ ] 檢查所有翻譯個數相符

驗證階段：
- [ ] 執行 validate-all.js （無錯誤）
- [ ] 執行 generate-static-faq-pages.js
- [ ] 執行 gen-seo-files.js
- [ ] 檢查生成的 HTML 內容正確
- [ ] 檢查新 FAQ 已新增到 sitemap.xml

部署階段：
- [ ] git add 相關檔案
- [ ] git commit （清楚的提交訊息）
- [ ] git push origin main
- [ ] 等待 Zeabur 部署（5-10 分鐘）
- [ ] 驗證 https://faq.diy.ski/ 已更新
```

### 修改 FAQ 時

```
編輯階段：
- [ ] 修改 faq_kb.phase0a.json
- [ ] 如果改了問題，同時改英文和泰文
- [ ] 如果改了 utterance_patterns，同時改翻譯版本

驗證階段：
- [ ] 執行 validate-all.js （無錯誤）
- [ ] 執行 generate-static-faq-pages.js
- [ ] 執行 gen-seo-files.js

部署階段：
- [ ] git commit
- [ ] git push origin main
- [ ] 驗證線上已更新
```

---

## 參考資源

- [SEO_AI_OPTIMIZATION_PLAN.md](./SEO_AI_OPTIMIZATION_PLAN.md) - SEO 優化計劃
- [FAQ_JSON_STANDARD.md](./FAQ_JSON_STANDARD.md) - 完整格式規範
- [FAQ_STATIC_PUBLISH_GUIDE.md](./FAQ_STATIC_PUBLISH_GUIDE.md) - 靜態頁面發布指南

---

## 聯絡與支援

如遇到問題，請檢查：

1. **JSON 格式錯誤**
   ```bash
   jq . zeabur_backend/data/faq_kb.phase0a.json
   ```

2. **翻譯個數不符**
   ```bash
   node scripts/validate-all.js
   ```

3. **頁面生成失敗**
   ```bash
   node scripts/generate-static-faq-pages.js 2>&1 | head -50
   ```

4. **查看 Git 歷史**
   ```bash
   git log --oneline | head -10
   ```

---

**文件版本**: v1.0
**最後更新**: 2025-11-08
**維護者**: SkiDIY 開發團隊
