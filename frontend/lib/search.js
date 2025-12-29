// Search module: coordinates FAQ search, intent detection, and rendering hook
// Depends on FAQEngine, FAQRenderer, DOMPurify, and external callbacks for rendering.
(function (global) {
  const SearchModule = {
    async performSearch({
      queryInputId = 'searchInput',
      apiBase,
      faqEngine,
      currentLanguage,
      onBeforeSearch,
      onAfterSearch,
      onDisplayIntent,
      onDisplayResults,
      onHideIntentPanel,
      resortSearchFn
    }) {
      const queryInput = document.getElementById(queryInputId);
      if (!queryInput) return;
      const query = queryInput.value.trim();
      if (!query) return;

      if (typeof onBeforeSearch === 'function') {
        onBeforeSearch();
      }

      try {
        const startTime = performance.now();
        let intentData = null;

        // optional intent detection
        try {
          const intentResponse = await fetch(`${apiBase}/intent/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, contextual: true })
          });
          if (intentResponse.ok) {
            intentData = await intentResponse.json();
          }
        } catch (err) {
          console.warn('[SearchModule] Intent API unavailable:', err);
        }

        const results = await faqEngine.search(query, { limit: 10 });
        const searchTime = Math.round(performance.now() - startTime);

        const resortResults = typeof resortSearchFn === 'function'
          ? await resortSearchFn(query, currentLanguage)
          : [];

        if (intentData?.data && typeof onDisplayIntent === 'function') {
          onDisplayIntent(intentData.data);
        }

        const faqs = results.map(r => ({ ...r.item, score: r.score }));
        if (typeof onDisplayResults === 'function') {
          onDisplayResults({ faqs, query, searchTime, resortResults });
        }

        if (typeof onAfterSearch === 'function') {
          onAfterSearch();
        }
      } catch (error) {
        console.error('[SearchModule] Search failed:', error);
        if (typeof onHideIntentPanel === 'function') {
          onHideIntentPanel();
        }
        alert('搜尋失敗: ' + error.message);
      }
    }
  };

  global.SearchModule = SearchModule;
})(window);
