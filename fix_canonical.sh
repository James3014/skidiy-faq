#!/bin/bash

# 批量修正 FAQ 頁面的 canonical 標籤
# 讓每個頁面的 canonical 指向自己的完整檔名

cd frontend/faq

for file in *.html; do
    if [[ $file =~ ^(faq\.[^-]+\.[0-9]+)-([a-z]{2})\.html$ ]]; then
        faq_id="${BASH_REMATCH[1]}"
        lang="${BASH_REMATCH[2]}"
        
        echo "Processing: $file (ID: $faq_id, Lang: $lang)"
        
        # 修正 canonical 標籤
        sed -i '' "s|<link rel=\"canonical\" href=\"https://faq.diy.ski/faq/${faq_id}\" />|<link rel=\"canonical\" href=\"https://faq.diy.ski/faq/${file}\" />|g" "$file"
        
        # 檢查是否成功
        if grep -q "canonical.*${file}" "$file"; then
            echo "✅ Fixed: $file"
        else
            echo "❌ Failed: $file"
        fi
    fi
done

echo "Done! Please check a few files manually."
