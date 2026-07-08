(() => {
  const navbar = document.getElementById('navbar');
  const toTop = document.getElementById('toTop');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 600);
  });

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => navLinks.classList.remove('open')));

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');
  const setActive = () => {
    let current = 'home';
    const offset = window.scrollY + 140;
    sections.forEach((sec) => {
      if (offset >= sec.offsetTop) current = sec.id;
    });
    navItems.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', setActive);
  setActive();

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el) => io.observe(el));

  const form = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formNote.textContent = "Thanks! This demo form doesn't send yet — wire it up to Formspree, EmailJS, or your own API.";
    formNote.style.color = 'var(--accent)';
    form.reset();
  });
})();