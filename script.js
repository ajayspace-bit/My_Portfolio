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

    // Desktop links
    const linksEl = document.getElementById('navLinks');
    if (linksEl) {
      linksEl.innerHTML = nav.links.map(l =>
        `<li><a href="${esc(l.href)}" class="nav-link">${esc(l.label)}</a></li>`
      ).join('');
    }

    // Mobile nav links
    const mobileEl = document.getElementById('navMobile');
    if (mobileEl) {
      mobileEl.innerHTML = nav.links.map(l =>
        `<a href="${esc(l.href)}" class="nav-mobile-link">${esc(l.label)}</a>`
      ).join('');
    }

    // Store resume PDF path
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
    if (actionsEl) {
      actionsEl.innerHTML = `
        <a href="${esc(hero.ctaPrimary.href)}" class="btn btn-primary" style="padding: 15px 30px; font-size: 15px;">
          ${esc(hero.ctaPrimary.label)}</a>
        <a href="${esc(hero.ctaSecondary.href)}" class="btn btn-outline" style="padding: 15px 30px; font-size: 15px;">
          ${esc(hero.ctaSecondary.label)}</a>
      `;
    }

    // ── Stats bar ──
    if (hero.stats && hero.stats.length) {
      const statsEl = document.getElementById('heroStats');
      if (statsEl) {
        statsEl.innerHTML = hero.stats.map(s => `
          <div class="stat-item">
            <i class="${esc(s.icon)}"></i>
            <span class="stat-num" data-target="${s.value}" data-suffix="${esc(s.suffix || '')}">0${esc(s.suffix || '')}</span>
            <span class="stat-label">${esc(s.label)}</span>
          </div>
        `).join('');
      }
    }

    // ── Inject photo into 3D hero card ──
    const avatarSlot = document.getElementById('heroAvatarSlot');
    if (avatarSlot && hero.image) {
      // Preserve orbit divs, insert photo behind them
      const img = document.createElement('img');
      img.src = hero.image;
      img.alt = 'Ajay S';
      img.loading = 'eager';
      // Insert before the orbit divs so they layer on top
      avatarSlot.insertBefore(img, avatarSlot.firstChild);
    }

    // ── Inject hero entrance animation stagger classes ──
    const heroInner = document.querySelector('.hero-inner');
    if (heroInner) {
      const staggerTargets = [
        document.getElementById('heroStatusBar') || document.getElementById('heroBadge'),
        document.getElementById('heroHeading'),
        document.getElementById('heroDesc'),
        document.getElementById('heroSubDesc'),
        document.getElementById('heroActions'),
        document.getElementById('heroStats'),
      ];
      staggerTargets.forEach((el, i) => {
        if (el) { el.classList.add('hero-anim', `hero-anim-${i}`); }
      });
    }
    const heroStage = document.querySelector('.hero-stage');
    if (heroStage) heroStage.classList.add('hero-stage-anim');

    // Legacy hero image wrapper — hidden by CSS, no-op
    const imgWrapper = document.getElementById('heroImageWrapper');
    if (imgWrapper) imgWrapper.style.display = 'none';

    // ── Typewriter role animation ──
    if (hero.roles && hero.roles.length) {
      const subDescEl = document.getElementById('heroSubDesc');
      if (subDescEl) {
        // Wrap content: prepend a role span + cursor
        const roleSpan = document.createElement('span');
        roleSpan.id = 'heroRole';
        roleSpan.style.cssText = 'font-weight:700; color:var(--accent);';
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        const badgeEl = document.getElementById('heroBadge');
        if (badgeEl) {
          // Wrapper: two pills stacked vertically
          const wrapper = document.createElement('div');
          wrapper.id = 'heroStatusBar';
          wrapper.style.cssText = [
            'display:inline-flex',
            'flex-direction:column',
            'align-items:flex-start',
            'gap:10px',
            'margin-bottom:28px',
          ].join(';');

          // ── Pill 1: Role + typewriter ──
          const rolePill = document.createElement('div');
          rolePill.style.cssText = [
            'display:inline-flex',
            'align-items:center',
            'gap:5px',
            'background:rgba(255,255,255,0.04)',
            'border:1px solid rgba(255,255,255,0.10)',
            'border-radius:100px',
            'padding:7px 18px',
            'font-family:var(--font-mono)',
            'font-size:12.5px',
            'color:var(--text-dark-muted)',
            'white-space:nowrap',
          ].join(';');
          rolePill.textContent = 'Role: ';
          rolePill.appendChild(roleSpan);
          rolePill.appendChild(cursor);

          // ── Pill 2: Focus badge ──
          const focusPill = document.createElement('div');
          focusPill.style.cssText = [
            'display:inline-flex',
            'align-items:center',
            'gap:6px',
            'background:rgba(91,155,213,0.12)',
            'border:1px solid rgba(91,155,213,0.25)',
            'border-radius:100px',
            'padding:7px 18px',
            'font-family:var(--font-mono)',
            'font-size:12px',
            'font-weight:600',
            'color:var(--accent)',
            'letter-spacing:0.04em',
            'white-space:nowrap',
          ].join(';');
          const focusDot = document.createElement('span');
          focusDot.className = 'hero-badge-dot';
          focusPill.appendChild(focusDot);
          // Move badge text content into focusPill
          const badgeTextEl = document.getElementById('heroBadgeText');
          if (badgeTextEl) focusPill.appendChild(badgeTextEl);

          wrapper.appendChild(rolePill);
          wrapper.appendChild(focusPill);

          // Hide original badge (now empty) and insert wrapper before it
          badgeEl.style.display = 'none';
          badgeEl.parentElement.insertBefore(wrapper, badgeEl);
        }



        let roleIdx = 0, charIdx = 0, deleting = false;
        const ROLES = hero.roles;
        const TYPE_SPEED = 80, DELETE_SPEED = 45, PAUSE = 1800;

        function tick() {
          const current = ROLES[roleIdx];
          if (deleting) {
            charIdx--;
            roleSpan.textContent = current.slice(0, charIdx);
            if (charIdx === 0) {
              deleting = false;
              roleIdx = (roleIdx + 1) % ROLES.length;
              setTimeout(tick, 380);
              return;
            }
            setTimeout(tick, DELETE_SPEED);
          } else {
            charIdx++;
            roleSpan.textContent = current.slice(0, charIdx);
            if (charIdx === current.length) {
              setTimeout(() => { deleting = true; tick(); }, PAUSE);
              return;
            }
            setTimeout(tick, TYPE_SPEED);
          }
        }
        setTimeout(tick, 600);
      }
    }
  }

  function renderAbout(about) {
    // ── Inject digit-roll markup on eyebrow ──
    const aboutEyebrowEl = document.getElementById('aboutEyebrow');
    if (aboutEyebrowEl) {
      aboutEyebrowEl.innerHTML = about.eyebrow.replace(/^(\d+)/, (_, n) =>
        `<span class="eyebrow-num">${n.split('').map(d => `<span class="eyebrow-digit">${d}</span>`).join('')}</span>`
      );
    } else {
      setText('aboutEyebrow', about.eyebrow);
    }
    setText('aboutHeading', about.heading);
    setText('aboutIntro', about.intro);

    // Dark cards (new design)
    const grid = document.getElementById('aboutGrid');
    if (grid) {
      grid.innerHTML = about.cards.map(c => `
        <div class="card-dark reveal">
          <div class="card-icon"><i class="${esc(c.icon)}"></i></div>
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.text)}</p>
        </div>
      `).join('');
    }

    // Education
    const edu = about.education;
    const eduCard = document.getElementById('eduCard');
    if (eduCard) {
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
  }

  function renderSkills(skills) {
    // ── Inject digit-roll markup on eyebrow ──
    const skillsEyebrowEl = document.getElementById('skillsEyebrow');
    if (skillsEyebrowEl) {
      skillsEyebrowEl.innerHTML = skills.eyebrow.replace(/^(\d+)/, (_, n) =>
        `<span class="eyebrow-num">${n.split('').map(d => `<span class="eyebrow-digit">${d}</span>`).join('')}</span>`
      );
    } else {
      setText('skillsEyebrow', skills.eyebrow);
    }
    setText('skillsHeading', skills.heading);

    // Proficiency hints (0–100) per skill label — curated values
    const proficiency = {
      'HTML5':85, 'CSS3':80, 'JavaScript':75,
      'Python':92, 'Flask':78, 'FastAPI':80, 'MySQL':72,
      'NumPy':88, 'Pandas':90, 'Matplotlib':82, 'Seaborn':78,
      'Scikit-learn':85, 'Excel':75, 'Google Colab':88, 'Jupyter':90,
      'Machine Learning':88, 'TensorFlow':78, 'PyTorch':75, 'OpenCV':72,
      'NLP':80, 'Deep Learning':76,
      'Generative AI':90, 'LLMs':88, 'OpenAI API':85, 'Hugging Face':82,
      'LangChain':90, 'LangGraph':85, 'LangSmith':80, 'CrewAI':78,
      'MCP':75, 'AI Agents':88, 'Multi-Agent':82, 'RAG':87,
      'Vector DBs':83, 'Embeddings':85, 'Prompt Eng.':90,
      'Tool Calling':82, 'API Integration':86, 'AI Observability':78,
      'Docker':72, 'AWS':70, 'Google Cloud':68, 'Git':88,
      'GitHub':90, 'VS Code':92,
      'Power BI':74, 'Tableau':70,
    };

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
          ${visibleItems.map(item => {
            const pct = proficiency[item.label] || 75;
            return `
            <div class="tech-tile" style="--bar:${pct}%">
              <img src="${esc(item.icon)}" alt="${esc(item.label)}" class="tech-icon">
              <span>${esc(item.label)}</span>
              <div class="tech-tile-bar"></div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function renderProjects(projects) {
    // ── Inject digit-roll markup on eyebrow ──
    const projectsEyebrowEl = document.getElementById('projectsEyebrow');
    if (projectsEyebrowEl) {
      projectsEyebrowEl.innerHTML = projects.eyebrow.replace(/^(\d+)/, (_, n) =>
        `<span class="eyebrow-num">${n.split('').map(d => `<span class="eyebrow-digit">${d}</span>`).join('')}</span>`
      );
    }
    setText('projectsHeading', projects.heading);

    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = projects.items.map(p => {
      let thumbHTML = '';
      if (p.image) {
        thumbHTML = `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`;
      } else if (p.icon) {
        thumbHTML = `<i class="${esc(p.icon)}"></i>`;
      }

      const demoBtn = (p.demo && p.demo.trim() !== '' && p.demo !== '#')
        ? `<a href="${esc(p.demo)}" class="project-link demo-link" target="_blank" rel="noopener" aria-label="Live demo of ${esc(p.title)}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>`
        : '';

      return `
        <div class="project-card reveal">
          <div class="project-thumb">${thumbHTML}</div>
          <div class="project-body">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.description)}</p>
            <div class="tag-row">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
            <div class="project-link-row">
              <a href="${esc(p.github)}" class="project-link" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> View on GitHub →</a>
              ${demoBtn}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderServices(services) {
    // ── Inject digit-roll markup on eyebrow ──
    const servicesEyebrowEl = document.getElementById('servicesEyebrow');
    if (servicesEyebrowEl) {
      servicesEyebrowEl.innerHTML = services.eyebrow.replace(/^(\d+)/, (_, n) =>
        `<span class="eyebrow-num">${n.split('').map(d => `<span class="eyebrow-digit">${d}</span>`).join('')}</span>`
      );
    }
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
    // ── Inject digit-roll markup on eyebrow ──
    const expEyebrowEl = document.getElementById('expEyebrow');
    if (expEyebrowEl) {
      expEyebrowEl.innerHTML = exp.eyebrow.replace(/^(\d+)/, (_, n) =>
        `<span class="eyebrow-num">${n.split('').map(d => `<span class="eyebrow-digit">${d}</span>`).join('')}</span>`
      );
    }
    setText('expHeading', exp.heading);

    const timeline = document.getElementById('expTimeline');
    if (!timeline) return;
    timeline.innerHTML = exp.items.map(e => {
      let descHTML = '';
      if (e.bullets && e.bullets.length > 0) {
        descHTML = `<ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`;
      } else if (e.description) {
        descHTML = `<p>${esc(e.description)}</p>`;
      }
      return `
        <div class="timeline-item reveal" tabindex="0">
          <div class="tl-point"></div>
          <div class="tl-year">${esc(e.duration)}</div>
          <h3>${esc(e.title)}</h3>
          <div class="tl-company">${esc(e.company)}</div>
          <div class="tl-desc-wrap">${descHTML}</div>
          <button class="tl-toggle-btn" aria-expanded="false">
            READ MORE <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
      `;
    }).join('');

    // ── Expand/collapse logic ──
    timeline.querySelectorAll('.tl-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.timeline-item');
        const wrap = item.querySelector('.tl-desc-wrap');
        const expanded = wrap.classList.toggle('expanded');
        btn.classList.toggle('expanded', expanded);
        btn.setAttribute('aria-expanded', String(expanded));
        btn.innerHTML = expanded
          ? 'SHOW LESS <i class="fa-solid fa-chevron-down"></i>'
          : 'READ MORE <i class="fa-solid fa-chevron-down"></i>';
      });
    });
  }

  function renderContact(contact) {
    // ── Inject digit-roll markup on eyebrow ──
    const contactEyebrowEl = document.getElementById('contactEyebrow');
    if (contactEyebrowEl) {
      contactEyebrowEl.innerHTML = contact.eyebrow.replace(/^(\d+)/, (_, n) =>
        `<span class="eyebrow-num">${n.split('').map(d => `<span class="eyebrow-digit">${d}</span>`).join('')}</span>`
      );
    }

    // ── Availability badge ──
    const availBadge = document.getElementById('contactAvailBadge');
    if (availBadge && contact.availability) {
      availBadge.innerHTML = `
        <div class="avail-badge">
          <span class="avail-dot"></span>
          <span class="avail-badge-text">${esc(contact.availability)}</span>
          ${contact.availabilityNote ? `<span class="avail-badge-note">— ${esc(contact.availabilityNote)}</span>` : ''}
        </div>
      `;
    }

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
    const toTop  = document.getElementById('toTop');

    // ── Scroll: navbar + scroll-to-top ──
    window.addEventListener('scroll', () => {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
      if (toTop)  toTop.classList.toggle('show', window.scrollY > 600);
    });

    // ── Mobile nav toggle (new floating pill design) ──
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');
    if (navToggle && navMobile) {
      navToggle.addEventListener('click', () => navMobile.classList.toggle('open'));
      navMobile.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => navMobile.classList.remove('open'))
      );
    }

    // ── Scroll to top ──
    if (toTop) {
      toTop.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: 'smooth' })
      );
    }

    // ── Active nav highlighting ──
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

    // ── Reveal on scroll ──
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement?.children || []);
          const idx = siblings.indexOf(entry.target);
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

    // ── Animated stat counters (easing ease-out) ──
    const statNums = document.querySelectorAll('.stat-num[data-target]');
    if (statNums.length) {
      const countObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1600; // ms
          const startTime = performance.now();
          function easeOut(t) { return 1 - Math.pow(1 - t, 3); } // cubic ease-out
          function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(easeOut(progress) * target);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          countObs.unobserve(el);
        });
      }, { threshold: 0.5 });
      statNums.forEach(el => countObs.observe(el));
    }

    // ── 3D card tilt (dark cards + service/project cards) ──
    const tiltCards = document.querySelectorAll('.card-dark, .service-card, .project-card, .timeline-item');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = (-dy * 6).toFixed(2);
        const rotY = ( dx * 6).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ── Hero 3D card parallax tilt ──
    const heroCard = document.getElementById('heroCard3d');
    if (heroCard) {
      const stage = heroCard.parentElement;
      stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        heroCard.style.transform =
          `rotateY(${(dx * 14).toFixed(2)}deg) rotateX(${(-dy * 10).toFixed(2)}deg)`;
      });
      stage.addEventListener('mouseleave', () => {
        heroCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    }

    // ── Custom cursor ──
    const dot   = document.getElementById('cursorDot');
    const ring  = document.getElementById('cursorRing');
    const label = document.getElementById('cursorLabel');
    if (dot && ring && window.matchMedia('(pointer:fine)').matches) {
      let mx = -100, my = -100, rx = -100, ry = -100;
      window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

      (function loop() {
        // Ring lags behind dot for smooth trailing effect
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        dot.style.left  = mx + 'px';
        dot.style.top   = my + 'px';
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        if (label) {
          label.style.left = mx + 'px';
          label.style.top  = my + 'px';
        }
        requestAnimationFrame(loop);
      })();

      // Card hover
      document.querySelectorAll('.card-dark, .skill-cat, .project-card, .service-card, .timeline-item, .edu-card').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover-card'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover-card'));
      });
      // Button hover
      document.querySelectorAll('.btn, .nav-resume-btn, .to-top, .social-btn').forEach(el => {
        el.addEventListener('mouseenter', () => { ring.classList.add('hover-btn'); dot.classList.add('hover-btn'); });
        el.addEventListener('mouseleave', () => { ring.classList.remove('hover-btn'); dot.classList.remove('hover-btn'); });
      });
      // Link hover (show VIEW label)
      document.querySelectorAll('.project-link, a[target="_blank"]').forEach(el => {
        el.addEventListener('mouseenter', () => { if (label) label.classList.add('show'); });
        el.addEventListener('mouseleave', () => { if (label) label.classList.remove('show'); });
      });
    }

    // ── Generative AI Network Graph ──
    (function initNetworkGraph() {
      const wrap   = document.getElementById('networkWrap');
      const svg    = document.getElementById('networkSvg');
      const center = document.getElementById('netCenter');
      const nodes  = document.querySelectorAll('.net-node');
      if (!wrap || !svg || !center || !nodes.length) return;

      // Skip on small screens (nodes are static)
      if (window.innerWidth < 760) return;

      function layout() {
        const wRect = wrap.getBoundingClientRect();
        const cRect = center.getBoundingClientRect();
        const wW = wRect.width,  wH = wRect.height;
        const cx = wW / 2,       cy = wH / 2;
        const rx = Math.min(wW, wH) * 0.38;
        const ry = Math.min(wW, wH) * 0.33;
        const total = nodes.length;

        // Clear old lines
        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${wW} ${wH}`);

        nodes.forEach((node, i) => {
          const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
          const nx = cx + rx * Math.cos(angle);
          const ny = cy + ry * Math.sin(angle);

          node.style.left = nx + 'px';
          node.style.top  = ny + 'px';

          // Draw line center → node
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', cx);
          line.setAttribute('y1', cy);
          line.setAttribute('x2', nx);
          line.setAttribute('y2', ny);
          line.dataset.nodeIdx = i;
          svg.appendChild(line);
        });
      }

      layout();
      window.addEventListener('resize', layout);

      // Hover interaction: highlight connecting line
      nodes.forEach((node, i) => {
        node.addEventListener('mouseenter', () => {
          node.classList.add('active');
          const line = svg.querySelector(`line[data-node-idx="${i}"]`);
          if (line) line.classList.add('active');
        });
        node.addEventListener('mouseleave', () => {
          node.classList.remove('active');
          const line = svg.querySelector(`line[data-node-idx="${i}"]`);
          if (line) line.classList.remove('active');
        });
      });
    })();

    // ── Experience timeline click highlight ──
    const expTimeline = document.getElementById('expTimeline');
    if (expTimeline) {
      expTimeline.addEventListener('click', (e) => {
        const item = e.target.closest('.timeline-item');
        if (item) {
          if (item.highlightTimeout) clearTimeout(item.highlightTimeout);
          item.classList.remove('highlight-active');
          void item.offsetWidth;
          item.classList.add('highlight-active');
          item.highlightTimeout = setTimeout(() => {
            item.classList.remove('highlight-active');
            item.highlightTimeout = null;
          }, 1200);
        }
      });
    }

    // ── PDF Resume Modal ──
    const navResume        = document.getElementById('navResume');
    const resumeModal      = document.getElementById('resumeModal');
    const closeResumeModal = document.getElementById('closeResumeModal');
    const resumeIframe     = document.getElementById('resumeIframe');

    if (navResume && resumeModal && closeResumeModal && resumeIframe) {
      const openModal = () => {
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
      navResume.addEventListener('click', openModal);
      closeResumeModal.addEventListener('click', closeModal);
      resumeModal.addEventListener('click', (e) => { if (e.target === resumeModal) closeModal(); });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resumeModal.classList.contains('show')) closeModal();
      });
    }

    // ── Scroll Progress Bar ──
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
      const updateProgress = () => {
        const scrollTop  = window.scrollY;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    // ── Sliding Nav Indicator ──
    (function initNavIndicator() {
      const indicator = document.getElementById('navIndicator');
      const navList   = document.getElementById('navLinks');
      if (!indicator || !navList) return;

      function moveIndicator(targetLink) {
        const navRect  = navList.getBoundingClientRect();
        const linkRect = targetLink.getBoundingClientRect();
        indicator.style.left    = (linkRect.left - navRect.left + navList.offsetLeft) + 'px';
        indicator.style.width   = linkRect.width + 'px';
        indicator.style.opacity = '1';
      }

      // Watch for active nav changes
      const navObserver = new MutationObserver(() => {
        const active = navList.querySelector('.nav-link.active');
        if (active) moveIndicator(active);
        else indicator.style.opacity = '0';
      });
      navObserver.observe(navList, { attributes: true, subtree: true, attributeFilter: ['class'] });

      // Initial position
      const firstActive = navList.querySelector('.nav-link.active');
      if (firstActive) moveIndicator(firstActive);
    })();

    // ── Magnetic Buttons ──
    (function initMagneticButtons() {
      const STRENGTH = 0.35; // how strong the pull is (0=none, 1=full)
      const magnetEls = document.querySelectorAll('.btn-primary, .btn-outline, .nav-resume-btn');
      magnetEls.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width  / 2;
          const cy = rect.top  + rect.height / 2;
          const dx = (e.clientX - cx) * STRENGTH;
          const dy = (e.clientY - cy) * STRENGTH;
          btn.style.transform = `translate(${dx}px, ${dy}px)`;
          btn.classList.add('magnetic-active');
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
          btn.classList.remove('magnetic-active');
        });
      });
    })();

    // ── Eyebrow digit-roll on section enter ──
    (function initEyebrowRoll() {
      const eyebrowNums = document.querySelectorAll('.eyebrow-num');
      if (!eyebrowNums.length) return;
      const rollObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const numEl = entry.target;
            // Trigger animation by toggling class
            numEl.classList.remove('rolling');
            void numEl.offsetWidth; // reflow
            numEl.classList.add('rolling');
            rollObs.unobserve(numEl);
          }
        });
      }, { threshold: 0.5 });
      eyebrowNums.forEach(n => rollObs.observe(n));
    })();

    // ── Skills micro-bar — trigger on tile hover ──
    // (CSS handles the animation; just ensure bar-visible class for visible tiles on scroll)
    (function initSkillBars() {
      const tiles = document.querySelectorAll('.tech-tile');
      if (!tiles.length) return;
      const barObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bar-visible');
            barObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.8 });
      tiles.forEach(t => barObs.observe(t));
    })();
  }

  /* ═══════════════════════════════════════
     BOOTSTRAP — fetch → render → init
     ═══════════════════════════════════════ */

  async function bootstrap() {
    try {
      const res = await fetch('data.json?v=6');
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
  const ACCENT     = '38,189,248';   /* --accent rgb - vivid cyan-blue */
  const VIOLET_C   = '167,139,250';  /* --violet rgb */
  const DEEP       = '4,6,14';       /* --bg rgb */

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

    const PARTICLE_COUNT = 110;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    Math.random() * 1.6 + 0.4,          /* radius 0.4 – 2 px */
        vx:   (Math.random() - 0.5) * 0.25,        /* drift speed x */
        vy:   (Math.random() - 0.5) * 0.20,        /* drift speed y */
        a:    Math.random() * 0.60 + 0.12,          /* opacity 0.12 – 0.72 */
        pA:   Math.random() * Math.PI * 2,         /* pulse phase offset */
        pS:   Math.random() * 0.006 + 0.003,       /* pulse speed */
        glowing: Math.random() < 0.22,              /* 22% are bright glowing dots */
        isViolet: Math.random() < 0.30              /* 30% use violet color */
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
        const particleColor = p.isViolet ? '167,139,250' : ACCENT;

        if (p.glowing) {
          /* Soft glow halo around bright dots */
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          grad.addColorStop(0, `rgba(${particleColor},${pulsed * 0.95})`);
          grad.addColorStop(1, `rgba(${particleColor},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${particleColor},${pulsed})`;
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
          if (dist < 110) {
            const lineAlpha = 0.10 * (1 - dist / 110);
            const useViolet = particles[i].isViolet && particles[j].isViolet;
            ctx.strokeStyle = `rgba(${useViolet ? VIOLET_C : ACCENT},${lineAlpha})`;
            ctx.lineWidth = 0.6;
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
    const ACCENT_ORB  = '38,189,248';   /* vivid cyan-blue */
    const VIOLET_ORB  = '167,139,250';  /* violet */
    const INDIGO_ORB  = '99,102,241';   /* indigo */

    /* Define aurora orbs — rich multi-tone aurora */
    const orbs = [
      /* xP, yP, rP, spd, ph, alpha, color */
      { xP:0.15, yP:0.25, rP:0.50, spd:0.00018, ph:0.0,             a:0.17, c:ACCENT_ORB  },
      { xP:0.75, yP:0.12, rP:0.42, spd:0.00024, ph:Math.PI*0.7,    a:0.13, c:ACCENT_ORB  },
      { xP:0.52, yP:0.72, rP:0.36, spd:0.00031, ph:Math.PI*1.3,    a:0.10, c:VIOLET_ORB  },
      { xP:0.88, yP:0.50, rP:0.30, spd:0.00020, ph:Math.PI*1.85,   a:0.12, c:VIOLET_ORB  },
      { xP:0.32, yP:0.55, rP:0.26, spd:0.00027, ph:Math.PI*0.4,    a:0.08, c:ACCENT_ORB  },
      { xP:0.62, yP:0.35, rP:0.22, spd:0.00022, ph:Math.PI*1.1,    a:0.09, c:INDIGO_ORB  },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const t = Date.now();

      orbs.forEach(orb => {
        /* Gently drift the orb centre + subtle mouse attraction */
        const baseX = W * (orb.xP + 0.09 * Math.sin(t * orb.spd + orb.ph));
        const baseY = H * (orb.yP + 0.07 * Math.cos(t * orb.spd * 1.3 + orb.ph));

        /* Mouse influence — orbs drift toward cursor (very gently) */
        const mouseInfluence = 0.08;
        const cx = baseX + (_heroMX !== null ? (_heroMX - baseX) * mouseInfluence * orb.a : 0);
        const cy = baseY + (_heroMY !== null ? (_heroMY - baseY) * mouseInfluence * orb.a : 0);
        const r  = Math.min(W, H) * orb.rP;

        /* Pulsing alpha */
        const alpha = orb.a * (0.75 + 0.25 * Math.sin(t * 0.0007 + orb.ph));
        const orbColor = orb.c || ACCENT;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0,   `rgba(${orbColor}, ${alpha})`);
        grad.addColorStop(0.35, `rgba(${orbColor}, ${alpha * 0.50})`);
        grad.addColorStop(1,   `rgba(${orbColor}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* Top-edge aurora sweep — vivid neon */
      const sweepGrad = ctx.createLinearGradient(0, 0, W, 0);
      const sweepAlpha = 0.08 + 0.04 * Math.sin(t * 0.0003);
      sweepGrad.addColorStop(0,   `rgba(${ACCENT_ORB}, 0)`);
      sweepGrad.addColorStop(0.25, `rgba(${ACCENT_ORB}, ${sweepAlpha})`);
      sweepGrad.addColorStop(0.5, `rgba(${VIOLET_ORB}, ${sweepAlpha * 0.8})`);
      sweepGrad.addColorStop(0.75, `rgba(${ACCENT_ORB}, ${sweepAlpha * 0.6})`);
      sweepGrad.addColorStop(1,   `rgba(${ACCENT_ORB}, 0)`);
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, 0, W, H * 0.40);

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* Boot both canvases after DOM is ready */
  /* Mouse tracking for aurora reactivity */
  let _heroMX = null, _heroMY = null;
  (function trackHeroMouse() {
    const heroEl = document.getElementById('home');
    if (!heroEl) return;
    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      _heroMX = e.clientX - rect.left;
      _heroMY = e.clientY - rect.top;
    });
    heroEl.addEventListener('mouseleave', () => { _heroMX = null; _heroMY = null; });
  })();

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