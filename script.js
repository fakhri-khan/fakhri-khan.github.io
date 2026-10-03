const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');

if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('#main-menu a').forEach((link) => {
  const linkPage = link.getAttribute('href').split('#')[0] || 'index.html';
  link.classList.toggle('is-active', linkPage === currentPage);
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
