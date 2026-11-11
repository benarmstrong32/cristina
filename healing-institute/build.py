#!/usr/bin/env python3
"""Builds the static Healing Institute site into ./public.

Run:  python3 build.py
Every page shares one header, footer and design system; edit content below.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT") or os.path.join(HERE, "public")
# DEMO=1 builds a preview copy that search engines won't index
DEMO = os.environ.get("DEMO") == "1"

PHONE = "(704) 284-9288"
PHONE_HREF = "tel:+17042849288"
EMAIL = "brianr@healinginstitutepllc.com"
ADDRESS_1 = "3719 Latrobe Dr., Suite 850"
ADDRESS_2 = "Charlotte, NC 28211"
MAP_Q = "3719+Latrobe+Dr+Suite+850+Charlotte+NC+28211"
SITE_URL = "https://www.healinginstitutepllc.com"

# ---------------------------------------------------------------- icons
ICONS = {
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    "heart": '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    "lock": '<rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    "leaf": '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
    "layers": '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    "waves": '<path d="M2 6c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 12c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>',
    "eye": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "moon": '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    "puzzle": '<path d="M12 2a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v3h1a2 2 0 1 1 0 4h-1v3a2 2 0 0 1-2 2h-3v-1a2 2 0 1 0-4 0v1H7a2 2 0 0 1-2-2v-3h1a2 2 0 1 0 0-4H5V7a2 2 0 0 1 2-2h3V4a2 2 0 0 1 2-2z"/>',
    "users": '<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    "award": '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.2 7 22l5-3 5 3-1.2-8.8"/>',
    "info": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    "lifebuoy": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.9 4.9 4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "chev": '<path d="m6 9 6 6 6-6"/>',
    "brain": '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/>',
}


def icon(name, size=24, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<svg{c} width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


LOGO = ('<svg width="42" height="42" viewBox="0 0 48 48" aria-hidden="true">'
        '<circle cx="24" cy="24" r="23" fill="#E3EBE5"/>'
        '<path d="M24 36c-6.5-3.2-10-8.4-10-14 4.6 0 8.2 2.4 10 6.3 1.8-3.9 5.4-6.3 10-6.3 0 5.6-3.5 10.8-10 14z" fill="#5E7D6A"/>'
        '<path d="M24 29c-2.6-3.4-3.3-7.8-1.6-12.4L24 12l1.6 4.6c1.7 4.6 1 9-1.6 12.4z" fill="#8AA593"/>'
        '</svg>')

# ---------------------------------------------------------------- specialties
SPECIALTIES = [
    ("complex-trauma-therapy", "Complex Trauma / C-PTSD", "layers",
     "For the effects of repeated trauma that began in childhood, including attachment wounds that still shape life today."),
    ("dissociative-disorders", "Dissociative Disorders", "puzzle",
     "Memory gaps, feeling outside your body, or parts of you that don’t feel like you. Specialist, trauma-focused care."),
    ("borderline-personality-disorder", "Borderline Personality Disorder", "waves",
     "Intense emotions, fear of abandonment and an unstable sense of self, understood as survival responses that can heal."),
    ("emdr-therapy", "EMDR Therapy", "eye",
     "A certified EMDR approach that works with your brain’s natural healing network to resolve what’s stuck."),
    ("hypnosis", "Clinical Hypnosis", "moon",
     "Deep focus and calm, used alongside therapy to reach new insight and support mind-body symptoms."),
]

TAGLINES = {
    "complex-trauma-therapy": "Healing repeated, early-life trauma",
    "dissociative-disorders": "Memory gaps, detachment, parts",
    "borderline-personality-disorder": "Intense emotions and fear of abandonment",
    "emdr-therapy": "Certified EMDR trauma processing",
    "hypnosis": "Focused calm for mind and body",
}

POSTS = [
    {
        "slug": "myths-and-misconceptions-of-dissociative-disorders",
        "title": "Myths and Misconceptions of Dissociative Disorders",
        "date": "September 14, 2026", "iso": "2026-09-14", "read": "5 min read",
        "image": "dissociative.webp",
        "excerpt": "Dissociative disorders are among the most misunderstood conditions in mental health. Here are five common myths, replaced with facts.",
        "tags": ["dissociative disorders", "mental health", "myths", "misconceptions", "dissociation", "complex trauma", "dissociative identity disorder"],
    },
    {
        "slug": "can-trauma-cause-functional-neurological-disorder-fnd",
        "title": "Can trauma cause Functional Neurological Disorder (FND)?",
        "date": "July 7, 2026", "iso": "2026-07-07", "read": "6 min read",
        "image": "complex-trauma.webp",
        "excerpt": "The short answer: it’s possible. A look at FND, interoception, and the strong links between dissociation and functional symptoms.",
        "tags": ["Functional Neurological Disorder", "complex trauma", "dissociative disorders", "mental health"],
    },
]


# ---------------------------------------------------------------- layout
def header(root, active):
    def cur(key):
        return ' aria-current="page"' if key == active else ""
    sub = "".join(
        f'<li><a href="{root}{slug}/"{cur(slug)}>{name}<span>{TAGLINES[slug]}</span></a></li>'
        for slug, name, _, blurb in SPECIALTIES)
    return f'''<a class="skip" href="#main">Skip to content</a>
<div class="support-bar" role="region" aria-label="Crisis support">
  <div class="container">
    <p><span class="msg-long">If you are in crisis, you don’t have to wait. </span>Call or text <a href="tel:988">988</a> any time, or call <a href="tel:911">911</a>.</p>
    <button class="quick-exit" type="button" data-quick-exit title="Leave this site quickly (Shift + Esc)">Quick exit ✕</button>
  </div>
</div>
<header class="site-header">
  <div class="container nav">
    <a class="brand" href="{root}" aria-label="The Healing Institute home">{LOGO}<span class="brand-name">The Healing Institute<small>Specialized Psychotherapy · PLLC</small></span></a>
    <nav aria-label="Main">
      <ul class="menu" id="menu">
        <li><a href="{root}"{cur("home")}>Home</a></li>
        <li><a href="{root}about/"{cur("about")}>About</a></li>
        <li><a href="{root}providers/"{cur("providers")}>Our Provider</a></li>
        <li class="has-sub"><button class="sub-toggle" type="button" aria-expanded="false">Specialized Therapy {icon("chev",16)}</button>
          <ul class="submenu"><li><a href="{root}specialized-therapy/"{cur("specialized-therapy")}>All specialties<span>An overview of how we help</span></a></li>{sub}</ul></li>
        <li><a href="{root}blog/"{cur("blog")}>Blog</a></li>
        <li><a href="{root}contact/"{cur("contact")}>Contact</a></li>
        <li class="mobile-cta"><a href="{root}contact/">Request an appointment</a></li>
      </ul>
    </nav>
    <a class="btn btn-primary nav-cta" href="{root}contact/">Request an appointment</a>
    <button class="menu-toggle" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open menu">{icon("menu",22)}</button>
  </div>
</header>'''


def footer(root):
    spec = "".join(f'<li><a href="{root}{s}/">{n}</a></li>' for s, n, _, _ in SPECIALTIES)
    return f'''<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="{root}">{LOGO}<span class="brand-name">The Healing Institute<small>Specialized Psychotherapy · PLLC</small></span></a>
        <p>Highly skilled, specialty care for complex trauma, dissociation and trauma-related conditions, all in one place.</p>
      </div>
      <div><h4>Explore</h4><ul>
        <li><a href="{root}about/">About</a></li><li><a href="{root}providers/">Our Provider</a></li>
        <li><a href="{root}specialized-therapy/">Specialized Therapy</a></li><li><a href="{root}blog/">Blog</a></li><li><a href="{root}contact/">Contact</a></li></ul></div>
      <div><h4>Specialties</h4><ul>{spec}</ul></div>
      <div><h4>Visit</h4><ul>
        <li>{ADDRESS_1}<br>{ADDRESS_2}<br><em>By appointment only</em></li>
        <li><a href="{PHONE_HREF}">{PHONE}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li></ul></div>
    </div>
    <div class="crisis">{icon("lifebuoy")}<p><strong>Need help right now?</strong> This practice is not a crisis service. If you are in danger or thinking about suicide, call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline) or call <a href="tel:911">911</a>.</p></div>
    <div class="footer-bottom"><span>© <span id="year">2026</span> The Healing Institute, PLLC. All rights reserved.</span><span>Information on this site is educational and is not a substitute for professional care.</span></div>
  </div>
</footer>'''


def cta_band(root, title="You don’t have to carry this alone.",
             text="Reach out whenever you’re ready. We’ll listen, answer your questions, and help you decide on next steps, at a pace that feels right for you."):
    return f'''<section class="cta-band"><div class="container"><div class="cta-inner reveal">
  <div><h2>{title}</h2><p>{text}</p></div>
  <div class="cta-actions">
    <a class="btn btn-light" href="{root}contact/">Request an appointment {icon("arrow",18)}</a>
    <a class="btn btn-ghost" href="{PHONE_HREF}">{icon("phone",18)} {PHONE}</a>
  </div></div></div></section>'''


def page(path, title, desc, body, active="", image=None):
    if path.endswith(".html"):
        root = "/"  # error pages are served at arbitrary URLs
    else:
        root = "../" * (0 if path == "" else path.strip("/").count("/") + 1)
    body = body.replace("{root}", root)
    og = f'{SITE_URL}/images/{image or "room-window.webp"}'
    url = f"{SITE_URL}/{path}"
    full_title = title if title.startswith("The Healing Institute") else f"{title} | The Healing Institute, Charlotte NC"
    robots = '\n<meta name="robots" content="noindex, nofollow">' if DEMO else ''
    html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#2E4A3F">{robots}
<link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..500,100;1,9..144,300..500,100&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/styles.css">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"MedicalBusiness","name":"The Healing Institute, PLLC","url":"{SITE_URL}","telephone":"+1-704-284-9288","email":"{EMAIL}","address":{{"@type":"PostalAddress","streetAddress":"{ADDRESS_1}","addressLocality":"Charlotte","addressRegion":"NC","postalCode":"28211","addressCountry":"US"}},"medicalSpecialty":"Psychiatric"}}</script>
</head>
<body>
{header(root, active)}
<main id="main">
{body}
</main>
{footer(root)}
<script src="{root}assets/main.js" defer></script>
</body>
</html>
'''
    dest = os.path.join(OUT, path, "index.html") if not path.endswith(".html") else os.path.join(OUT, path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", os.path.relpath(dest, HERE))


def crumbs(*items):
    parts = ['<a href="{root}">Home</a>']
    for label, href in items:
        parts.append(f'<a href="{href}">{label}</a>' if href else f'<span aria-current="page" style="margin:0;opacity:1">{label}</span>')
    return '<nav class="crumbs" aria-label="Breadcrumb">' + "<span>/</span>".join(parts) + "</nav>"


def slugify(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def article(sections, extra_after=""):
    """sections: list of (heading, html). Builds sticky TOC + prose."""
    toc = "".join(f'<li><a href="#{slugify(h)}">{h}</a></li>' for h, _ in sections)
    prose = "".join(f'<h2 id="{slugify(h)}">{h}</h2>{b}' for h, b in sections)
    return f'''<section class="section" style="padding-top:clamp(30px,4vw,50px)"><div class="container article">
  <aside class="toc" aria-label="On this page"><p>On this page</p><ol>{toc}</ol></aside>
  <div class="prose">{prose}{extra_after}</div>
</div></section>'''


def related(exclude):
    links = "".join(f'<a href="{{root}}{s}/">{n} {icon("arrow")}</a>' for s, n, _, _ in SPECIALTIES if s != exclude)
    return f'''<section class="section tint" style="padding-block:clamp(56px,7vw,90px)"><div class="container">
  <div class="section-head"><span class="eyebrow">Keep exploring</span><h2>Related specialties</h2></div>
  <div class="related">{links}</div></div></section>'''


def spec_hero(crumb, title, lede, image=None, alt=""):
    img = (f'<div class="img-wrap reveal"><img src="{{root}}images/{image}" alt="{alt}" width="800" height="640"></div>'
           if image else "")
    cls = "page-hero with-image" if image else "page-hero"
    return f'''<section class="{cls}"><div class="container">
  <div>{crumbs(("Specialized Therapy", "{root}specialized-therapy/"), (crumb, None))}
    <span class="eyebrow">Specialized therapy</span><h1>{title}</h1><p class="lede">{lede}</p>
    <div class="hero-actions"><a class="btn btn-primary" href="{{root}}contact/">Talk with us {icon("arrow",18)}</a><a class="btn btn-ghost" href="{PHONE_HREF}">{icon("phone",18)} {PHONE}</a></div>
  </div>{img}</div></section>'''


def ul_grid(items):
    return '<ul class="grid-list">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def chips(items, root_links=None):
    return '<ul class="chips">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def callout(text, kind="", ic="heart"):
    return f'<div class="callout {kind}">{icon(ic)}<div><p>{text}</p></div></div>'


# ================================================================= HOME
def build_home():
    cards = "".join(
        f'<a class="card reveal" href="{{root}}{s}/"><span class="icon">{icon(ic)}</span><h3>{n}</h3><p>{b}</p>'
        f'<span class="more">Learn more {icon("arrow")}</span></a>' for s, n, ic, b in SPECIALTIES)
    posts = "".join(post_card(p) for p in POSTS)
    body = f'''
<section class="hero"><div class="container hero-grid">
  <div class="reveal">
    <span class="eyebrow">Charlotte, NC · Specialized psychotherapy</span>
    <h1>Expert care for <em>complex trauma</em> and dissociation.</h1>
    <p class="lede">At the forefront of mental health support, we bring together highly skilled specialists so people with complex needs can find the advanced, compassionate care they deserve, all in one place.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="{{root}}contact/">Request an appointment {icon("arrow",18)}</a>
      <a class="btn btn-ghost" href="{{root}}specialized-therapy/">Explore specialties</a>
    </div>
    <div class="hero-meta">
      <span>{icon("award")} EMDRIA-certified EMDR</span>
      <span>{icon("users")} ISSTD member</span>
      <span>{icon("pin")} By appointment only</span>
    </div>
  </div>
  <div class="hero-art reveal">
    <div class="arch"><img src="{{root}}images/room-window.webp" alt="A calm, sunlit therapy room with an armchair facing a large window onto green trees" width="800" height="1000" fetchpriority="high"></div>
    <div class="float-card a"><span class="dot">{icon("leaf")}</span><span><strong>A safe place to begin</strong>Person-centered, trauma-informed care</span></div>
    <div class="float-card b"><strong>Healing at your pace</strong>Evidence-based, collaborative therapy</div>
  </div>
</div></section>

<section class="quote-band section tint"><div class="container reveal">
  {icon("leaf",34,"leaf")}
  <blockquote>“People are not defined by what has happened to them.”</blockquote>
  <cite>Brian J. Robertson, MSW, LCSW, EMDR-C</cite>
</div></section>

<section class="section"><div class="container split">
  <div class="reveal">
    <span class="eyebrow">Why we exist</span>
    <h2>Finding the right specialist <em>shouldn’t</em> be this hard.</h2>
    <p>Most therapists are trained for general mental health work. If your needs go beyond that, finding someone with truly specialized skills can feel almost impossible.</p>
    <p>The Healing Institute was created to close that gap: a practice where people with specific, complex needs can find the absolute best care possible, using neuroscience, cutting-edge techniques and solid evidence-based approaches.</p>
    <a class="btn btn-ghost" href="{{root}}about/" style="margin-top:10px">Our story {icon("arrow",18)}</a>
  </div>
  <div class="media reveal"><img src="{{root}}images/room-armchair.webp" alt="A quiet, softly lit room with a comfortable armchair and a plant" width="800" height="600" loading="lazy"></div>
</div></section>

<section class="section mist"><div class="container">
  <div class="section-head center reveal"><span class="eyebrow">Specialized therapy</span><h2>How we can help</h2>
    <p class="lede" style="margin-inline:auto">Focused expertise in the conditions that most often go misunderstood, misdiagnosed, or untreated.</p></div>
  <div class="cards">{cards}
    <a class="card reveal" href="{{root}}providers/" style="background:var(--forest);color:#DCE6E0;border:0"><span class="icon" style="background:rgba(255,255,255,.1);color:#fff">{icon("brain")}</span><h3 style="color:#fff">Mind-body conditions</h3><p style="color:#C9D6CF">Support for PNES, POTS, Ehlers-Danlos Syndrome, fibromyalgia and Functional Neurological Disorder when trauma plays a part.</p><span class="more" style="color:#fff">Meet our provider {icon("arrow")}</span></a>
  </div>
</div></section>

<section class="section"><div class="container provider">
  <div class="portrait reveal"><div class="frame"><img src="{{root}}images/brian-robertson.webp" alt="Portrait of Brian J. Robertson, smiling" width="320" height="400" loading="lazy"></div></div>
  <div class="reveal">
    <span class="eyebrow">Meet your therapist</span>
    <h2>Brian J. Robertson</h2>
    <p class="creds">MSW, LCSW, EMDR-C · “Most people know me as Rob.”</p>
    <div class="badges"><span class="badge">{icon("award")} EMDRIA Certified</span><span class="badge">{icon("users")} ISSTD Member</span><span class="badge">{icon("shield")} Complex trauma specialist</span></div>
    <p>Rob works solely with adults whose histories involve complex trauma, including C-PTSD, borderline personality disorder, eating disorders and dissociative disorders. He also has experience supporting survivors of organized and extreme abuse.</p>
    <p>His approach emphasizes compassion, collaboration and evidence-based trauma treatment, always tailored to you.</p>
    {chips(["EMDR", "Cognitive Processing Therapy", "Ego State Therapy", "Internal Family Systems", "Clinical hypnosis", "Somatic therapy", "ACT"])}
    <p style="margin-top:28px"><a class="btn btn-primary" href="{{root}}providers/">Read Rob’s full bio {icon("arrow",18)}</a></p>
  </div>
</div></section>

<section class="section tint"><div class="container">
  <div class="section-head reveal"><span class="eyebrow">Getting started</span><h2>Reaching out is the hardest part. <em>We’ll make the rest simple.</em></h2></div>
  <ol class="steps">
    <li class="reveal"><h3>Reach out</h3><p>Send a short message, email, or call. Share only what you feel comfortable sharing.</p></li>
    <li class="reveal"><h3>Talk it through</h3><p>We’ll be in touch to listen, answer your questions, and see whether we’re the right fit for your needs.</p></li>
    <li class="reveal"><h3>Begin, at your pace</h3><p>Together we’ll build a plan that feels safe and moves toward the life you want to live.</p></li>
  </ol>
</div></section>

<section class="section"><div class="container">
  <div class="section-head reveal" style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap;max-width:none">
    <div><span class="eyebrow">From the blog</span><h2 style="margin:0">Understanding comes first</h2></div>
    <a class="btn btn-ghost" href="{{root}}blog/">All articles {icon("arrow",18)}</a></div>
  <div class="posts">{posts}</div>
</div></section>
{cta_band("{root}")}
'''
    page("", "The Healing Institute, PLLC | Complex Trauma & Dissociation Therapy in Charlotte, NC",
         "Specialized psychotherapy in Charlotte, NC for complex trauma, C-PTSD, dissociative disorders and BPD, with EMDR therapy and clinical hypnosis.",
         body, "home")


# ================================================================= ABOUT
def build_about():
    body = f'''
<section class="page-hero with-image"><div class="container">
  <div class="reveal">{crumbs(("About", None))}
    <span class="eyebrow">Who we are</span>
    <h1>Specialty care, <em>finally</em> in one place.</h1>
    <p class="lede">We are committed to providing exceptional psychotherapy by bringing together the best specialists in the field, so you don’t have to search alone.</p>
  </div>
  <div class="img-wrap reveal"><img src="{{root}}images/sand-frame.webp" alt="A simple wooden frame filled with soft sand, casting a gentle shadow" width="800" height="640"></div>
</div></section>

<section class="section" style="padding-top:clamp(40px,5vw,70px)"><div class="container split" style="align-items:start">
  <div class="reveal"><span class="eyebrow">Our story</span><h2>Born from a gap in care</h2></div>
  <div class="prose reveal">
    <p>The Healing Institute, PLLC was founded by psychotherapist and licensed clinical social worker Brian J. Robertson, MSW, LCSW. Working in the mental healthcare field, he found that people who needed treatment often had a hard time finding subject-matter experts for specific concerns.</p>
    <p>Most people were used to finding therapists for general mental health work. But if their needs were specialized, finding an experienced psychotherapist with those skills was almost impossible.</p>
    <p>Brian saw this gap in specialized providers and decided to build a practice where people with specific needs could find the absolute best care possible. <strong>Thus, the Healing Institute was born.</strong></p>
  </div>
</div></section>

<section class="section dark"><div class="container">
  <div class="section-head reveal"><span class="eyebrow">Our mission</span><h2>To make highly skilled, specialty care accessible in one place.</h2></div>
  <div class="cards">
    <div class="card reveal" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#DCE6E0"><span class="icon" style="background:rgba(255,255,255,.1);color:#fff">{icon("award")}</span><h3 style="color:#fff">Advanced expertise</h3><p style="color:#C9D6CF">We are building a team of elite clinicians, each with specialized training and skills that go beyond standard practice.</p></div>
    <div class="card reveal" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#DCE6E0"><span class="icon" style="background:rgba(255,255,255,.1);color:#fff">{icon("brain")}</span><h3 style="color:#fff">Grounded in science</h3><p style="color:#C9D6CF">Our therapists use neuroscience, cutting-edge techniques, and solid evidence-based approaches to ensure the highest quality of care.</p></div>
    <div class="card reveal" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#DCE6E0"><span class="icon" style="background:rgba(255,255,255,.1);color:#fff">{icon("heart")}</span><h3 style="color:#fff">Person-centered</h3><p style="color:#C9D6CF">We believe in the power of expert, person-centered care to create meaningful change, whatever brings you to us.</p></div>
  </div>
</div></section>

<section class="quote-band section"><div class="container reveal">
  {icon("leaf",34,"leaf")}
  <blockquote>“Regardless of why you are seeking treatment, our expert clinicians are here to provide the advanced support you deserve.”</blockquote>
</div></section>
{cta_band("{root}", "Interested in working together?", "Share a little about what you’re looking for and we’ll be in touch shortly. We can’t wait to hear from you.")}
'''
    page("about/", "About Us", "The Healing Institute was founded by Brian J. Robertson, MSW, LCSW to make highly skilled, specialty psychotherapy accessible in one place in Charlotte, NC.", body, "about", "sand-frame.webp")


# ================================================================= PROVIDERS
def build_providers():
    body = f'''
<section class="page-hero"><div class="container">
  {crumbs(("Our Provider", None))}
  <span class="eyebrow">Our provider</span>
  <h1>A specialist who <em>understands</em> complex trauma.</h1>
  <p class="lede">Expertise matters most when your experiences are complex. Get to know the clinician behind The Healing Institute.</p>
</div></section>

<section class="section" style="padding-top:clamp(20px,3vw,40px)"><div class="container provider">
  <div class="portrait reveal" style="position:sticky;top:110px">
    <div class="frame"><img src="{{root}}images/brian-robertson.webp" alt="Portrait of Brian J. Robertson, smiling" width="320" height="400"></div>
    <div class="form-card" style="margin-top:24px;padding:24px">
      <p style="font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:10px">Specialties</p>
      <ul class="chips"><li>Complex PTSD</li><li>Borderline Personality Disorder</li><li>Eating Disorders</li><li>Dissociative Disorders</li></ul>
      <a class="btn btn-primary" href="{{root}}contact/" style="width:100%;margin-top:20px">Work with Rob</a>
    </div>
  </div>
  <div class="prose reveal">
    <h2 style="margin-top:0">Brian J. Robertson</h2>
    <p class="creds">MSW, LCSW, EMDR-C</p>
    <div class="badges"><span class="badge">{icon("award")} EMDRIA-certified EMDR therapist</span><span class="badge">{icon("users")} Member, ISSTD</span></div>
    <p>My name is Brian Robertson, though most people know me as Rob. I am an EMDRIA-certified EMDR therapist who specializes in working with adults who have experienced complex trauma. Because these conditions require specialized care, I solely treat individuals whose histories involve complex trauma. My clinical focus includes conditions commonly associated with complex trauma, including CPTSD, borderline personality disorder, eating disorders, and dissociative disorders.</p>
    <p>In addition, I have experience supporting survivors of organized abuse, including survivors of child exploitation, sex trafficking, and other forms of coordinated abuse. My work also includes supporting individuals who report experiences of ritual abuse and coercive control within cult environments. I am a member of the International Society for the Study of Trauma and Dissociation and participate in the organization’s Special Interest Group for the Treatment of Organized and Extreme Abuse.</p>
    <h3 style="margin-top:1.6em">How I work</h3>
    <p>My therapeutic approach emphasizes compassion, collaboration, and the use of evidence-based trauma treatments. I also integrate additional trauma-informed approaches depending on each individual’s needs. Some of the primary modalities I use:</p>
    {ul_grid(["EMDR therapy", "Cognitive Processing Therapy (CPT)", "Ego State Therapy", "Internal Family Systems (IFS)", "Clinical hypnosis", "Somatic therapy", "Acceptance &amp; Commitment Therapy (ACT)"])}
    <h3>The mind-body connection</h3>
    <p>Complex trauma can also affect physical health and nervous system functioning. I often help individuals who experience conditions that can be caused or worsened by trauma, including:</p>
    {ul_grid(["Eating disorders", "Psychogenic non-epileptic seizures (PNES)", "POTS", "Ehlers-Danlos Syndrome (EDS)", "Fibromyalgia", "Functional Neurological Disorder"])}
    <p>Approaches that address the mind-body connection, such as somatic therapy and clinical hypnosis, can be particularly helpful for these concerns.</p>
    {callout("I believe that people are not defined by what has happened to them. Healing from trauma involves understanding past experiences while also developing new ways of relating to oneself and the world.", "", "leaf")}
    <p>My approach combines evidence-based trauma therapy with a holistic, person-centered perspective. Therapy is a collaborative process, and I work closely with each client to help them move toward the life they want to live.</p>
    <p>If you are looking for a therapist who specializes in complex trauma, dissociation, or trauma-related conditions, I invite you to reach out. Together we can begin the process of healing and building a path toward greater stability, resilience, and emotional well-being.</p>
  </div>
</div></section>
{cta_band("{root}", "Ready to begin?", "Reach out to Rob to ask a question or request an appointment. Share only what you’re comfortable sharing.")}
'''
    page("providers/", "Our Provider: Brian J. Robertson, MSW, LCSW, EMDR-C",
         "Meet Brian (Rob) Robertson, an EMDRIA-certified EMDR therapist in Charlotte, NC specializing in complex trauma, dissociative disorders, BPD and eating disorders.",
         body, "providers", "brian-robertson.webp")


# ================================================================= SPECIALIZED THERAPY HUB
def build_hub():
    cards = "".join(
        f'<a class="card reveal" href="{{root}}{s}/"><span class="icon">{icon(ic)}</span><h3>{n}</h3><p>{b}</p>'
        f'<span class="more">Learn more {icon("arrow")}</span></a>' for s, n, ic, b in SPECIALTIES)
    body = f'''
<section class="page-hero"><div class="container">
  {crumbs(("Specialized Therapy", None))}
  <span class="eyebrow">Specialized therapy</span>
  <h1>Care that goes <em>beyond</em> general therapy.</h1>
  <p class="lede">Some experiences need a specialist. Explore the conditions we focus on and the evidence-based approaches we use to help people heal.</p>
</div></section>
<section class="section" style="padding-top:20px"><div class="container"><div class="cards">{cards}</div></div></section>
<section class="section mist"><div class="container split">
  <div class="reveal"><span class="eyebrow">Our approach</span><h2>Evidence-based, <em>trauma-informed</em>, and tailored to you.</h2>
    <p>There is no one-size-fits-all path. Depending on your needs, therapy may draw on a combination of approaches designed to build stability first and then gently resolve what’s been stuck.</p></div>
  <div class="reveal">{chips(["EMDR", "Brainspotting", "Dialectical Behavior Therapy (DBT)", "Cognitive Processing Therapy (CPT)", "Internal Family Systems (IFS)", "Ego State Therapy", "Somatic therapy", "Clinical hypnosis", "ACT"])}</div>
</div></section>
{cta_band("{root}")}
'''
    page("specialized-therapy/", "Specialized Therapy",
         "Specialized therapy in Charlotte, NC for complex trauma, dissociative disorders and borderline personality disorder, plus EMDR therapy and clinical hypnosis.",
         body, "specialized-therapy")


# ================================================================= COMPLEX TRAUMA
def build_complex_trauma():
    secs = [
        ("What is complex trauma?",
         "<p>While there is no concrete definition, most clinicians agree that complex trauma describes someone having multiple traumatic events in their lifetime, with the first starting in childhood through either childhood abuse or neglect. Some examples of childhood abuse and neglect are physical abuse, sexual abuse, witnessing other forms of violence in childhood, and severe neglect.</p>"
         "<p>There is also usually some element of attachment injury or attachment wounding that happens with complex trauma as well.</p>"),
        ("What are the signs of complex trauma?",
         "<p>In addition to the typical symptoms of PTSD, such as flashbacks, hypervigilance and physical reactions to memories, someone with complex trauma may also experience:</p>"
         + ul_grid(["Dissociation", "Mood instability", "Emotional numbing", "Significant reactions to perceived abandonment"]) +
         "<p>It is also possible for someone to have few to no PTSD symptoms at all, especially if there is a lot of dissociative amnesia around childhood memories. While most people with complex trauma remember some of the events, others may have no recollection at all due to dissociative amnesia.</p>"
         + callout("If you don’t remember much of your childhood, that doesn’t mean your experiences aren’t real or valid. Memory gaps can themselves be a way the mind protected you.", "", "heart")),
        ("What are the impacts of complex trauma?",
         "<p>Complex trauma can affect us long after the trauma is over. Part of our brain is aware that the trauma has ended, but another part is still stuck in what clinicians refer to as <em>“trauma time.”</em></p>"
         "<p>This can affect our emotional well-being, our functioning at school, work, or in daily life, and our relationships with others. Because complex trauma often includes attachment injury or wounding, it can impact our ability to make and keep relationships.</p>"
         "<p>Complex trauma can also play a part in physiological problems. The Adverse Childhood Experiences (ACE) study found significant links between complex trauma and physical health, even in adulthood.</p>"),
        ("What are the treatments for complex trauma / C-PTSD?",
         "<p>There are many effective treatments for resolving complex trauma:</p>"
         + ul_grid(["EMDR Therapy", "Brainspotting", "Dialectical Behavior Therapy (DBT)", "Cognitive Processing Therapy (CPT)", "Somatic therapy", "Hypnosis", "Internal Family Systems (IFS)", "Ego State Therapy"]) +
         "<p>EMDR and Brainspotting can be good for directly resolving traumatic events. DBT can help with emotion regulation, problematic behaviors, and building stabilization before directly processing traumatic events. Other therapies help in a variety of ways to resolve trauma.</p>"),
    ]
    body = (spec_hero("Complex Trauma / C-PTSD", "Complex Trauma <em>&amp;</em> C-PTSD",
                      "When harm happened again and again, often beginning in childhood, its effects can echo for years. Healing is possible, with care that understands the whole picture.",
                      "complex-trauma.webp", "A person sitting quietly by a bright window, knees drawn up, looking outside")
            + article(secs, callout("If you are interested in learning more about healing from complex trauma, please <a href=\"{root}contact/\">reach out to us</a>.", "warm", "sun"))
            + related("complex-trauma-therapy") + cta_band("{root}"))
    page("complex-trauma-therapy/", "Complex Trauma & C-PTSD Therapy",
         "Specialized complex trauma and C-PTSD therapy in Charlotte, NC. Learn the signs and impacts of complex trauma and treatments like EMDR, DBT, IFS and somatic therapy.",
         body, "complex-trauma-therapy", "complex-trauma.webp")


# ================================================================= DISSOCIATIVE
def build_dissociative():
    secs = [
        ("What is a dissociative disorder?",
         "<p>A dissociative disorder is an ongoing condition where a person’s consciousness becomes detached from certain experiences, thoughts, emotions, memories, sensations, or even aspects of their identity. Most dissociative disorders are caused by childhood trauma and abuse, starting early in childhood.</p>"
         + callout("Dissociative disorders were once thought to be rare, but research over the last 20 years estimates that <strong>roughly 10% of the general population</strong> has a dissociative disorder. You are not alone.", "", "users")),
        ("What are some possible symptoms?",
         "<p>It depends on the specific dissociative disorder, but some common symptoms include:</p>"
         + ul_grid(["Amnesia or poor memory of childhood", "Feeling outside of your body", "Difficulty recognizing yourself in the mirror", "Temporary loss of knowledge", "Blackouts (not caused by drugs, alcohol, or medications)", "Thoughts, emotions, impulses, or behaviors that don’t feel like yours"]) +
         "<p>This is not an all-inclusive list. Dissociative disorders are very complex and difficult to detect. A diagnosis should only come from a professional who specializes in this area, as it requires extensive testing.</p>"),
        ("What are the treatment options?",
         "<p>Since dissociative disorders almost always stem from early childhood trauma, the best treatment options are trauma-focused, as treating the trauma treats the dissociative disorder.</p>"
         "<p>Two of the most common trauma treatments for dissociative disorders are Eye Movement Desensitization and Reprocessing (EMDR) therapy and Brainspotting. Because treating dissociative disorders also involves parts work, incorporating Internal Family Systems (IFS) or ego state therapy is usually needed.</p>"
         + ul_grid(["EMDR therapy", "Brainspotting", "Internal Family Systems (IFS)", "Ego State Therapy", "Somatic therapy", "Clinical hypnosis"]) +
         "<p>Other approaches, such as somatic therapy or hypnosis, can be useful for treating other aspects of dissociative disorders.</p>"),
    ]
    extra = (callout("If you think you may be experiencing a dissociative disorder, please <a href=\"{root}contact/\">reach out to us</a> to see how we can help.", "warm", "sun")
             + '<div class="sources"><h3>Sources</h3><p>Sar, Vedat. “Epidemiology of Dissociative Disorders: An Overview.” <em>Epidemiology Research International</em>, 2011. <a href="https://doi.org/10.1155/2011/404538" rel="noopener">https://doi.org/10.1155/2011/404538</a></p></div>')
    body = (spec_hero("Dissociative Disorders", "Dissociative Disorders",
                      "Memory gaps, feeling far away from yourself, or parts of you that don’t feel like you. These are often the mind’s brilliant way of surviving. Specialist care can help.",
                      "dissociative.webp", "A man sitting in a leather armchair in a dim room, resting his head in his hand")
            + article(secs, extra) + related("dissociative-disorders") + cta_band("{root}"))
    page("dissociative-disorders/", "Dissociative Disorders Treatment",
         "Specialist treatment for dissociative disorders in Charlotte, NC. Learn common symptoms and trauma-focused treatments including EMDR, Brainspotting, IFS and ego state therapy.",
         body, "dissociative-disorders", "dissociative.webp")


# ================================================================= BPD
def build_bpd():
    signs = [
        ("Frantic efforts to avoid real or imagined abandonment",
         "Becoming highly distressed when someone cancels plans, making drastic attempts to keep someone from leaving a relationship, preemptively withdrawing emotionally to reduce the anticipated pain of abandonment or rejection, excessively seeking reassurance, or becoming angry when someone appears distant."),
        ("Unstable, intense relationships",
         "Rapidly shifting from viewing someone as wonderful to viewing them as terrible, abruptly ending relationships after conflict, quickly entering relationships that feel intense and are short-lived, or dramatic shifts in how we view someone without any obvious change in their behavior."),
        ("Unstable self-image or sense of self",
         "Frequently changing plans for the future, feeling like your identity changes based on the situation and who is present, difficulty identifying preferences because of automatically taking on someone else’s, internal conflict about goals and values, or frequently changing career, educational, or life goals."),
        ("Impulsivity in potentially self-damaging areas",
         "Substance use, impulsive spending, gambling, binge eating, unsafe sexual behavior, or abruptly making major life decisions without considering the consequences."),
        ("Recurrent suicidal behavior, threats, or self-harm",
         "Suicide attempts, recurrent suicidal threats, internal suicidal fantasies, or self-harm through cutting, burning, etc. <strong>If you are in danger right now, please call or text <a href=\"tel:988\">988</a> or call <a href=\"tel:911\">911</a>.</strong>"),
        ("Affect (mood) instability",
         "Rapid mood shifts following interpersonal triggers, disproportionate responses to perceived rejection, emotional flooding followed by rapid shifts back to baseline, or abrupt internal transitions from attachment and security to fear or rage."),
        ("Chronic feelings of emptiness",
         "Feeling empty or hollow, repeatedly seeking stimulation or relationships to escape emptiness, difficulty tolerating being alone, feeling like something is fundamentally missing from your life, or chronically feeling blank, numb, or unreal."),
        ("Intense or hard-to-control anger",
         "Frequent arguments, explosive anger, rumination about perceived mistreatment, rapid internal escalation in response to perceived rejection, or self-directed anger replacing outwardly expressed anger."),
        ("Stress-related paranoia or severe dissociation",
         "Memory gaps associated with stressful situations, internally questioning everyone’s motives, becoming suspicious of others conspiring against you during times of stress, feeling detached from your body, depersonalization/derealization, or experiencing yourself as “not me.”"),
    ]
    acc = '<div class="accordion">' + "".join(
        f'<details><summary><span class="label">Sign {i+1} of 9</span>{t}</summary><div class="acc-body"><p><strong>Examples:</strong> {e}</p></div></details>'
        for i, (t, e) in enumerate(signs)) + "</div>"
    secs = [
        ("What is Borderline Personality Disorder?",
         "<p>Borderline Personality Disorder, or BPD, is a mental health condition characterized by emotional dysregulation, an unstable or absent sense of self, difficulties with interpersonal relationships, and heightened sensitivity to perceived or real rejection or abandonment. The prevalence of BPD is thought to be around 6% of the general population.</p>"),
        ("What causes BPD?",
         "<p>Through the lens of structural dissociation, BPD appears to be caused by complex childhood trauma and attachment injury, or attachment wounding. This is consistent with most people with BPD having some dissociative amnesia from childhood.</p>"
         + callout("The symptoms and behaviors of BPD are the result of a <strong>survival mechanism</strong>: the mind’s way of trying to survive complex trauma in childhood. They are not character flaws.", "", "shield") +
         "<p>Take, for example, an unstable or absent sense of self. This is caused by traumatic dissociation and parts activity, commonly found in people with complex trauma. Another example is heightened sensitivity to perceived or real rejection or abandonment. In terms of attachment injury, this would have been important for recognizing danger in traumatic situations.</p>"),
        ("Signs and symptoms",
         "<p>Tap any sign below to read real-life examples. Recognizing yourself in some of these is not a diagnosis, but it can be a helpful starting point for a conversation.</p>" + acc),
        ("Treatment options",
         "<p>One of the most effective treatments for BPD is Dialectical Behavior Therapy, or DBT. It is especially helpful for stabilizing our lives and helping us respond better to the events in them. People with BPD can often feel like they are spinning their wheels, and DBT is designed to help with that by focusing on four skill areas:</p>"
         + ul_grid(["Distress tolerance", "Emotion regulation", "Mindfulness", "Interpersonal effectiveness"]) +
         "<p>For the complex trauma elements, modalities like Eye Movement Desensitization and Reprocessing (EMDR) therapy, Brainspotting, or Cognitive Processing Therapy (CPT) can be helpful.</p>"),
    ]
    body = (spec_hero("Borderline Personality Disorder", "Borderline Personality Disorder",
                      "Intense emotions, a shifting sense of self, and deep fear of being left can be exhausting. These patterns made sense once, and with the right support, they can change.")
            + article(secs, callout("If you are struggling with Borderline Personality Disorder, <a href=\"{root}contact/\">reach out to us</a> to see how we can help.", "warm", "sun"))
            + related("borderline-personality-disorder") + cta_band("{root}"))
    page("borderline-personality-disorder/", "Borderline Personality Disorder (BPD) Therapy",
         "Compassionate, trauma-informed therapy for Borderline Personality Disorder in Charlotte, NC, including DBT, EMDR, Brainspotting and CPT.",
         body, "borderline-personality-disorder")


# ================================================================= EMDR
def build_emdr():
    secs = [
        ("What is EMDR therapy?",
         "<p>EMDR stands for Eye Movement Desensitization and Reprocessing therapy. Originally created by Francine Shapiro to treat trauma, today it is used to treat a wide variety of issues.</p>"
         "<p>Unlike some therapies that are very cognitive-based, EMDR takes advantage of our brain’s built-in healing network, called the <strong>Adaptive Information Processing (AIP)</strong> network, to heal maladaptive or dysfunctional networks.</p>"
         + callout("This is the same healing network our brain uses during our deepest cycle of sleep to heal and regenerate, just like any other organ in the body. In EMDR, certain eye movements are used to activate this network and direct it toward the brain networks that are causing difficulty.", "", "brain")),
        ("What can EMDR help with?",
         "<p>EMDR requires extensive training to practice and can be used to treat a wide variety of issues, including:</p>"
         + ul_grid(["Trauma / PTSD", "Depression", "Anxiety", "Addiction / substance use", "Behavioral issues", "Obsessive-compulsive disorder", "Eating disorders", "Dissociative disorders", "And more"])),
        ("Why work with a certified EMDR therapist?",
         "<p>Our founder, Brian (Rob) Robertson, is an <strong>EMDRIA-certified EMDR therapist</strong>, a credential that reflects advanced training and supervised experience beyond basic EMDR training. That depth matters, especially when working with complex trauma and dissociation.</p>"
         '<p><a class="btn btn-ghost" href="{root}providers/">Meet Rob ' + icon("arrow", 18) + "</a></p>"),
    ]
    body = (spec_hero("EMDR Therapy", "EMDR Therapy",
                      "A well-researched therapy that works with your brain’s natural ability to heal, helping painful memories lose their grip without having to talk through every detail.")
            + article(secs, callout("Contact us today to <a href=\"{root}contact/\">learn more about how EMDR may be able to help you</a>.", "warm", "sun"))
            + related("emdr-therapy") + cta_band("{root}"))
    page("emdr-therapy/", "EMDR Therapy",
         "EMDR therapy in Charlotte, NC with an EMDRIA-certified therapist. Learn how EMDR helps with trauma/PTSD, anxiety, depression, eating disorders and dissociative disorders.",
         body, "emdr-therapy")


# ================================================================= HYPNOSIS
def build_hypnosis():
    faqs = [
        ("Will I lose control?",
         "<p>No. Hypnosis isn’t about controlling someone or taking control. If anything, hypnosis gives you more control than you thought possible. During hypnosis, you can bypass certain maladaptive mechanisms that may be getting in your way, such as harsh self-judgment, paralyzing fear, indecisiveness, or the inability to observe something without becoming overwhelmed.</p><p>For example, someone might seek hypnosis to overcome an addiction like smoking or binge eating. Those habits often feel like they control us, but hypnosis can help us take that control back.</p>"),
        ("Will I do things I don’t want to do?",
         "<p>No. In hypnosis, it is impossible to get someone to do something they don’t want to do. Real hypnosis is not like what you see on TV or at entertainment shows. Clinical hypnosis isn’t about “doing.” It’s about calming the mind and creating a state of focus that allows you to gain new thoughts, insights, perspectives, and abilities that weren’t available before.</p>"),
        ("Can anyone perform hypnosis?",
         "<p>Hypnosis should only be performed by a trained professional, especially for clinical applications. Learning clinical hypnosis takes a lot of work and training. It is a difficult skill to learn, even for professionals.</p>"),
        ("Can anyone be hypnotized?",
         "<p>This is often debated in the clinical community. Some people are more hypnotizable and some are less. People who are more hypnotizable tend to experience more hypnotic phenomena in everyday life. These may include people with PTSD, dissociative disorders, ADHD, or very imaginative thinkers. People who are less hypnotizable are generally very analytical or literal thinkers.</p><p>That doesn’t mean less hypnotizable people can’t benefit. There is usually some preparation in therapy to make it easier. What matters most is good therapeutic rapport and a desire for hypnosis to work.</p>"),
        ("Is hypnosis safe?",
         "<p>In general, hypnosis is considered very safe when conducted by a trained clinical professional. You don’t lose consciousness or free will, and you can’t get “stuck” in hypnosis. If you’ve ever meditated, you’ve probably been in a similar state before. The risks are usually no different from any other form of therapy.</p><p>As a precaution, we always leave at least 5–10 minutes at the end of a session to debrief on what you experienced and learned, and to make sure you are fully alert and oriented. As always, discuss any questions or concerns with your provider beforehand.</p>"),
        ("What does hypnosis therapy look like?",
         "<p>Hypnosis is tailored to the individual. You and your therapist work together on a plan beforehand, answer any questions, and discuss any concerns. Hypnosis is not a standalone therapy and is often used in conjunction with other therapies.</p>"),
    ]
    acc = '<div class="accordion">' + "".join(
        f'<details{" open" if i == 0 else ""}><summary>{q}</summary><div class="acc-body">{a}</div></details>'
        for i, (q, a) in enumerate(faqs)) + "</div>"
    secs = [
        ("What is hypnosis?",
         "<p>Humans move through different states of trance all the time. When we are absorbed in a story or a TV show, we are in a state of trance. When we are deep in concentration, or relaxed, we are in trance. These everyday trance phenomena happen all around us.</p>"
         "<p>Hypnosis uses a variety of techniques that take advantage of these normal states to create deep focus and relaxation. This can help us make insights and connections we couldn’t see before, or resolve blocks we couldn’t move past.</p>"
         + callout("Hypnosis is not a stand-alone therapy. It is usually combined with other approaches, such as CBT or EMDR.", "", "info")),
        ("What can hypnosis help with?",
         "<p><strong>Mental health conditions</strong></p>"
         + ul_grid(["Depression", "Anxiety", "Panic attacks", "Phobias", "PTSD", "Eating disorders like binge eating"]) +
         "<p><strong>Mind-body and physical conditions</strong></p>"
         + ul_grid(["Chronic pain", "Insomnia", "Fibromyalgia", "Functional neurological disorder", "Psychogenic non-epileptic seizures", "Ehlers-Danlos syndrome", "Migraines", "Nausea", "And more"])),
        ("Common questions &amp; misconceptions", acc),
    ]
    body = (spec_hero("Hypnosis", "Clinical Hypnosis",
                      "Not stage tricks, and never about losing control. Clinical hypnosis is a calm, focused state that can open new insight and support healing, especially for mind-body symptoms.",
                      "hypnosis.webp", "A hand gently placing a small stone on top of a balanced stack of stones by the sea")
            + article(secs, callout("If you want to find out more about how hypnosis might benefit you, please <a href=\"{root}contact/\">reach out to us</a>.", "warm", "sun"))
            + related("hypnosis") + cta_band("{root}"))
    page("hypnosis/", "Clinical Hypnosis Therapy",
         "Clinical hypnosis in Charlotte, NC for anxiety, PTSD, panic, chronic pain, FND, PNES and more. Answers to common questions about safety and control.",
         body, "hypnosis", "hypnosis.webp")


# ================================================================= BLOG
def post_card(p):
    return (f'<a class="post-card reveal" href="{{root}}blog/{p["slug"]}/"><div class="thumb"><img src="{{root}}images/{p["image"]}" alt="" loading="lazy" width="800" height="450"></div>'
            f'<div class="body"><div class="meta"><time datetime="{p["iso"]}">{p["date"]}</time><i></i>{p["read"]}</div>'
            f'<h3>{p["title"]}</h3><p>{p["excerpt"]}</p><span class="more" style="margin-top:auto;font-weight:600;color:var(--forest);display:inline-flex;gap:8px;align-items:center">Read article {icon("arrow",16)}</span></div></a>')


def build_blog():
    posts = "".join(post_card(p) for p in POSTS)
    body = f'''
<section class="page-hero"><div class="container">
  {crumbs(("Blog", None))}
  <span class="eyebrow">The blog</span>
  <h1>Clear, compassionate <em>insight</em>.</h1>
  <p class="lede">Articles on complex trauma, dissociation and the mind-body connection, written to replace myths with understanding.</p>
</div></section>
<section class="section" style="padding-top:20px"><div class="container"><div class="posts">{posts}</div></div></section>
{cta_band("{root}")}
'''
    page("blog/", "Blog", "Articles from The Healing Institute on complex trauma, dissociative disorders, FND and the mind-body connection.", body, "blog")


def build_post(i, sections_html, sources_html, more_html=""):
    p = POSTS[i]
    prev_p = POSTS[i + 1] if i + 1 < len(POSTS) else None
    next_p = POSTS[i - 1] if i > 0 else None
    nav = '<div class="post-nav">'
    if prev_p:
        nav += f'<a href="{{root}}blog/{prev_p["slug"]}/"><span>← Previous</span>{prev_p["title"]}</a>'
    if next_p:
        nav += f'<a class="next" href="{{root}}blog/{next_p["slug"]}/"><span>Next →</span>{next_p["title"]}</a>'
    nav += "</div>"
    tags = '<ul class="tags">' + "".join(f"<li>{t}</li>" for t in p["tags"]) + "</ul>"
    body = f'''
<article>
<section class="page-hero"><div class="container post-head">
  {crumbs(("Blog", "{root}blog/"), (p["title"], None))}
  <div class="meta"><time datetime="{p["iso"]}">{p["date"]}</time><i></i>{p["read"]}</div>
  <h1 style="font-size:clamp(2.1rem,4.4vw,3.5rem)">{p["title"]}</h1>
  <div class="author"><img src="{{root}}images/brian-robertson.webp" alt="" width="52" height="52"><div><strong>Brian Robertson</strong><span>MSW, LCSW, EMDR-C</span></div></div>
</div></section>
<section class="section" style="padding-top:10px"><div class="container">
  <div class="img-wrap" style="border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:21/9;box-shadow:var(--shadow);margin-bottom:clamp(36px,5vw,60px)"><img src="{{root}}images/{p["image"]}" alt="" style="width:100%;height:100%;object-fit:cover"></div>
  <div class="prose" style="margin-inline:auto">{sections_html}{more_html}<div class="sources"><h3>Sources</h3>{sources_html}</div>{tags}{nav}</div>
</div></section>
</article>
{cta_band("{root}")}
'''
    page(f"blog/{p['slug']}/", p["title"], p["excerpt"], body, "blog", p["image"])


def build_post_myths():
    s = '''<p class="lede" style="max-width:none">Dissociative disorders are among the most misunderstood conditions in mental health. Popular media often portrays dissociation, particularly Dissociative Identity Disorder (DID), as dramatic, bizarre, or inherently dangerous. These portrayals contribute to stigma and can make it harder for people experiencing dissociative symptoms to recognize what is happening or seek appropriate treatment.</p>
<p>The purpose of this post is to outline the most common myths and misconceptions about dissociative disorders and replace them with facts.</p>
<h2>Myth #1: Dissociative disorders are rare.</h2>
<p>It has often been said that dissociative disorders are extremely rare. Even some in the scientific community say so. While dissociative disorders are very hard to diagnose, data show they aren’t as rare as people think. Most studies put the prevalence of dissociative disorders in the general population at around <strong>10%, or about 1 in every 10 people</strong>. Considering that dissociative disorders result from complex trauma, and complex trauma isn’t rare, this makes sense.</p>
<h2>Myth #2: Dissociative disorders are obvious and easily noticed.</h2>
<p>Dissociative disorders aren’t easily seen and are very hard to diagnose. TV and movies portray someone with a dissociative disorder, usually DID, as having “multiple personalities” and completely switching character in front of others. That’s just for TV. In real life, only about 4–6% of people with DID present with overt symptoms of self-state switching, and even then it is hard for most people to notice.</p>
<p>Dissociative disorders are also commonly misdiagnosed as other conditions like bipolar disorder, schizophrenia, borderline personality disorder, or OCD. In fact, most people with a dissociative disorder spend about <strong>5–7 years</strong> in the mental health system before receiving the proper diagnosis.</p>
<h2>Myth #3: People with dissociative disorders have “split personalities.”</h2>
<p>People with dissociative disorders don’t have split personalities. Think about it this way: you are not the same person as a co-worker, a friend, a sibling, a partner, or a parent. And yet these are all different parts of you that make up who you are, and it all feels like you.</p>
<p>For someone with a dissociative disorder, those parts feel separate. Sometimes they are even separated by amnesia; other times they aren’t. Each part has a purpose behind its existence, because it was necessary for survival during times of trauma. For example, there may be a part whose job is to hold the trauma memories and keep them separate from consciousness, or a protective part whose job is to keep us from discovering those memories.</p>
<h2>Myth #4: Anyone can develop a dissociative disorder at any time.</h2>
<p>Several factors make someone susceptible to developing a dissociative disorder: there must be complex childhood trauma, there must be multiple traumatic events, and those events start before age 6 (on average, before age 4). The type of trauma matters too. For example, while childhood emotional abuse can be traumatizing, it has a lower correlation with dissociative disorders than physical and sexual abuse.</p>
<p>A dissociative disorder develops during childhood as a protective mechanism to survive the trauma. This means someone cannot develop a dissociative disorder like DID or OSDD as an adult.</p>
<h2>Myth #5: People with dissociative disorders are dangerous.</h2>
<p>People with dissociative disorders are no more dangerous than anyone else in the general population. This myth likely comes from depictions on TV and in movies. Because of re-traumatization, people with dissociative disorders are far more likely to be victims than perpetrators.</p>
'''
    more = '<div class="callout">' + icon("info") + '<div><p>If you are interested in learning more about dissociative disorders, you can visit <a href="https://did-research.org/" rel="noopener">did-research.org</a> and <a href="https://www.isst-d.org/" rel="noopener">isst-d.org</a>.</p></div></div>'
    src = '''<p>Sar, Vedat. Epidemiology of Dissociative Disorders: An Overview. <em>Epidemiology Research International</em>, 2011. <a href="https://doi.org/10.1155/2011/404538" rel="noopener">https://doi.org/10.1155/2011/404538</a></p>
<p>Vonderlin R, Kleindienst N, Alpers GW, Bohus M, Lyssenko L, Schmahl C. Dissociation in victims of childhood abuse or neglect: a meta-analytic review. <em>Psychological Medicine</em>. 2018;48(15):2467–2476. doi:10.1017/S0033291718000740</p>'''
    build_post(0, s, src, more)


def build_post_fnd():
    s = '''<p class="lede" style="max-width:none">The short answer: it’s possible. The truth is, we don’t fully know what causes it. Many people with Functional Neurological Disorder (FND) have no history of complex trauma. However, plenty of studies show a correlation between complex childhood trauma and FND. One study found a correlation between adverse childhood experiences and FND symptom severity. But before we answer whether trauma can cause FND, let’s first talk about what it is.</p>
<h2>What is Functional Neurological Disorder?</h2>
<p>Functional Neurological Disorder, or FND, is a neurological condition caused by changes in how the brain works. This is different from other neurological disorders that involve changes to the brain’s structure itself. With FND, there are changes in the connections between different brain regions. Think of it as different parts of the brain that aren’t communicating well with each other, rather than a physical alteration to the brain.</p>
<p>A person with FND can have a wide variety of physical and mental symptoms, which may include:</p>
<ul class="grid-list"><li>Seizure-like episodes</li><li>Movement problems</li><li>Problems with cognitive functioning</li><li>Problems with vision or hearing</li><li>Dissociative symptoms</li><li>Involuntary muscle movements or spasms</li><li>Numbness</li><li>Pain</li><li>Dysautonomic issues</li></ul>
<p>FND usually requires a neurologist to diagnose. It is hard to diagnose and often requires a lot of testing to rule out other conditions. Symptoms can present at any time in life. In my experience as a therapist, when FND does have links to trauma, it often presents during times of high stress or when a trigger related to a past traumatic event is present. In many cases, symptoms are not constant. Most are short-lived, going dormant until there is another trigger.</p>
<h2>Interoception and FND</h2>
<p>One thing FND seems to impair is <strong>interoception</strong>: our brain and nervous system’s ability to sense, interpret, and integrate signals from inside the body. It allows us to be aware of internal states such as hunger, thirst, temperature, and pain. Interoception also helps the body maintain homeostasis by allowing the brain to communicate with other organs, for example regulating blood pressure as we stand up.</p>
<p>Interoception is also responsible for awareness of our thoughts and emotions. Think of it as the hub for interpreting and integrating all the signals from our body, along with our thoughts and emotions. This is especially true because all emotions have a physical “felt sense.” In FND, symptoms can sometimes be brought on by intense emotions.</p>
<p>Interoception is controlled by a part of the brain called the insula, or insular cortex. Many things can cause a disconnect or dysregulation between the insula and other areas of the brain, in turn affecting interoception. One thing we know impacts the insula and interoception is trauma history. Does this mean trauma causes FND? Not necessarily, but let’s examine other links between trauma and FND.</p>
<h2>The link between dissociative disorders and FND</h2>
<p>Research over the years points to high comorbidity between FND and dissociative disorders. A dissociative disorder is an ongoing condition where a person’s consciousness becomes detached from certain experiences, thoughts, emotions, memories, sensations, or even aspects of their identity. Dissociative disorders are caused by extensive complex childhood trauma, usually starting at a young age. It was the brain’s way of adapting and surviving during those years, and it continues because that part of the brain doesn’t realize the trauma is over.</p>
<p>While it’s possible to have a dissociative disorder without FND, and FND without a dissociative disorder, comorbidity between the two may be <strong>as high as 80%</strong>. Dissociation is thought to be one of the main mechanisms behind loss of interoception and possibly many FND symptoms. One study found that DES-II scores (used to measure dissociation) in FND were nearly as high as those in dissociative disorders.</p>
<h2>Conclusions</h2>
<p>While there is no way to say definitively whether trauma is the origin or cause of FND, there are some compelling links. It makes sense that complex trauma, already known to cause significant dissociative symptoms, could change how neurons connect through the impairment of interoception. We already know from the ACE (Adverse Childhood Experiences) study that complex trauma greatly increases the risk of developing many physiological issues. If some of those issues are neurological in nature, why couldn’t trauma be a cause?</p>
<p>And if trauma is the cause, does that mean FND symptoms can be resolved? What I can say is that, in my experience, where there is a link between FND symptoms and someone’s trauma history, <strong>resolving the trauma can have a profound effect</strong> on existing FND symptoms.</p>
'''
    more = '<div class="callout">' + icon("info") + '<div><p>For more information on FND, visit <a href="https://fndhope.org/" rel="noopener">fndhope.org</a>.</p></div></div>'
    src = '''<p>Campbell, M. C., Smakowski, A., Rojas-Aguiluz, M., Goldstein, L. H., Cardeña, E., Nicholson, T. R., Reinders, A. A., &amp; Pick, S. (2022). Dissociation and its biological and clinical associations in Functional Neurological disorder: Systematic review and meta-analysis. <em>BJPsych Open</em>, 9(1). <a href="https://doi.org/10.1192/bjo.2022.597" rel="noopener">https://doi.org/10.1192/bjo.2022.597</a></p>
<p>National Institute of Neurological Disorders and Stroke. (2026, March 13). Functional neurologic disorder. <a href="https://www.ninds.nih.gov/health-information/disorders/functional-neurologic-disorder" rel="noopener">ninds.nih.gov</a></p>
<p>Paredes-Echeverri, S., Guthrie, A. J., &amp; Perez, D. L. (2022). Toward a possible trauma subtype of functional neurological disorder: Impact on symptom severity and physical health. <em>Frontiers in Psychiatry</em>, 13. <a href="https://doi.org/10.3389/fpsyt.2022.1040911" rel="noopener">https://doi.org/10.3389/fpsyt.2022.1040911</a></p>
<p>Pick, S., Rojas-Aguiluz, M., Butler, M., Mulrenan, H., Nicholson, T. R., &amp; Goldstein, L. H. (2020). Dissociation and interoception in functional neurological disorder. <em>Cognitive Neuropsychiatry</em>, 25(4), 294–311. <a href="https://doi.org/10.1080/13546805.2020.1791061" rel="noopener">https://doi.org/10.1080/13546805.2020.1791061</a></p>'''
    build_post(1, s, src, more)


# ================================================================= CONTACT
def build_contact():
    opts = "".join(f"<option>{n}</option>" for _, n, _, _ in SPECIALTIES)
    body = f'''
<section class="page-hero"><div class="container">
  {crumbs(("Contact", None))}
  <span class="eyebrow">Contact us</span>
  <h1>Let’s <em>talk</em>.</h1>
  <p class="lede">Reaching out can take courage. Fill out the form, email, or call, whichever feels easiest. We’ll be in touch shortly.</p>
</div></section>
<section class="section" style="padding-top:10px"><div class="container contact-grid">
  <div class="reveal">
    <ul class="contact-list">
      <li><a href="{PHONE_HREF}"><span class="ic">{icon("phone")}</span><span><small>Call</small><strong>{PHONE}</strong></span></a></li>
      <li><a href="mailto:{EMAIL}"><span class="ic">{icon("mail")}</span><span><small>Email</small><strong>{EMAIL}</strong></span></a></li>
      <li><div><span class="ic">{icon("pin")}</span><span><small>Office · by appointment only</small><strong>{ADDRESS_1}<br>{ADDRESS_2}</strong></span></div></li>
    </ul>
    <div class="map"><iframe title="Map to The Healing Institute" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q={MAP_Q}&amp;output=embed"></iframe></div>
    {callout("<strong>In crisis?</strong> We’re unable to respond to emergencies through this site. Call or text <a href=\"tel:988\">988</a> or call <a href=\"tel:911\">911</a>.", "warm", "lifebuoy")}
  </div>
  <div class="form-card reveal">
    <h2 style="font-size:1.9rem">Send a message</h2>
    <p style="color:var(--muted)">Interested in working together? Share a little info and we’ll be in touch. We can’t wait to hear from you.</p>
    <form id="contact-form" data-to="{EMAIL}" novalidate>
      <div class="form-row">
        <div class="field"><label for="name">Name</label><input id="name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="phone">Phone <span>(optional)</span></label><input id="phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="method">Best way to reach you</label><select id="method" name="method"><option>Email</option><option>Phone call</option><option>Text</option><option>Either is fine</option></select></div>
      </div>
      <div class="field"><label for="interest">I’m interested in <span>(optional)</span></label><select id="interest" name="interest"><option>Not sure yet</option>{opts}<option>Mind-body conditions (FND, PNES, POTS, etc.)</option></select></div>
      <div class="field"><label for="message">How can we help? <span>(optional)</span></label><textarea id="message" name="message" placeholder="A sentence or two is plenty."></textarea></div>
      <p class="privacy-note">{icon("lock")}<span>For your privacy, please don’t include detailed health or trauma history here. We’ll talk about what matters to you in a confidential setting.</span></p>
      <button class="btn btn-primary" type="submit" style="width:100%">Send message {icon("arrow",18)}</button>
      <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</div></section>
'''
    page("contact/", "Contact Us", "Contact The Healing Institute in Charlotte, NC. Call (704) 284-9288, email, or send a message to request an appointment.", body, "contact")


def build_404():
    body = f'''<section class="section"><div class="container" style="text-align:center;max-width:680px">
  {icon("leaf",40,"leaf")}<h1>This page wandered off.</h1>
  <p class="lede" style="margin-inline:auto">The page you’re looking for isn’t here, but you are in the right place.</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="/">Go home</a><a class="btn btn-ghost" href="/contact/">Contact us</a></div>
</div></section>'''
    page("404.html", "Page not found", "Page not found.", body)


def build_favicon():
    os.makedirs(os.path.join(OUT, "assets"), exist_ok=True)
    with open(os.path.join(OUT, "assets", "favicon.svg"), "w") as f:
        f.write(LOGO.replace('width="42" height="42" ', 'xmlns="http://www.w3.org/2000/svg" '))


if __name__ == "__main__":
    build_favicon()
    build_home()
    build_about()
    build_providers()
    build_hub()
    build_complex_trauma()
    build_dissociative()
    build_bpd()
    build_emdr()
    build_hypnosis()
    build_blog()
    build_post_myths()
    build_post_fnd()
    build_contact()
    build_404()
