// Sidebar module: renders FAQ sections and handles selection
// Usage:
// Sidebar.render({
//   faqs,
//   currentLanguage,
//   currentSection,
//   onSectionSelect: (section) => {},
//   getSectionLabel: (section) => section
// });
(function (global) {
  const Sidebar = {
    render({ faqs = [], currentLanguage = 'zh', currentSection = null, onSectionSelect, getSectionLabel }) {
      const sections = {};
      faqs.forEach(faq => {
        const section = (faq.metadata && faq.metadata.section) || faq.section || '其他';
        sections[section] = (sections[section] || 0) + 1;
      });

      const sidebarElement = document.getElementById('sidebarSections');
      if (!sidebarElement) {
        console.error('[Sidebar] Element #sidebarSections not found!');
        return;
      }

      const sidebarHTML = Object.entries(sections)
        .map(([name, count]) => `
          <div class="sidebar-section" data-section="${name}">
            <span>${typeof getSectionLabel === 'function' ? getSectionLabel(name, currentLanguage) : name}</span>
            <span class="section-count">(${count})</span>
          </div>
        `).join('');

      sidebarElement.innerHTML = sidebarHTML;

      const nodes = Array.from(sidebarElement.querySelectorAll('.sidebar-section'));
      nodes.forEach(el => {
        el.addEventListener('click', () => {
          nodes.forEach(e => e.classList.remove('active'));
          el.classList.add('active');
          const section = el.dataset.section;
          if (typeof onSectionSelect === 'function') {
            onSectionSelect(section);
          }
        });
      });

      if (currentSection) {
        const activeEl = sidebarElement.querySelector(`.sidebar-section[data-section="${currentSection}"]`);
        if (activeEl) {
          activeEl.classList.add('active');
        }
      }
    }
  };

  global.Sidebar = Sidebar;
})(window);
