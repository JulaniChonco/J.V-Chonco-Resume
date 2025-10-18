
// Simple tab and search logic with accessibility enhancements

(function(){
  const sections = ['about','skills','projects','experience','education','contact','search'];
  const tabs = Array.from(document.querySelectorAll('.nav .tab'));

  // Initialize: show 'about'
  function init(){
    showContent('about');
    // Keyboard navigation for tabs (Left/Right/Home/End)
    tabs.forEach((btn, idx)=>{
      btn.setAttribute('role','tab');
      btn.setAttribute('tabindex', idx === 0 ? '0' : '-1');
      btn.addEventListener('keydown', (e)=>{
        let newIndex = idx;
        if(e.key === 'ArrowRight') newIndex = (idx + 1) % tabs.length;
        if(e.key === 'ArrowLeft') newIndex = (idx - 1 + tabs.length) % tabs.length;
        if(e.key === 'Home') newIndex = 0;
        if(e.key === 'End') newIndex = tabs.length - 1;
        if(newIndex !== idx){
          e.preventDefault();
          tabs[newIndex].focus();
        }
      });
    });
  }

  // Expose globally for existing HTML onclick handlers
  window.showContent = function(tabId){
    sections.forEach(id => {
      const section = document.getElementById(id);
      if(section){
        section.style.display = (id === tabId) ? 'block' : 'none';
      }
    });

    // Toggle active state on tabs
    tabs.forEach(btn => {
      const active = btn.getAttribute('aria-controls') === tabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });

    // Update hash (optional, improves shareability)
    if(history && history.replaceState){
      history.replaceState(null, '', '#' + tabId);
    }
  };

  // Simple keyword search across text content of all sections except search itself.
  window.searchContent = function(){
    const q = document.getElementById('search-box').value.trim().toLowerCase();
    const resultsEl = document.getElementById('search-results');
    resultsEl.innerHTML = '';

    if(!q){
      resultsEl.textContent = 'Please enter a search term.';
      return;
    }

    const haystackIds = sections.filter(id => id !== 'search');
    const matches = [];

    haystackIds.forEach(id => {
      const el = document.getElementById(id);
      if(!el) return;
      const text = el.textContent.toLowerCase();
      if(text.includes(q)){
        // Extract a small snippet around the first occurrence
        const idx = text.indexOf(q);
        const start = Math.max(0, idx - 60);
        const end = Math.min(text.length, idx + q.length + 60);
        const snippet = el.textContent.slice(start, end).replace(/\s+/g,' ').trim();
        matches.push({ id, snippet });
      }
    });

    if(matches.length === 0){
      resultsEl.textContent = 'No matches found.';
      return;
    }

    const ul = document.createElement('ul');
    matches.forEach(m => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + m.id;
      a.textContent = 'Open section: ' + m.id.charAt(0).toUpperCase() + m.id.slice(1);
      a.addEventListener('click', function(ev){
        // Keep SPA feel
        ev.preventDefault();
        showContent(m.id);
      });
      const p = document.createElement('p');
      p.textContent = '… ' + m.snippet + ' …';
      li.appendChild(a);
      li.appendChild(p);
      ul.appendChild(li);
    });
    resultsEl.appendChild(ul);
  };

  // If page loaded with a hash, show that section
  window.addEventListener('DOMContentLoaded', () => {
    init();
    const hash = (location.hash || '').replace('#','');
    if(hash && sections.includes(hash)){
      showContent(hash);
    }
  });
})();
