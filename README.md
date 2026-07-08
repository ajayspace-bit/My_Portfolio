# Ajay S — Portfolio Website

A single-page, dark-themed portfolio site built to the design spec (Ethana.ai-inspired dark navy / sky-blue aesthetic), with smooth-scroll anchor navigation, scroll-reveal animations, and a fully responsive layout.

## How to use

1. **Preview it**: just open `index.html` in any browser — no build step, no dependencies to install.
2. **Deploy it**: drag the folder into [Netlify Drop](https://app.netlify.com/drop), [Vercel](https://vercel.com/new), or GitHub Pages. It's a static site, so any static host works.

## What to customize

| What | Where |
|---|---|
| University name | About section → `edu-body` → `[University Name]` |
| Resume PDF | Add a `resume.pdf` file to this folder (the Resume button links to `/resume.pdf`) |
| Email / phone | Contact section → `contact-info-card` |
| Social links | Contact section → `social-row` (currently `#` placeholders) |
| Project GitHub links | Projects section → each `.project-link href="#"` |
| Company names (Experience) | Experience section → `[Company Name]` |
| Contact form backend | The form currently just resets on submit. Wire it to [Formspree](https://formspree.io), [EmailJS](https://www.emailjs.com/), or your own API — search `contact-form` in `index.html`'s `<script>` block. |

## Structure

```
ajay-portfolio/
├── index.html   ← everything (HTML + CSS + JS) in one file
└── README.md
```

## Tech notes

- Fonts: **Inter** (headings/body) + **JetBrains Mono** (eyebrows/labels), via Google Fonts CDN.
- Icons: **Font Awesome 6** for UI/social icons, **Devicon** for tech-stack logos — both loaded via CDN, so an internet connection is needed for icons to render.
- No frameworks or build tools — pure HTML/CSS/JS, so it's trivial to hand-edit or port into React/Next.js later if you want the cinematic Next.js 15 version.
- Scroll-reveal is done with `IntersectionObserver`; respects `prefers-reduced-motion`.
