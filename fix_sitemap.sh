#!/bin/bash

# 修正 sitemap.xml 中的 FAQ URL，使其與實際檔名一致

cd frontend

echo "Backing up original sitemap..."
cp sitemap.xml sitemap.xml.backup

echo "Updating sitemap URLs to match actual filenames..."

# 修正主要 URL（從 faq.xxx.xxx 改為 faq.xxx.xxx-zh.html）
sed -i '' 's|<loc>https://faq.diy.ski/faq/\(faq\.[^<]*\)</loc>|<loc>https://faq.diy.ski/faq/\1-zh.html</loc>|g' sitemap.xml

# 修正 hreflang 連結
sed -i '' 's|href="https://faq.diy.ski/faq/\(faq\.[^?]*\)?lang=zh"|href="https://faq.diy.ski/faq/\1-zh.html"|g' sitemap.xml
sed -i '' 's|href="https://faq.diy.ski/faq/\(faq\.[^?]*\)?lang=en"|href="https://faq.diy.ski/faq/\1-en.html"|g' sitemap.xml
sed -i '' 's|href="https://faq.diy.ski/faq/\(faq\.[^?]*\)?lang=th"|href="https://faq.diy.ski/faq/\1-th.html"|g' sitemap.xml

echo "Checking results..."
echo "Sample updated URLs:"
grep -A 3 "faq.general.029" sitemap.xml | head -4

echo "Done! Please review the changes."
