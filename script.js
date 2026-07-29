/**
 * Portfolio Data Renderer
 * -----------------------
 * Fetches all content from data.json and injects it into the DOM.
 * UI behaviour (scroll, nav toggle, reveal animations) stays identical.
 *
 * Architecture:
 *   1. fetch data.json → parse
 *   2. renderMeta  → <head> meta tags
 *   3. renderNav   → navbar links + logo
 *   4. renderHero  → hero section
 *   5. renderAbout → about cards + education
 *   6. renderSkills → skill category tiles
 *   7. renderProjects → project cards
 *   8. renderServices → service cards
 *   9. renderExperience → timeline items
 *  10. renderContact → contact info + social links
 *  11. initBehavior → scroll, nav toggle, reveal observer
 */

(() => {

  /* ─── Utility: safely set text content ─── */
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  /* ─── Utility: create element with optional classes & attributes ─── */
  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'innerHTML') node.innerHTML = v;
      else if (k === 'textContent') node.textContent = v;
      else node.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  };

  /* ─── Utility: escape HTML entities ─── */
  const esc = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /* ═══════════════════════════════════════
     SECTION RENDERERS
     ═══════════════════════════════════════ */

  function renderMeta(meta) {
    document.title = meta.title;
    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[name="author"]', 'content', meta.author);
    setMeta('link[rel="icon"]', 'href', meta.favicon);
    setMeta('meta[property="og:url"]', 'content', meta.ogUrl);
    setMeta('meta[property="og:title"]', 'content', meta.ogTitle);
    setMeta('meta[property="og:description"]', 'content', meta.ogDescription);
    setMeta('meta[property="og:image"]', 'content', meta.ogImage);
    setMeta('meta[name="twitter:url"]', 'content', meta.ogUrl);
    setMeta('meta[name="twitter:title"]', 'content', meta.ogTitle);
    setMeta('meta[name="twitter:description"]', 'content', meta.twitterDescription);
    setMeta('meta[name="twitter:image"]', 'content', meta.ogImage);
  }

  function renderNav(nav) {
    setText('navLogo', nav.logo);
    const linksEl = document.getElementById('navLinks');
    linksEl.innerHTML = nav.links.map(l =>
      `<li><a href="${esc(l.href)}" class="nav-link">${esc(l.label)}</a></li>`
    ).join('');

    const resumeBtn = document.getElementById('navResume');
    if (resumeBtn) resumeBtn.href = nav.resumeLink;
  }

  function renderHero(hero) {
    setText('heroBadgeText', hero.badge);
    setHTML('heroHeading',
      `${esc(hero.headingLine1)}<br><span class="accent-text">${esc(hero.headingLine2)}</span>`
    );
    setText('heroDesc', hero.description);
    setText('heroSubDesc', hero.subDescription);

    const actionsEl = document.getElementById('heroActions');
    actionsEl.innerHTML = `
      <a href="${esc(hero.ctaPrimary.href)}" class="btn btn-primary" style="padding: 15px 30px; font-size: 15px;">
        ${esc(hero.ctaPrimary.label)}</a>
      <a href="${esc(hero.ctaSecondary.href)}" class="btn btn-outline" style="padding: 15px 30px; font-size: 15px;">
        ${esc(hero.ctaSecondary.label)}</a>
    `;
  }

  function renderAbout(about) {
    setText('aboutEyebrow', about.eyebrow);
    setText('aboutHeading', about.heading);
    setText('aboutIntro', about.intro);

    // Cards
    const grid = document.getElementById('aboutGrid');
    grid.innerHTML = about.cards.map(c => `
      <div class="card-light reveal">
        <div class="card-icon"><i class="${esc(c.icon)}"></i></div>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.text)}</p>
      </div>
    `).join('');

    // Education
    const edu = about.education;
    const eduCard = document.getElementById('eduCard');
    eduCard.innerHTML = `
      <div class="edu-icon"><i class="${esc(edu.icon)}"></i></div>
      <div class="edu-body">
        <h3>${esc(edu.degree)}</h3>
        <div class="edu-inst">${esc(edu.institution)}</div>
        <div class="edu-dur">${esc(edu.duration)}</div>
        <div class="edu-note">${esc(edu.note)}</div>
      </div>
    `;
  }

  function renderSkills(skills) {
    setText('skillsEyebrow', skills.eyebrow);
    setText('skillsHeading', skills.heading);

    const grid = document.getElementById('skillsGrid');
    grid.innerHTML = skills.categories.map(cat => {
      const visibleItems = cat.items.filter(item => !item.hidden);
      if (visibleItems.length === 0) return '';
      return `
      <div class="skill-cat reveal">
        <div class="skill-cat-head">
          <h3>${esc(cat.name)}</h3><span class="skill-count">${visibleItems.length}</span>
        </div>
        <div class="tech-grid">
          ${visibleItems.map(item => `
            <div class="tech-tile">
              <img src="${esc(item.icon)}" alt="${esc(item.label)}" class="tech-icon">
              <span>${esc(item.label)}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function renderProjects(projects) {
    setText('projectsEyebrow', projects.eyebrow);
    setText('projectsHeading', projects.heading);

    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = projects.items.map(p => `
      <div class="project-card reveal">
        <div class="project-thumb"><i class="${esc(p.icon)}"></i></div>
        <div class="project-body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <div class="tag-row">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <a href="${esc(p.github)}" class="project-link"><i class="fa-brands fa-github"></i> View on GitHub →</a>
        </div>
      </div>
    `).join('');
  }

  function renderServices(services) {
    setText('servicesEyebrow', services.eyebrow);
    setText('servicesHeading', services.heading);

    const visibleItems = services.items.filter(s => !s.hidden);
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = visibleItems.map(s => `
      <div class="service-card reveal">
        <div class="service-icon"><i class="${esc(s.icon)}"></i></div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
      </div>
    `).join('');
  }

  function renderExperience(exp) {
    setText('expEyebrow', exp.eyebrow);
    setText('expHeading', exp.heading);

    const timeline = document.getElementById('expTimeline');
    timeline.innerHTML = exp.items.map(e => `
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <h3>${esc(e.title)}</h3>
        <div class="role-meta">${esc(e.company)} <span class="dur">${esc(e.duration)}</span></div>
        <ul>
          ${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  function renderContact(contact) {
    setText('contactEyebrow', contact.eyebrow);

    const headingEl = document.getElementById('contactHeadingEl');
    headingEl.innerHTML = `
      ${esc(contact.heading)} <br/><a href="mailto:${esc(contact.email)}"
        style="background: linear-gradient(135deg, var(--accent), #a0c4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; text-decoration: none; transition: opacity 0.25s ease;"
        onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${esc(contact.emailLinkText)}</a>
    `;

    const infoCard = document.getElementById('contactInfoCard');
    infoCard.innerHTML = `
      <div class="info-row">
        <div class="info-icon"><i class="fa-solid fa-envelope"></i></div>
        <div>
          <div class="info-label">Email</div>
          <div class="info-value"><a href="mailto:${esc(contact.email)}"
            style="color: inherit; text-decoration: none; transition: color 0.25s ease;"
            onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='inherit'">${esc(contact.email)}</a></div>
        </div>
      </div>
      <div class="info-row">
        <div class="info-icon"><i class="fa-solid fa-location-dot"></i></div>
        <div>
          <div class="info-label">Location</div>
          <div class="info-value">${esc(contact.location)}</div>
        </div>
      </div>
    `;

    setText('socialLabel', contact.socialLabel);

    const socialRow = document.getElementById('socialRow');
    socialRow.innerHTML = contact.socials.map(s =>
      `<a href="${esc(s.href)}" class="social-btn" aria-label="${esc(s.label)}"><i class="${esc(s.icon)}"></i></a>`
    ).join('');
  }

  /* ═══════════════════════════════════════
     UI BEHAVIOUR (unchanged from original)
     ═══════════════════════════════════════ */

  function initBehavior() {
    const navbar = document.getElementById('navbar');
    const toTop = document.getElementById('toTop');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      toTop.classList.toggle('show', window.scrollY > 600);
    });

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );

    toTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );

    // Active nav highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link');
    const setActive = () => {
      let current = 'home';
      const offset = window.scrollY + 140;
      sections.forEach(sec => {
        if (offset >= sec.offsetTop) current = sec.id;
      });
      navItems.forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === '#' + current)
      );
    };
    window.addEventListener('scroll', setActive);
    setActive();

    // Reveal on scroll (IntersectionObserver)
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ═══════════════════════════════════════
     BOOTSTRAP — fetch → render → init
     ═══════════════════════════════════════ */

  async function bootstrap() {
    try {
      const res = await fetch('data.json');
      if (!res.ok) throw new Error(`Failed to load data.json (${res.status})`);
      const data = await res.json();

      // Render every section from JSON data
      renderMeta(data.meta);
      renderNav(data.navbar);
      renderHero(data.hero);
      renderAbout(data.about);
      renderSkills(data.skills);
      renderProjects(data.projects);
      renderServices(data.services);
      renderExperience(data.experience);
      renderContact(data.contact);

      // Init UI behaviour AFTER DOM is populated
      initBehavior();

    } catch (err) {
      console.error('[Portfolio] Data load failed:', err);
    }
  }

  // Wait for DOM ready, then bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();