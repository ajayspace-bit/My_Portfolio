/**
 * GSAP Animation Engine — Ajay S Portfolio
 * ─────────────────────────────────────────
 * Runs AFTER script.js has populated all DOM sections from data.json.
 * Uses GSAP 3 + ScrollTrigger for premium, cinematic animations.
 *
 * Architecture:
 *  1. guardMotion()         – skip all if prefers-reduced-motion
 *  2. registerPlugins()     – GSAP plugin setup
 *  3. heroEntrance()        – cinematic page-load timeline
 *  4. navEntrance()         – navbar slide-in
 *  5. sectionReveals()      – ScrollTrigger reveals per section
 *  6. parallaxEffects()     – hero card parallax scrub
 *  7. hoverMicro()          – GSAP-powered hover interactions
 *  8. boot()                – waits for DOM + data render, then fires
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     GUARD: skip all animations if user prefers reduced motion
     ───────────────────────────────────────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ─────────────────────────────────────────────────────────
     REGISTER GSAP PLUGINS
     ───────────────────────────────────────────────────────── */
  function registerPlugins() {
    gsap.registerPlugin(ScrollTrigger);

    // Mark body so CSS can disable conflicting transition-based reveals
    document.body.classList.add('gsap-ready');

    // Global GSAP defaults — smooth spring-like easing
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    });
  }


  /* ─────────────────────────────────────────────────────────
     UTILITY: split text into word spans for staggered reveal
     ───────────────────────────────────────────────────────── */
  function splitWords(el) {
    if (!el) return [];
    const text = el.textContent;
    el.innerHTML = text
      .split(' ')
      .map(w => `<span class="gsap-word" style="display:inline-block; overflow:hidden; vertical-align:bottom;"><span class="gsap-word-inner" style="display:inline-block;">${w}</span></span>`)
      .join(' ');
    return el.querySelectorAll('.gsap-word-inner');
  }

  /* ─────────────────────────────────────────────────────────
     1. NAVBAR ENTRANCE
        Slides in from top on load
     ───────────────────────────────────────────────────────── */
  function navEntrance() {
    const navWrap = document.querySelector('.navbar-wrap');
    if (!navWrap) return;

    gsap.from(navWrap, {
      y: -80,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      delay: 0.1,
    });
  }

  /* ─────────────────────────────────────────────────────────
     2. HERO CINEMATIC ENTRANCE
        Orchestrated stagger timeline on page load
     ───────────────────────────────────────────────────────── */
  function heroEntrance() {
    const tl = gsap.timeline({ delay: 0.35 });

    // ── Status bar / badge ──
    const statusBar = document.getElementById('heroStatusBar') || document.getElementById('heroBadge');
    if (statusBar) {
      tl.from(statusBar, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.7)',
      });
    }

    // ── H1 heading — word-by-word reveal ──
    const heading = document.getElementById('heroHeading');
    if (heading) {
      // Keep original innerHTML (has <br> and <span class="accent-text">)
      // Animate the whole block with clip reveal
      tl.from(heading, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: 'power4.out',
        clipPath: 'inset(0 0 100% 0)',
      }, '-=0.3');
    }

    // ── Description paragraphs ──
    const desc    = document.getElementById('heroDesc');
    const subDesc = document.getElementById('heroSubDesc');
    if (desc) {
      tl.from(desc, { y: 30, opacity: 0, duration: 0.7 }, '-=0.5');
    }
    if (subDesc) {
      tl.from(subDesc, { y: 30, opacity: 0, duration: 0.7 }, '-=0.55');
    }

    // ── CTA buttons ──
    const actions = document.getElementById('heroActions');
    if (actions) {
      tl.from(actions.children, {
        y: 25,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'back.out(1.5)',
      }, '-=0.4');
    }

    // ── Stats bar ──
    const stats = document.getElementById('heroStats');
    if (stats) {
      tl.from(stats.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
      }, '-=0.3');
    }

    // ── Hero 3D card — sweeps in from right ──
    const heroStage = document.querySelector('.hero-stage');
    if (heroStage) {
      tl.from(heroStage, {
        x: 120,
        opacity: 0,
        rotateY: -25,
        duration: 1.1,
        ease: 'power4.out',
        transformOrigin: 'left center',
      }, 0.2); // start early in timeline (parallel)
    }

    // ── Hero front-layer data rows ──
    const hfRows = document.querySelectorAll('.hf-row');
    if (hfRows.length) {
      tl.from(hfRows, {
        x: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
      }, '-=0.6');
    }
  }

  /* ─────────────────────────────────────────────────────────
     3. SCROLL-TRIGGERED SECTION REVEALS
     ───────────────────────────────────────────────────────── */
  function sectionReveals() {

    /* ── Helper: batch-animate elements with ScrollTrigger ── */
    function scrollReveal(selector, fromVars, stagger = 0, triggerOpts = {}) {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;

      els.forEach((el, i) => {
        // If stagger is used, animate all siblings together
        if (stagger > 0 && el.parentElement) {
          const siblings = el.parentElement.querySelectorAll(selector);
          if (i === 0) {
            gsap.from(siblings, {
              ...fromVars,
              stagger,
              scrollTrigger: {
                trigger: el.parentElement,
                start: 'top 85%',
                once: true,
                ...triggerOpts,
              },
            });
          }
        } else {
          gsap.from(el, {
            ...fromVars,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
              ...triggerOpts,
            },
          });
        }
      });
    }

    /* ─────────────────────────────────────────
       SECTION HEADS — clip-path masked reveal
       ───────────────────────────────────────── */
    document.querySelectorAll('.section-head').forEach(head => {
      const eyebrow = head.querySelector('.eyebrow');
      const h2      = head.querySelector('h2');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: head,
          start: 'top 88%',
          once: true,
        },
      });

      if (eyebrow) {
        tl.from(eyebrow, {
          x: -30,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
        });
      }
      if (h2) {
        tl.from(h2, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power4.out',
          clipPath: 'inset(0 0 100% 0)',
        }, '-=0.3');
      }
    });

    /* ─────────────────────────────────────────
       ABOUT SECTION
       ───────────────────────────────────────── */
    const aboutIntro = document.getElementById('aboutIntro');
    if (aboutIntro) {
      gsap.from(aboutIntro, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: aboutIntro, start: 'top 88%', once: true },
      });
    }

    // About dark cards — stagger cascade
    const aboutCards = document.querySelectorAll('#aboutGrid .card-dark');
    if (aboutCards.length) {
      gsap.from(aboutCards, {
        y: 60,
        opacity: 0,
        rotateX: 15,
        duration: 0.75,
        stagger: 0.13,
        ease: 'back.out(1.2)',
        transformOrigin: 'top center',
        scrollTrigger: {
          trigger: document.getElementById('aboutGrid'),
          start: 'top 85%',
          once: true,
        },
      });
    }

    // Education card
    const eduCard = document.getElementById('eduCard');
    if (eduCard) {
      gsap.from(eduCard, {
        y: 40,
        opacity: 0,
        scale: 0.96,
        duration: 0.7,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: eduCard, start: 'top 88%', once: true },
      });
    }

    /* ─────────────────────────────────────────
       SKILLS SECTION
       ───────────────────────────────────────── */
    // Skill categories — stagger wave
    const skillCats = document.querySelectorAll('.skill-cat');
    if (skillCats.length) {
      gsap.from(skillCats, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: document.getElementById('skillsGrid'),
          start: 'top 85%',
          once: true,
        },
      });
    }

    // Tech tiles — spring pop-in per tile
    document.querySelectorAll('.skill-cat').forEach(cat => {
      const tiles = cat.querySelectorAll('.tech-tile');
      if (!tiles.length) return;
      gsap.from(tiles, {
        scale: 0.7,
        opacity: 0,
        duration: 0.45,
        stagger: 0.04,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: cat,
          start: 'top 85%',
          once: true,
        },
      });
    });

    // Network panel
    const netPanel = document.querySelector('.network-panel');
    if (netPanel) {
      gsap.from(netPanel, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: netPanel, start: 'top 88%', once: true },
      });
    }

    /* ─────────────────────────────────────────
       PROJECTS SECTION — alternating slide-in
       ───────────────────────────────────────── */
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, i) => {
      gsap.from(card, {
        x: i % 2 === 0 ? -60 : 60,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true,
        },
      });
    });

    /* ─────────────────────────────────────────
       SERVICES SECTION — fan-in from bottom
       ───────────────────────────────────────── */
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length) {
      gsap.from(serviceCards, {
        y: 70,
        opacity: 0,
        rotate: 3,
        duration: 0.75,
        stagger: 0.12,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: document.getElementById('servicesGrid'),
          start: 'top 85%',
          once: true,
        },
      });
    }

    /* ─────────────────────────────────────────
       EXPERIENCE — draw-in from left
       ───────────────────────────────────────── */
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, i) => {
      gsap.from(item, {
        x: -60,
        opacity: 0,
        duration: 0.75,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
      });
    });

    // Timeline line draw
    const tlLine = document.querySelector('.timeline::before');
    // CSS handles line; animate the container instead
    const timelineEl = document.getElementById('expTimeline');
    if (timelineEl) {
      gsap.from(timelineEl, {
        '--line-height': '0%',
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: timelineEl,
          start: 'top 80%',
          once: true,
        },
      });
    }

    /* ─────────────────────────────────────────
       CONTACT SECTION — scale + glow
       ───────────────────────────────────────── */
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const contactHead  = contactSection.querySelector('.section-head');
      const availBadge   = document.getElementById('contactAvailBadge');
      const infoCard     = document.getElementById('contactInfoCard');
      const socialRow    = document.getElementById('socialRow');
      const contactLabel = document.getElementById('socialLabel');

      const ctl = gsap.timeline({
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 80%',
          once: true,
        },
      });

      if (availBadge) {
        ctl.from(availBadge, { scale: 0.8, opacity: 0, duration: 0.6, ease: 'back.out(2)' });
      }
      if (infoCard) {
        ctl.from(infoCard, { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
      }
      if (contactLabel) {
        ctl.from(contactLabel, { y: 20, opacity: 0, duration: 0.5 }, '-=0.2');
      }
      if (socialRow) {
        ctl.from(socialRow.children, {
          y: 20,
          opacity: 0,
          scale: 0.7,
          duration: 0.5,
          stagger: 0.08,
          ease: 'back.out(2)',
        }, '-=0.2');
      }
    }
  }

  /* ─────────────────────────────────────────────────────────
     4. PARALLAX — Hero card scrubs with scroll
     ───────────────────────────────────────────────────────── */
  function parallaxEffects() {
    const heroStage = document.querySelector('.hero-stage');
    const heroInner = document.querySelector('.hero-inner');
    if (!heroStage || !heroInner) return;

    // Hero text moves up slightly faster than card (depth illusion)
    gsap.to(heroInner, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    gsap.to(heroStage, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      },
    });
  }

  /* ─────────────────────────────────────────────────────────
     5. HOVER MICRO-ANIMATIONS
     ───────────────────────────────────────────────────────── */
  function hoverMicro() {

    /* ── GSAP-powered card 3D tilt ── */
    function addGsapTilt(selector, strength = 8) {
      document.querySelectorAll(selector).forEach(card => {
        let tlHover = gsap.timeline({ paused: true });

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const cx   = rect.left + rect.width  / 2;
          const cy   = rect.top  + rect.height / 2;
          const dx   = (e.clientX - cx) / (rect.width  / 2);
          const dy   = (e.clientY - cy) / (rect.height / 2);
          gsap.to(card, {
            rotateX: -dy * strength,
            rotateY:  dx * strength,
            transformPerspective: 900,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
            overwrite: 'auto',
          });
        });
      });
    }

    /* ── Tech tile spring scale ── */
    document.querySelectorAll('.tech-tile').forEach(tile => {
      tile.addEventListener('mouseenter', () => {
        gsap.to(tile, {
          scale: 1.08,
          y: -4,
          duration: 0.35,
          ease: 'back.out(2)',
          overwrite: 'auto',
        });
      });
      tile.addEventListener('mouseleave', () => {
        gsap.to(tile, {
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto',
        });
      });
    });

    /* ── Social button bounce ── */
    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
          scale: 1.18,
          y: -5,
          duration: 0.35,
          ease: 'back.out(2.5)',
          overwrite: 'auto',
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
      });
    });

    /* ── Service card icon bounce on hover ── */
    document.querySelectorAll('.service-card').forEach(card => {
      const icon = card.querySelector('.service-icon');
      if (!icon) return;
      card.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          y: -8,
          scale: 1.15,
          rotate: 5,
          duration: 0.4,
          ease: 'back.out(2)',
          overwrite: 'auto',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto',
        });
      });
    });

    /* ── About card icon pulse ── */
    document.querySelectorAll('.card-dark').forEach(card => {
      const icon = card.querySelector('.card-icon');
      if (!icon) return;
      card.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          scale: 1.2,
          rotate: -8,
          duration: 0.4,
          ease: 'back.out(2)',
          overwrite: 'auto',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          scale: 1,
          rotate: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
      });
    });

    /* ── Project card thumbnail zoom ── */
    document.querySelectorAll('.project-card').forEach(card => {
      const thumb = card.querySelector('.project-thumb img, .project-thumb i');
      if (!thumb) return;
      card.addEventListener('mouseenter', () => {
        gsap.to(thumb, {
          scale: 1.06,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(thumb, {
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    });

    /* Apply GSAP tilt to cards (replaces manual JS tilt) */
    addGsapTilt('.card-dark', 6);
    addGsapTilt('.project-card', 5);
    addGsapTilt('.service-card', 5);
    addGsapTilt('.timeline-item', 4);
  }

  /* ─────────────────────────────────────────────────────────
     6. FLOATING HERO CARD — gentle GSAP yoyo float
     ───────────────────────────────────────────────────────── */
  function heroCardFloat() {
    const card = document.querySelector('.hero-card-3d');
    if (!card) return;

    // Subtle float on Y axis — yoyo loop
    gsap.to(card, {
      y: -12,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Orbit slow spin — continuous rotation on orbits
    const orbits = document.querySelectorAll('.orbit');
    orbits.forEach((orb, i) => {
      gsap.to(orb, {
        rotate: i % 2 === 0 ? 360 : -360,
        duration: i % 2 === 0 ? 12 : 18,
        ease: 'none',
        repeat: -1,
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     7. SCROLL PROGRESS BAR GLOW
        Enhances the native scrollProgress bar with GSAP
     ───────────────────────────────────────────────────────── */
  function scrollProgressGlow() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    // Pulse the glow as user scrolls
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress;
        // Subtle glow intensity increases with scroll depth
        bar.style.boxShadow = `0 0 ${8 + progress * 12}px rgba(56,189,248,${0.4 + progress * 0.4})`;
      },
    });
  }

  /* ─────────────────────────────────────────────────────────
     BOOT — wait for DOM + data render then fire all animations
     script.js runs DOMContentLoaded → renders all sections → initBehavior()
     We wait for that to fully complete via a short rAF chain.
     ───────────────────────────────────────────────────────── */
  function boot() {
    // Wait 2 rAF frames so script.js renderAll + initBehavior() are done
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        registerPlugins();
        navEntrance();
        heroEntrance();

        // Section reveals need a tiny extra delay since DOM is built async
        setTimeout(() => {
          sectionReveals();
          parallaxEffects();
          hoverMicro();
          heroCardFloat();
          scrollProgressGlow();

          // Refresh ScrollTrigger after all layout is settled
          ScrollTrigger.refresh();
        }, 120);
      });
    });
  }

  /* ── Entry point ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
