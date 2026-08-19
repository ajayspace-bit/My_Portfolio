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

    // Store the resume PDF path as a data attribute on the button
    const resumeBtn = document.getElementById('navResume');
    if (resumeBtn) resumeBtn.dataset.resumeHref = nav.resumeLink;

    // Also update download link in modal header
    const dlBtn = document.querySelector('#resumeModal .pdf-action-btn[download]');
    if (dlBtn) dlBtn.href = nav.resumeLink;
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

    const imgWrapper = document.getElementById('heroImageWrapper');
    if (imgWrapper && hero.image) {
      imgWrapper.innerHTML = `
        <div class="hero-image-card">
          <img src="${esc(hero.image)}" alt="Ajay S">
        </div>
      `;
    }
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
      const isGenAI = cat.name === 'Generative AI';
      return `
      <div class="skill-cat reveal${isGenAI ? ' genai-cat' : ''}">
        <div class="skill-cat-head">
          <h3>${esc(cat.name)}${isGenAI ? ' <span style="font-size:13px;opacity:0.7">✦</span>' : ''}</h3><span class="skill-count">${visibleItems.length}</span>
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
    grid.innerHTML = projects.items.map(p => {
      let thumbHTML = '';
      if (p.image) {
        thumbHTML = `<img src="${esc(p.image)}" alt="${esc(p.title)}">`;
      } else if (p.icon) {
        thumbHTML = `<i class="${esc(p.icon)}"></i>`;
      }
      return `
        <div class="project-card reveal">
          <div class="project-thumb">${thumbHTML}</div>
          <div class="project-body">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.description)}</p>
            <div class="tag-row">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
            <a href="${esc(p.github)}" class="project-link"><i class="fa-brands fa-github"></i> View on GitHub →</a>
          </div>
        </div>
      `;
    }).join('');
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
    timeline.innerHTML = exp.items.map(e => {
      let detailsHTML = '';
      if (e.bullets && e.bullets.length > 0) {
        detailsHTML = `<ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`;
      } else if (e.description) {
        detailsHTML = `<p>${esc(e.description)}</p>`;
      }
      return `
        <div class="timeline-item reveal">
          <div class="timeline-dot"></div>
          <h3>${esc(e.title)}</h3>
          <div class="role-meta">${esc(e.company)} <span class="dur">${esc(e.duration)}</span></div>
          ${detailsHTML}
        </div>
      `;
    }).join('');
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

    // Reveal on scroll (IntersectionObserver) with per-sibling stagger
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Compute stagger based on sibling index (skip if CSS already handles it)
          const siblings = Array.from(entry.target.parentElement?.children || []);
          const idx = siblings.indexOf(entry.target);
          // Only apply JS stagger if no CSS delay already set (CSS handles grid children)
          const cssDel = parseFloat(getComputedStyle(entry.target).transitionDelay) || 0;
          if (cssDel === 0 && idx > 0) {
            entry.target.style.transitionDelay = `${idx * 0.07}s`;
          }
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => io.observe(el));

    // Click Highlight Animation for Experience Items
    const expTimeline = document.getElementById('expTimeline');
    if (expTimeline) {
      expTimeline.addEventListener('click', (e) => {
        const item = e.target.closest('.timeline-item');
        if (item) {
          // Clear any existing timeout for this item if clicked again quickly
          if (item.highlightTimeout) {
            clearTimeout(item.highlightTimeout);
          }
          
          item.classList.remove('highlight-active');
          // Trigger a reflow to restart the animation if clicked again
          void item.offsetWidth;
          item.classList.add('highlight-active');
          
          // Set a timeout to return to normal after 1.2s (matching the CSS animation duration)
          item.highlightTimeout = setTimeout(() => {
            item.classList.remove('highlight-active');
            item.highlightTimeout = null;
          }, 1200);
        }
      });
    }

    // PDF Resume Modal Behavior
    const navResume = document.getElementById('navResume');
    const resumeModal = document.getElementById('resumeModal');
    const closeResumeModal = document.getElementById('closeResumeModal');
    const resumeIframe = document.getElementById('resumeIframe');

    if (navResume && resumeModal && closeResumeModal && resumeIframe) {
      const openModal = () => {
        // Get the PDF path from the data attribute set during renderNav
        const pdfSrc = navResume.dataset.resumeHref || 'ajay.pdf';
        if (!resumeIframe.src || resumeIframe.src === window.location.href) {
          resumeIframe.src = pdfSrc;
        }
        resumeModal.classList.add('show');
        resumeModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
      };

      const closeModal = () => {
        resumeModal.classList.remove('show');
        resumeModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      };

      // navResume is a <button>, so no need to preventDefault for navigation
      navResume.addEventListener('click', openModal);

      closeResumeModal.addEventListener('click', closeModal);

      resumeModal.addEventListener('click', (e) => {
        if (e.target === resumeModal) {
          closeModal();
        }
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resumeModal.classList.contains('show')) {
          closeModal();
        }
      });
    }
  }

  /* ═══════════════════════════════════════
     BOOTSTRAP — fetch → render → init
     ═══════════════════════════════════════ */

  async function bootstrap() {
    try {
      const res = await fetch('data.json?v=4');
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

/* ============================================================
   BACKGROUND ANIMATION ENGINE
   — Matches the existing dark #0A0E1A + accent #5B9BD5 palette
   ============================================================ */

(function () {

  /* Skip if user prefers reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ─── Colour constants (match :root vars) ─── */
  const ACCENT     = '91,155,213';  /* --accent rgb */
  const DEEP       = '10,14,26';    /* --bg-dark  rgb */

  /* ════════════════════════════════════════════
     1. GLOBAL PARTICLE CANVAS  (#bgCanvas)
        Tiny floating dots that drift across the
        entire page — subtle, never distracting.
     ════════════════════════════════════════════ */
  function initBgCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];

    const PARTICLE_COUNT = 80;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    Math.random() * 1.4 + 0.3,          /* radius 0.3 – 1.7 px */
        vx:   (Math.random() - 0.5) * 0.22,        /* drift speed x */
        vy:   (Math.random() - 0.5) * 0.18,        /* drift speed y */
        a:    Math.random() * 0.55 + 0.1,          /* opacity 0.1 – 0.65 */
        pA:   Math.random() * Math.PI * 2,         /* pulse phase offset */
        pS:   Math.random() * 0.005 + 0.003,       /* pulse speed */
        glowing: Math.random() < 0.18              /* 18% are bright glowing dots */
      };
    }

    function reset() {
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* Draw faint background grid glow pulse */
      const gridAlpha = 0.03 + 0.02 * Math.sin(Date.now() * 0.0004);
      ctx.strokeStyle = `rgba(${ACCENT},${gridAlpha})`;
      ctx.lineWidth = 0.5;
      const STEP = 56;
      for (let x = 0; x < W; x += STEP) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += STEP) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      /* Draw & update each particle */
      const now = Date.now();
      particles.forEach(p => {
        p.pA += p.pS;
        const pulsed = p.a * (0.75 + 0.25 * Math.sin(p.pA));

        if (p.glowing) {
          /* Soft glow halo around bright dots */
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          grad.addColorStop(0, `rgba(${ACCENT},${pulsed * 0.9})`);
          grad.addColorStop(1, `rgba(${ACCENT},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${ACCENT},${pulsed})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        /* Move */
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap around edges */
        if (p.x < -4)  p.x = W + 4;
        if (p.x > W+4) p.x = -4;
        if (p.y < -4)  p.y = H + 4;
        if (p.y > H+4) p.y = -4;
      });

      /* Draw faint connection lines between nearby particles */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(${ACCENT},${0.07 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); reset(); });
    resize();
    reset();
    draw();
  }

  /* ════════════════════════════════════════════
     2. HERO AURORA CANVAS  (#heroCanvas)
        Large soft glowing orbs that slowly drift
        behind the hero text — premium aurora look.
     ════════════════════════════════════════════ */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = rect.width  || window.innerWidth;
      H = canvas.height = rect.height || window.innerHeight;
    }

    /* Accent RGB values for dual-tone aurora */
    const ACCENT_ORB  = '91,155,213';   /* blue */
    const VIOLET_ORB  = '167,139,250';  /* violet */

    /* Define aurora orbs — mix of blue and violet for depth */
    const orbs = [
      /* xP, yP, rP, spd, ph, alpha, color */
      { xP:0.18, yP:0.28, rP:0.45, spd:0.00018, ph:0.0,             a:0.13, c:ACCENT_ORB  },
      { xP:0.72, yP:0.15, rP:0.38, spd:0.00024, ph:Math.PI*0.7,    a:0.10, c:ACCENT_ORB  },
      { xP:0.55, yP:0.75, rP:0.32, spd:0.00031, ph:Math.PI*1.3,    a:0.07, c:VIOLET_ORB  },
      { xP:0.88, yP:0.55, rP:0.28, spd:0.00020, ph:Math.PI*1.85,   a:0.09, c:VIOLET_ORB  },
      { xP:0.35, yP:0.60, rP:0.22, spd:0.00027, ph:Math.PI*0.4,    a:0.06, c:ACCENT_ORB  },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const t = Date.now();

      orbs.forEach(orb => {
        /* Gently drift the orb centre using sine waves */
        const cx = W * (orb.xP + 0.08 * Math.sin(t * orb.spd + orb.ph));
        const cy = H * (orb.yP + 0.06 * Math.cos(t * orb.spd * 1.3 + orb.ph));
        const r  = Math.min(W, H) * orb.rP;

        /* Pulsing alpha */
        const alpha = orb.a * (0.8 + 0.2 * Math.sin(t * 0.0006 + orb.ph));
        const orbColor = orb.c || ACCENT;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0,   `rgba(${orbColor}, ${alpha})`);
        grad.addColorStop(0.4, `rgba(${orbColor}, ${alpha * 0.45})`);
        grad.addColorStop(1,   `rgba(${orbColor}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* Top-edge aurora sweep */
      const sweepGrad = ctx.createLinearGradient(0, 0, W, 0);
      const sweepAlpha = 0.06 + 0.03 * Math.sin(t * 0.0003);
      sweepGrad.addColorStop(0,   `rgba(${ACCENT}, 0)`);
      sweepGrad.addColorStop(0.3, `rgba(${ACCENT}, ${sweepAlpha})`);
      sweepGrad.addColorStop(0.7, `rgba(${ACCENT}, ${sweepAlpha * 0.7})`);
      sweepGrad.addColorStop(1,   `rgba(${ACCENT}, 0)`);
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, 0, W, H * 0.35);

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* Boot both canvases after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initBgCanvas();
      initHeroCanvas();
    });
  } else {
    initBgCanvas();
    initHeroCanvas();
  }

})();