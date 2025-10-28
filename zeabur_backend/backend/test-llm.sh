#!/bin/bash

# LLM API 測試腳本
# 用途: 快速測試所有 LLM 端點

BASE_URL="http://localhost:3000/api/v1"

echo "🧪 LLM API 測試腳本"
echo "===================="
echo ""

# 顏色代碼
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 測試 1: 檢查 Provider 狀態
echo -e "${BLUE}📋 測試 1: 檢查 Provider 狀態${NC}"
echo "GET $BASE_URL/llm/providers"
echo ""

RESPONSE=$(curl -s "$BASE_URL/llm/providers")
AVAILABLE=$(echo "$RESPONSE" | jq -r '.data.availableProviders[]' 2>/dev/null)

if [ -z "$AVAILABLE" ]; then
    echo -e "${RED}✗ 沒有可用的 Provider${NC}"
    echo "建議: 請至少配置一個 LLM Provider (參考 LLM_SETUP_GUIDE.md)"
    echo ""
    echo "快速開始 - 使用 Ollama (免費):"
    echo "  brew install ollama"
    echo "  ollama serve"
    echo "  ollama pull llama2"
else
    echo -e "${GREEN}✓ 可用 Provider:${NC}"
    echo "$AVAILABLE" | while read -r provider; do
        echo "  • $provider"
    done
fi

echo ""
echo "---"
echo ""

# 測試 2: 測試所有 Provider
echo -e "${BLUE}🔬 測試 2: 測試所有 Provider${NC}"
echo "GET $BASE_URL/llm/test"
echo ""

curl -s "$BASE_URL/llm/test" | jq '.'

echo ""
echo "---"
echo ""

# 測試 3: FAQ 建議 (不需要 LLM)
echo -e "${BLUE}💡 測試 3: FAQ 建議 (不需要 LLM)${NC}"
echo "POST $BASE_URL/llm/suggestions"
echo ""

QUERY="小朋友滑雪"
echo "查詢: \"$QUERY\""
echo ""

SUGGESTIONS=$(curl -s -X POST "$BASE_URL/llm/suggestions" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"$QUERY\",\"limit\":3}")

SUCCESS=$(echo "$SUGGESTIONS" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ FAQ 建議成功${NC}"
    echo ""
    echo "$SUGGESTIONS" | jq -r '.data.suggestions[] | "  • [\(.confidence * 100 | floor)%] \(.question)"'
    echo ""
    RECOMMENDATION=$(echo "$SUGGESTIONS" | jq -r '.data.evaluation.recommendation')
    echo "建議策略: $RECOMMENDATION"
else
    echo -e "${RED}✗ FAQ 建議失敗${NC}"
    echo "$SUGGESTIONS" | jq '.'
fi

echo ""
echo "---"
echo ""

# 測試 4: RAG 生成答案 (需要 LLM Provider)
echo -e "${BLUE}🤖 測試 4: RAG 生成答案 (需要至少一個 LLM Provider)${NC}"
echo "POST $BASE_URL/llm/chat"
echo ""

if [ -z "$AVAILABLE" ]; then
    echo -e "${YELLOW}⚠ 跳過: 沒有可用的 LLM Provider${NC}"
    echo "請先配置至少一個 Provider (參考上方建議)"
else
    FIRST_PROVIDER=$(echo "$AVAILABLE" | head -n 1)
    QUERY="小朋友幾歲可以開始學滑雪？"

    echo "使用 Provider: $FIRST_PROVIDER"
    echo "查詢: \"$QUERY\""
    echo ""

    echo -e "${YELLOW}⏳ 生成中... (可能需要 1-30 秒，取決於 Provider)${NC}"
    echo ""

    START_TIME=$(date +%s)

    CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/llm/chat" \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"$QUERY\",\"provider\":\"$FIRST_PROVIDER\",\"maxTokens\":512,\"temperature\":0.7}")

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    SUCCESS=$(echo "$CHAT_RESPONSE" | jq -r '.success')

    if [ "$SUCCESS" = "true" ]; then
        echo -e "${GREEN}✓ 生成成功 (耗時: ${DURATION}s)${NC}"
        echo ""

        ANSWER=$(echo "$CHAT_RESPONSE" | jq -r '.data.answer')
        echo "AI 回答:"
        echo "---"
        echo "$ANSWER"
        echo "---"
        echo ""

        PROVIDER_USED=$(echo "$CHAT_RESPONSE" | jq -r '.data.metadata.provider')
        MODEL_USED=$(echo "$CHAT_RESPONSE" | jq -r '.data.metadata.model')
        TOKENS=$(echo "$CHAT_RESPONSE" | jq -r '.data.metadata.usage.total_tokens')
        FAQ_COUNT=$(echo "$CHAT_RESPONSE" | jq -r '.data.faqMatches | length')

        echo "Metadata:"
        echo "  • Provider: $PROVIDER_USED"
        echo "  • Model: $MODEL_USED"
        echo "  • Total Tokens: $TOKENS"
        echo "  • FAQ Context Items: $FAQ_COUNT"
    else
        echo -e "${RED}✗ 生成失敗${NC}"
        echo "$CHAT_RESPONSE" | jq '.'
    fi
fi

echo ""
echo "---"
echo ""

# 測試 5: 串流生成 (需要 LLM Provider)
echo -e "${BLUE}🌊 測試 5: 串流生成 (需要至少一個 LLM Provider)${NC}"
echo "POST $BASE_URL/llm/chat/stream"
echo ""

if [ -z "$AVAILABLE" ]; then
    echo -e "${YELLOW}⚠ 跳過: 沒有可用的 LLM Provider${NC}"
else
    FIRST_PROVIDER=$(echo "$AVAILABLE" | head -n 1)
    QUERY="教練課程包含什麼？"

    echo "使用 Provider: $FIRST_PROVIDER"
    echo "查詢: \"$QUERY\""
    echo ""

    echo -e "${YELLOW}⏳ 串流生成中...${NC}"
    echo "---"

    curl -s -X POST "$BASE_URL/llm/chat/stream" \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"$QUERY\",\"provider\":\"$FIRST_PROVIDER\"}" \
      -N | while IFS= read -r line; do
        if [[ $line == data:* ]]; then
            DATA=${line#data: }
            TYPE=$(echo "$DATA" | jq -r '.type' 2>/dev/null)

            if [ "$TYPE" = "chunk" ]; then
                TEXT=$(echo "$DATA" | jq -r '.text' 2>/dev/null)
                echo -n "$TEXT"
            elif [ "$TYPE" = "done" ]; then
                echo ""
                echo "---"
                echo ""
                FAQ_COUNT=$(echo "$DATA" | jq -r '.faqMatches | length' 2>/dev/null)
                PROVIDER_USED=$(echo "$DATA" | jq -r '.metadata.provider' 2>/dev/null)
                echo -e "${GREEN}✓ 串流完成${NC}"
                echo "  • Provider: $PROVIDER_USED"
                echo "  • FAQ Context Items: $FAQ_COUNT"
            fi
        fi
    done
fi

echo ""
echo "---"
echo ""

# 總結
echo -e "${BLUE}📊 測試總結${NC}"
echo ""

if [ -z "$AVAILABLE" ]; then
    echo -e "${YELLOW}⚠ 部分功能不可用 (需要 LLM Provider)${NC}"
    echo ""
    echo "建議下一步:"
    echo "  1. 閱讀: LLM_SETUP_GUIDE.md"
    echo "  2. 選擇一個 Provider (推薦 Ollama 或 Gemini)"
    echo "  3. 配置 .env 檔案"
    echo "  4. 重新執行此測試"
else
    echo -e "${GREEN}✓ 所有基礎功能已就緒！${NC}"
    echo ""
    echo "下一步:"
    echo "  • 測試更多查詢"
    echo "  • 開發前端 UI"
    echo "  • 部署到生產環境"
fi

echo ""
echo "===================="
echo "測試完成！"
