#!/bin/bash
# Simple performance benchmark without bc dependency

API_BASE="http://localhost:3000/api/v1"

echo "FAQ API Performance Benchmark - Phase 4.9"
echo "=========================================="
echo ""

echo "Test 1: GET /api/v1/faq/all (71 FAQ items)"
echo "------------------------------------------"
for i in {1..5}; do
  curl -s -w "Response time: %{time_total}s\n" -o /dev/null "$API_BASE/faq/all?lang=zh"
done
echo ""

echo "Test 2: GET /api/v1/faq/:faq_id (Single FAQ)"
echo "-------------------------------------------"
for i in {1..5}; do
  curl -s -w "Response time: %{time_total}s\n" -o /dev/null "$API_BASE/faq/faq.gear.061?language=zh"
done
echo ""

echo "Test 3: POST /api/v1/faq/search (Search query)"
echo "----------------------------------------------"
for i in {1..5}; do
  curl -s -w "Response time: %{time_total}s\n" -o /dev/null -X POST "$API_BASE/faq/search" \
    -H "Content-Type: application/json" \
    -d '{"query":"教練","limit":5,"language":"zh"}'
done
echo ""
echo "Benchmark Complete!"
