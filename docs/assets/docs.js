document.addEventListener('DOMContentLoaded', () => {
  // 1. Dark/Light Theme Switcher
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('medexplain_docs_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medexplain_docs_theme', theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? '☀️ מצב בהיר' : '🌙 מצב כהה';
    }
  }

  applyTheme(storedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // 2. Mobile Menu Toggle
  const menuBtn = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.docs-sidebar');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close when clicking link on mobile
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          sidebar.classList.remove('open');
        }
      });
    });
  }

  // 3. ScrollSpy
  const sections = document.querySelectorAll('.docs-section');
  const navLinks = document.querySelectorAll('.sidebar-link');

  function onScroll() {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll);
  onScroll();

  // 4. Live Search
  const searchInput = document.getElementById('doc-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        document.querySelectorAll('.biomarker-row, .docs-section').forEach((el) => {
          el.style.display = '';
        });
        return;
      }

      // Filter biomarker rows
      document.querySelectorAll('.biomarker-row').forEach((row) => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // 5. Copy Code Snippet
  document.querySelectorAll('.btn-copy-code').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pre = btn.closest('.code-block').querySelector('pre');
      if (pre) {
        await navigator.clipboard.writeText(pre.innerText);
        const orig = btn.innerText;
        btn.innerText = 'Copied! ✓';
        setTimeout(() => {
          btn.innerText = orig;
        }, 2000);
      }
    });
  });
});

