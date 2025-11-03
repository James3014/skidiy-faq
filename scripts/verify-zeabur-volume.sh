#!/bin/bash

#############################################
# Zeabur Volume 配置驗證腳本
#
# 用途：驗證 Zeabur 上的 Volume 和環境變數配置是否正確
# 使用：./verify-zeabur-volume.sh
#############################################

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
BACKEND_URL="https://faq-api-v1.zeabur.app"
EXPECTED_DB_PATH="/data/analytics.db"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Zeabur Volume 配置驗證${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

#############################################
# 步驟 1: 檢查後端健康狀態
#############################################
echo -e "${YELLOW}[1/4] 檢查後端健康狀態...${NC}"

HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/health" || echo "")

if [ -z "$HEALTH_RESPONSE" ]; then
  echo -e "${RED}❌ 無法連接到後端 API${NC}"
  echo -e "   URL: ${BACKEND_URL}/health"
  exit 1
fi

HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.data.status // empty' 2>/dev/null || echo "")

if [ "$HEALTH_STATUS" = "healthy" ]; then
  echo -e "${GREEN}✓ 後端健康檢查通過${NC}"

  # 顯示後端資訊
  UPTIME=$(echo "$HEALTH_RESPONSE" | jq -r '.data.uptime // "N/A"')
  VERSION=$(echo "$HEALTH_RESPONSE" | jq -r '.data.version // "N/A"')
  DB_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.data.database // "N/A"')

  echo -e "   版本: ${VERSION}"
  echo -e "   運行時間: ${UPTIME}"
  echo -e "   資料庫: ${DB_STATUS}"
else
  echo -e "${RED}❌ 後端健康檢查失敗${NC}"
  echo -e "   回應: ${HEALTH_RESPONSE}"
  exit 1
fi

echo ""

#############################################
# 步驟 2: 檢查資料庫路徑（需要後端日誌）
#############################################
echo -e "${YELLOW}[2/4] 檢查資料庫路徑配置...${NC}"
echo -e "${BLUE}ℹ️  需要手動檢查 Zeabur 後端日誌${NC}"
echo ""
echo -e "請執行以下步驟："
echo -e "1. 訪問 Zeabur Dashboard: ${GREEN}https://dash.zeabur.com${NC}"
echo -e "2. 選擇專案並進入 Backend 服務"
echo -e "3. 點擊 ${GREEN}Logs${NC} 標籤"
echo -e "4. 查找以下日誌訊息："
echo -e "   ${GREEN}[Analytics Service] Using database path: /data/analytics.db${NC}"
echo -e "   ${GREEN}[Analytics Service] Tables initialized${NC}"
echo ""
echo -e "預期資料庫路徑: ${GREEN}${EXPECTED_DB_PATH}${NC}"
echo -e "如果日誌顯示: ${RED}/tmp/analytics.db${NC} → 環境變數未生效"
echo ""

read -p "請確認日誌中的資料庫路徑是否為 /data/analytics.db? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${GREEN}✓ 資料庫路徑配置正確${NC}"
else
  echo -e "${RED}❌ 資料庫路徑配置錯誤${NC}"
  echo ""
  echo -e "${YELLOW}請檢查以下配置：${NC}"
  echo -e "1. Zeabur Dashboard → Backend → Settings → Environment Variables"
  echo -e "2. 確認環境變數："
  echo -e "   Key:   ${GREEN}SQLITE_DB_PATH${NC}"
  echo -e "   Value: ${GREEN}/data/analytics.db${NC}"
  echo -e "3. 重新部署 Backend 服務"
  exit 1
fi

echo ""

#############################################
# 步驟 3: 測試 API 端點
#############################################
echo -e "${YELLOW}[3/4] 測試 Analytics API 端點...${NC}"

# 測試 Section Stats API
SECTION_RESPONSE=$(curl -s -G "${BACKEND_URL}/api/v1/analytics/section-stats" --data-urlencode "days=7" || echo "")

if echo "$SECTION_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
  SECTION_TOTAL=$(echo "$SECTION_RESPONSE" | jq -r '.data.total // 0')
  echo -e "${GREEN}✓ Section Stats API 正常${NC} (總點擊數: ${SECTION_TOTAL})"
else
  echo -e "${RED}❌ Section Stats API 錯誤${NC}"
  echo -e "   回應: ${SECTION_RESPONSE}"
fi

# 測試 Resort Stats API
RESORT_RESPONSE=$(curl -s -G "${BACKEND_URL}/api/v1/analytics/resort-stats" --data-urlencode "days=7" || echo "")

if echo "$RESORT_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
  RESORT_REGIONS=$(echo "$RESORT_RESPONSE" | jq -r '.data.top_regions | length // 0')
  echo -e "${GREEN}✓ Resort Stats API 正常${NC} (熱門地區數: ${RESORT_REGIONS})"
else
  echo -e "${RED}❌ Resort Stats API 錯誤${NC}"
  echo -e "   回應: ${RESORT_RESPONSE}"
fi

echo ""

#############################################
# 步驟 4: 檢查 Volume 配置
#############################################
echo -e "${YELLOW}[4/4] 檢查 Zeabur Volume 配置...${NC}"
echo -e "${BLUE}ℹ️  需要手動檢查 Zeabur Dashboard${NC}"
echo ""
echo -e "請執行以下步驟："
echo -e "1. 訪問 Zeabur Dashboard: ${GREEN}https://dash.zeabur.com${NC}"
echo -e "2. 選擇專案並進入 Backend 服務"
echo -e "3. 點擊 ${GREEN}Settings${NC} → ${GREEN}Volumes${NC}"
echo -e "4. 確認 Volume 配置："
echo -e "   Mount Path: ${GREEN}/data${NC}"
echo -e "   Size: ${GREEN}1 GB${NC} (或更大)"
echo -e "   Status: ${GREEN}Active${NC}"
echo ""

read -p "請確認 Volume 是否已正確配置? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${GREEN}✓ Volume 配置正確${NC}"
else
  echo -e "${RED}❌ Volume 配置錯誤或未建立${NC}"
  echo ""
  echo -e "${YELLOW}請按照以下步驟配置 Volume：${NC}"
  echo -e "1. Zeabur Dashboard → Backend → Settings → Volumes"
  echo -e "2. 點擊 ${GREEN}Add Volume${NC}"
  echo -e "3. 設定："
  echo -e "   Mount Path: ${GREEN}/data${NC}"
  echo -e "   Size: ${GREEN}1${NC} (GB)"
  echo -e "4. 點擊 ${GREEN}Save${NC}"
  echo -e "5. 重新部署 Backend 服務"
  echo ""
  echo -e "詳細說明請參閱: ${BLUE}ZEABUR_CONFIG_GUIDE.md${NC}"
  exit 1
fi

echo ""

#############################################
# 最終總結
#############################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 所有檢查通過！${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}配置摘要：${NC}"
echo -e "✓ 後端健康檢查: ${GREEN}通過${NC}"
echo -e "✓ 資料庫路徑: ${GREEN}${EXPECTED_DB_PATH}${NC}"
echo -e "✓ Analytics API: ${GREEN}正常運作${NC}"
echo -e "✓ Zeabur Volume: ${GREEN}已配置${NC}"
echo ""
echo -e "${YELLOW}資料持久性測試：${NC}"
echo -e "1. 訪問前端: ${BLUE}https://faq.diy.ski/${NC}"
echo -e "2. 點擊一些 FAQ、Tags、Sections、Resorts"
echo -e "3. 訪問 Analytics: ${BLUE}https://faq.diy.ski/analytics.html${NC}"
echo -e "4. 確認數據有記錄"
echo -e "5. 在 Zeabur Dashboard 重新部署 Backend"
echo -e "6. 再次訪問 Analytics 確認數據仍然存在"
echo ""
echo -e "${GREEN}如果數據在重新部署後仍保留，表示永久儲存配置成功！${NC}"
echo ""
