(() => {
  const currentPath = location.pathname;
  const navigation = [
    ['/', 'मुख्यपृष्ठ'],
    ['/insights', 'विश्लेषण'],
    ['/budgets', 'अंदाजपत्रक'],
    ['/goals', 'आर्थिक उद्दिष्टे'],
    ['/settings', 'सेटिंग्ज']
  ];

  const seasonThemes = {
    1: 'blue', 2: 'blue',
    3: 'green', 4: 'green',
    5: 'amber',
    6: 'blue', 7: 'blue', 8: 'blue',
    9: 'green', 10: 'amber', 11: 'amber',
    12: 'blue'
  };

  /** सध्याचा page navigation मध्ये active आहे का ते तपासते. */
  const isActive = (href) => href === '/'
    ? currentPath === '/'
    : currentPath.startsWith(href);

  /** सध्याच्या महिन्याची ऋतू-आधारित रंगसंगती परत करते. */
  const getSeasonTheme = () => seasonThemes[new Date().getMonth() + 1] || 'blue';

  /** वापरकर्त्याची रंगसंगती लावते; निवड नसल्यास ऋतूची default theme वापरते. */
  const applyColorTheme = () => {
    const savedTheme = localStorage.getItem('colorTheme') || 'season';
    const theme = savedTheme === 'season' ? getSeasonTheme() : savedTheme;
    document.documentElement.dataset.colorTheme = theme;
    document.documentElement.dataset.themeChoice = savedTheme;
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyColorTheme();

    const oldNavigation = document.querySelector('body > nav');
    if (oldNavigation) oldNavigation.remove();

    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="nav-wrap">
        <button id="menuToggle" class="icon-btn menu-btn" type="button" aria-label="मेनू उघडा">☰</button>
        <a href="/" class="brand" aria-label="खर्चप्रबंधक मुख्यपृष्ठ">
          <span class="brand-mark">₹</span>
          <span>
            <span class="brand-title">खर्चप्रबंधक</span>
            <span class="brand-sub">वैयक्तिक आर्थिक सहाय्यक</span>
          </span>
        </a>
        <nav class="nav" aria-label="मुख्य नेव्हिगेशन">
          ${navigation.map(([href, label]) => `<a href="${href}" class="${isActive(href) ? 'active' : ''}">${label}</a>`).join('')}
        </nav>
        <div class="nav-actions">
          <button id="themeToggle" class="icon-btn" type="button" aria-label="अंधार / प्रकाश मोड बदला">☾</button>
        </div>
      </div>
      <div id="mobileMenu" class="mobile-nav">
        ${navigation.map(([href, label]) => `<a href="${href}" class="${isActive(href) ? 'active' : ''}">${label}</a>`).join('')}
      </div>`;

    document.body.prepend(header);

    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'dark') document.body.classList.add('dark');

    document.getElementById('themeToggle')?.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    document.getElementById('menuToggle')?.addEventListener('click', () => {
      document.getElementById('mobileMenu')?.classList.toggle('open');
    });

    setupThemePicker();
  });

  /** सेटिंग्ज पानावर theme picker असल्यास त्याची click events जोडते. */
  const setupThemePicker = () => {
    const picker = document.getElementById('themeOptions');
    if (!picker) return;

    const current = localStorage.getItem('colorTheme') || 'season';
    picker.querySelectorAll('[data-theme-choice]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === current));
      button.addEventListener('click', () => {
        const choice = button.dataset.themeChoice;
        localStorage.setItem('colorTheme', choice);
        applyColorTheme();
        picker.querySelectorAll('[data-theme-choice]').forEach((item) => {
          item.setAttribute('aria-pressed', String(item.dataset.themeChoice === choice));
        });
      });
    });
  };
})();
