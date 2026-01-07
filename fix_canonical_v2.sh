#!/bin/bash

# 批量修正 FAQ 頁面的 canonical 標籤
# 讓每個頁面的 canonical 指向自己的完整檔名

cd frontend/faq

for file in *.html; do
    if [[ $file =~ ^(faq\.[^-]+\.[0-9]+)-([a-z]{2})\.html$ ]]; then
        faq_id="${BASH_REMATCH[1]}"
        lang="${BASH_REMATCH[2]}"
        
        echo "Processing: $file (ID: $faq_id, Lang: $lang)"
        
        # 修正 canonical 標籤 - 處理兩種格式
        # 格式1: href="https://faq.diy.ski/faq/faq.xxx.xxx" 
        # 格式2: href="https://faq.diy.ski/faq/faq.xxx.xxx?lang=xx"
        
        sed -i '' "s|<link rel=\"canonical\" href=\"https://faq.diy.ski/faq/${faq_id}\" />|<link rel=\"canonical\" href=\"https://faq.diy.ski/faq/${file}\" />|g" "$file"
        sed -i '' "s|<link rel=\"canonical\" href=\"https://faq.diy.ski/faq/${faq_id}?lang=${lang}\" />|<link rel=\"canonical\" href=\"https://faq.diy.ski/faq/${file}\" />|g" "$file"
        
        # 檢查是否成功
        if grep -q "canonical.*${file}" "$file"; then
            echo "✅ Fixed: $file"
        else
            echo "❌ Failed: $file - checking current canonical..."
            grep "canonical" "$file" || echo "No canonical found"
        fi
    fi
done

echo "Done! Checking sample results..."
echo "Sample canonical tags:"
grep -l "canonical.*\.html" *.html | head -3 | xargs grep "canonical"
