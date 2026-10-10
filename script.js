const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');

if (menuToggle && menu) {
  const closeMenu = () => {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('pointerdown', (event) => {
    if (menu.classList.contains('is-open')
      && !menu.contains(event.target)
      && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const normalizePagePath = (value) => {
  const path = new URL(value, window.location.origin).pathname.replace(/\/+$/, '');
  return path || '/';
};
const currentPath = normalizePagePath(window.location.pathname);
document.querySelectorAll('#main-menu a').forEach((link) => {
  const linkPath = normalizePagePath(link.getAttribute('href'));
  link.classList.toggle('is-active', linkPath === currentPath);
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll('a.back-to-top, a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  });
});
