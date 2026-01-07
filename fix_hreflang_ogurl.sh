#!/bin/bash

cd frontend/faq

for file in *.html; do
    if [[ $file =~ ^(faq\.[^-]+\.[0-9]+)-([a-z]{2})\.html$ ]]; then
        faq_id="${BASH_REMATCH[1]}"
        lang="${BASH_REMATCH[2]}"
        
        # 修正 hreflang 標籤
        sed -i '' "s|hreflang=\"zh-Hant\" href=\"https://faq.diy.ski/faq/${faq_id}\"|hreflang=\"zh-Hant\" href=\"https://faq.diy.ski/faq/${faq_id}-zh.html\"|g" "$file"
        sed -i '' "s|hreflang=\"en\" href=\"https://faq.diy.ski/faq/${faq_id}?lang=en\"|hreflang=\"en\" href=\"https://faq.diy.ski/faq/${faq_id}-en.html\"|g" "$file"
        sed -i '' "s|hreflang=\"th\" href=\"https://faq.diy.ski/faq/${faq_id}?lang=th\"|hreflang=\"th\" href=\"https://faq.diy.ski/faq/${faq_id}-th.html\"|g" "$file"
        
        # 修正 og:url
        sed -i '' "s|og:url\" content=\"https://faq.diy.ski/faq/${faq_id}\"|og:url\" content=\"https://faq.diy.ski/faq/${file}\"|g" "$file"
        sed -i '' "s|og:url\" content=\"https://faq.diy.ski/faq/${faq_id}?lang=${lang}\"|og:url\" content=\"https://faq.diy.ski/faq/${file}\"|g" "$file"
    fi
done

echo "✅ Fixed hreflang and og:url tags"
