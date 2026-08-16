(() => {
  const current = location.pathname;
  const nav = [
    ['/', 'मुख्यपृष्ठ'], ['/insights', 'विश्लेषण'], ['/budgets', 'अंदाजपत्रक'], ['/goals', 'आर्थिक उद्दिष्टे'], ['/settings', 'सेटिंग्ज']
  ];
  const active = href => href === '/' ? current === '/' : current.startsWith(href);
  document.addEventListener('DOMContentLoaded', () => {
    const old = document.querySelector('body > nav'); if (old) old.remove();
    const header = document.createElement('header'); header.className='site-header';
    header.innerHTML = `<div class="nav-wrap"><button id="menuToggle" class="icon-btn menu-btn">☰</button><a href="/" class="brand"><span class="brand-mark">₹</span><span><span class="brand-title">खर्चप्रबंधक</span><span class="brand-sub">वैयक्तिक आर्थिक सहाय्यक</span></span></a><nav class="nav">${nav.map(([h,l])=>`<a href="${h}" class="${active(h)?'active':''}">${l}</a>`).join('')}</nav><div class="nav-actions"><button id="themeToggle" class="icon-btn" aria-label="रंगसंगती बदला">☾</button></div></div><div id="mobileMenu" class="mobile-nav">${nav.map(([h,l])=>`<a href="${h}" class="${active(h)?'active':''}">${l}</a>`).join('')}</div>`;
    document.body.prepend(header);
    const saved=localStorage.getItem('theme'); if(saved==='dark') document.body.classList.add('dark');
    document.getElementById('themeToggle')?.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light');window.dispatchEvent(new CustomEvent('themechange'));});
    document.getElementById('menuToggle')?.addEventListener('click',()=>document.getElementById('mobileMenu')?.classList.toggle('open'));
  });
})();
