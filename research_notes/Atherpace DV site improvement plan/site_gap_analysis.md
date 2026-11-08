# atherpace.org vs. Leading DV Resource Websites: Gap Analysis

Research date: 2026-11-08. The repo source is `/home/user/cristina/site/` (`index.html`, `.htaccess`, `images/`). The live site was fetched with curl on 2026-11-08 and returned HTTP 200. Its visible text is identical to the repo. Only the inline CSS differs (21 KB live vs. 14 KB in the repo), so the live site carries a newer styling pass that is not in this checkout.

## What exactly is on atherpace.org now?

### Takeaway
At Her Pace is a privacy-maximal, single-file static directory with very strong safety engineering: a strict CSP, no trackers, no cookies, no forms that submit, a quick exit plus a "Hide page", and honest limitation copy. As a resource, though, it is thin. It has no original content. It gives three outbound links per state, two of them WomensLaw, and the remaining handful of national links point to The Hotline, RAINN, 211 and NNEDV. It is almost invisible to search engines: one URL, the generic title "Resource guide", no sitemap, and no DV keywords in its metadata.

### Cited Findings (from source code and live fetch)
**Tech stack and hosting**
- The whole site is one hand-written `index.html` (about 164 KB) with inline CSS and one inline script (about 84 KB, mostly a `window.STATE_RESOURCES` JSON array). There is no framework, no build step and no CMS. "Pages" are hidden `<section>`s switched by hash (`#page-home`, `#page-connect`, `#page-states`, `#page-about`, `#page-privacy`, `#page-terms`, `#page-accessibility`). Hosting is SiteGround (nginx), per the git log ("Host At Her Pace on SiteGround") and the privacy page. — repo `/home/user/cristina/site/index.html`; live https://atherpace.org/
- Security headers are excellent:
  - The meta CSP is `default-src 'none'` with hash-pinned script and style, plus `connect-src 'none'` and `form-action 'none'`.
  - `.htaccess`/live headers set `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Permissions-Policy: geolocation=(), camera=(), microphone=()`, HSTS of 1 year, nosniff, a forced HTTPS redirect and `Options -Indexes`.
  - The page also sets `<meta name="robots" content="noarchive">`, so no search-engine cached copy is kept.
  - — live `curl -I https://atherpace.org/`
- There are no analytics, cookies, third-party fonts, embeds or maps. Selections are not stored in storage or the URL. Autocomplete is off on selects. — privacy page text in source
- SEO plumbing is minimal:
  - The `<title>` is "Resource guide", deliberately neutral.
  - The meta description reads "An independent directory of public resources and practical information by U.S. state." It never mentions domestic violence or abuse.
  - There are no Open Graph tags, no canonical, and no JSON-LD.
  - `/robots.txt` contains only `User-agent: *` and `Crawl-delay: 10`.
  - `/sitemap.xml` returns 404.
  - — live fetch 2026-11-08
- Images: `logo.png` is 87 KB, served at a native 1942x809 for a header logo. Two illustrations are about 210–225 KB JPEGs at 1536x1024 with `loading="lazy"`. — `/home/user/cristina/site/images`

**Pages and sections (home)**
- The safety banner on every view reads "Online activity can be monitored. Quick exit does not erase history." with a "Browsing safety" link.
- The header has nav ("Find help by state", "Explore your options", "Common questions"), a **Hide page** button and a **Quick exit ↗** button.
- The hero reads "Find support. At your pace. If someone is hurting, frightening, or controlling you…". It has the CTAs "Find help in your state" and "Talk with an advocate" (to thehotline.org/get-help) and a state plus need form. The need options are: not sure; someone to talk to; a place to stay; legal; food/bills; safety/tech.
- Trust chips: "50 states + Washington, DC · No personal-story form · Free-to-access information".
- The hotline callout reads: "800-799-7233 (tel: link), text START to 88788, or visit its website to chat". It is the only phone number displayed prominently, apart from the specialist cards.
- The state guide (a second state/need selector) renders three cards per state. A "Clear my selections" button is included.
- "Unsure where to start?": six question-framed paths, all outbound:
  - "Is what's happening okay?" goes to Hotline identify-abuse.
  - "I want to think about safety" goes to Hotline safety planning.
  - "I'm worried about my phone" goes to techsafety.org.
  - "It happened a long time ago" goes to RAINN.
  - "I'm worried about someone" goes to the Hotline.
  - "Everyday things" goes to 211.
- "You're allowed to ask questions first": scripts for asking providers about privacy, mandatory reporting, cost, interpreters, disability, children and pets.
- "More ways to connect": The Deaf Hotline (VP 855-812-1001), StrongHearts (844-762-8483), and Hotline en español.
- A six-item FAQ (`<details>`) covers: not sure it's abuse; don't have to leave; police reports; cost; non-shelter help; children/pets/immigration (linking WomensLaw immigration).
- "Connect" page: a two-step funnel ("1. Choose 2. Explore") with focus management and a live-region announcement.
- "States" page: a full no-JS directory of 51 jurisdictions with jump links. Each state has three links, and each is stamped "Source reviewed October 31, 2026":
  - WomensLaw find-help/{state}
  - the state coalition (the Oklahoma state agency in OK's case)
  - WomensLaw laws/{state}
- About, Privacy & browsing, Terms (Use of this directory) and Accessibility pages are all detailed and candid. Examples:
  - "Its creator is a resource curator, not a licensed clinician, lawyer, or credentialed domestic violence advocate"
  - "Listings are not paid placements"
  - "The project does not claim ADA certification or full WCAG conformance"
- Contact is `mailto:contact@atherpace.org` only, labelled "not monitored for support or emergencies".
- Link domain counts in the script: womenslaw.org 204 occurrences, thehotline.org 5, and one coalition each per state. Every state result therefore says "Provided by WomensLaw" on two of the three cards. — script analysis

**Safety mechanics (JS)**
- Quick exit: clears selects, hides all content (sets `hidden` and `inert`), sets the title to "Resource guide", then calls `window.location.replace('https://www.weather.com/')`. Using replace means the back button won't return to the site. Pressing Escape twice within 1 second also triggers it. Hide page shows a neutral "Page paused" screen with "Return to resource guide" and a weather link. The selections are also cleared on pageshow (bfcache). — script in `index.html`
- With JavaScript disabled, quick exit and hide do not work. This is disclosed on the Accessibility page.
- The site has no sticky or floating exit button. The header button scrolls away unless the header is sticky. Whether it is sticky could not be confirmed from the CSS without rendering; `scroll-padding-top:110px` suggests a sticky header. This is a gap to verify.
- External links open in the same tab with `rel="noreferrer"`. There is no "you are leaving this site" interstitial.

**Accessibility**
- Implemented: a skip link, explicit labels, native selects, `:focus-visible` outlines of 3px, `prefers-reduced-motion`, print styles, breakpoints at 380/480/650/800/900px, an `aria-live` status, `lang="es"` on the Spanish link, and alt text with decorative images set to `alt=""`. The site self-reports that "A full assistive-technology, mobile, zoom/reflow, and disability-led usability review has not been completed." — Accessibility page in source

### Inferences
- Safety-by-design is on par with or *better than* most leading sites. There are zero third-party requests, while The Hotline runs chat widgets and donation tooling. Privacy and safety are not the weak spot.
- The weak spots are:
  - **depth**: no on-site explanatory content, and only three links per state, two from one provider;
  - **discoverability**: one indexable URL and no DV terms in the title or description;
  - **direct-contact breadth**: no teen line, sexual-assault line, stalking or LGBTQ+ resources, and no visible text or chat numbers beyond The Hotline;
  - **credibility**: an anonymous curator, no advisory or survivor review, and no organizational identity.
- The neutral title "Resource guide" is a deliberate safety trade-off for tab and history privacy. It directly suppresses search ranking and click-through. That trade-off should be made consciously, for example with a neutral tab title only after a quick-exit or "discreet mode" toggle, and descriptive titles on indexable sub-pages. Some leading sites use neutral titles. Most, like thehotline.org, use descriptive ones.
- Double-Escape as a shortcut can conflict with Escape closing native select dropdowns or dialogs. GOV.UK explicitly rejected single-key Esc for this reason (see below).

### Gaps
- Mobile rendering was not visually tested (no browser screenshot). Header stickiness, tap-target sizes and contrast on the live CSS are unverified.
- The live CSS differs from the repo, so the repo is behind production styling.

## What do leading DV sites do?

### Takeaway
Best-in-class sites combine:
- multiple always-visible contact channels (call, text and chat, now including an AI chatbot at The Hotline);
- an exit control in the header, often an "X", plus Esc×2;
- large libraries of original, search-optimized content;
- interactive tools (quizzes, interactive safety plans, danger assessment);
- searchable provider databases with filters;
- strong institutional trust signals: years operating, people served, Charity Navigator/Candid/BBB badges, funders and annual reports.

### Cited Findings
**The National Domestic Violence Hotline (thehotline.org)**
- Nav: Get Help, Learn About Abuse, Get Involved, Search, Donate, En Español. — [thehotline.org](https://www.thehotline.org/)
- Quick exit: "Leave this site safely". "You can quickly leave this website by clicking the 'X' in the top right or by pressing the Escape key twice." — [thehotline.org](https://www.thehotline.org/)
- Contact channels: call 800.799.SAFE (7233), "Chat live now", text START to 88788. "Ruth", a DV-informed AI chatbot, is offered when an advocate is unavailable. There is also a wait-time notice linking to local providers. — [thehotline.org](https://www.thehotline.org/)
- Lists specialty lines: StrongHearts 844.762.8483, the National Teen Dating Abuse Helpline 866.331.9474, and The Deaf Hotline VP 855.812.1001. — [thehotline.org](https://www.thehotline.org/)
- Content: warning signs, the Power and Control Wheel, supporting a survivor, resources for people causing harm, statistics, a local provider directory (shelter, legal, financial, counseling, coalitions, low-cost health), and DVBeds real-time bed availability. — [thehotline.org](https://www.thehotline.org/)
- Trust signals: "~1.2M People contact The Hotline for help every year", a Charity Navigator 4-star rating, a Candid Platinum Seal, survivor testimonials, HHS/DOJ funding disclosure and 501(c)(3) status. — [thehotline.org](https://www.thehotline.org/)

**NCADV**
- ncadv.org now shows only a notice that "NCADV has merged with the National Domestic Violence Hotline" and points to TheHotline.org. — [ncadv.org](https://ncadv.org/)
  - Implication: any At Her Pace links to NCADV would be stale. None were found in the source.

**loveisrespect.org (teens/young adults)**
- Nav covers: About dating; Healthy relationships (relationship spectrum, power & control, boundaries, consent, cultural context); Personal safety (home, school, online); Supporting others (friend, partner, family, child, student); Get help (interactive safety plan, Deaf, Native). — [loveisrespect.org](https://www.loveisrespect.org/)
- Contact: call 866-331-9474, text LOVEIS to 22522, "Chat live now". It has quizzes and an interactive safety plan. Exit is an "X" or Esc×2. A "You are about to leave this site" Continue/Cancel prompt appears for external sites. — [loveisrespect.org](https://www.loveisrespect.org/)

**WomensLaw.org (NNEDV)**
- WomensLaw has a bilingual Email Hotline and chat: "we answer questions and offer personalized information and referrals in English and Spanish". It gives general legal information, not legal advice. — [NNEDV](https://nnedv.org/reach-update/empowering-survivors-for-25-years)
- State legal pages are organized by state and order type: protection-from-abuse, elder abuse orders, and moving out of state with an order. — [WomensLaw what is a protective order](https://www.womenslaw.org/laws/general/what-protective-order)
- Over two-thirds of the site, including 38 states' legal information, was translated into Spanish (older NNEDV figure). — [NNEDV](https://nnedv.org/whats-new-at-womenslaw/)
- Direct fetch of womenslaw.org returned 403 from this environment, so the homepage was not inventoried first-hand.

**DomesticShelters.org**
- Shelter/program search by "location, services and language", with a "Near me" option and an international link to NO MORE's global directory. — [domesticshelters.org](https://www.domesticshelters.org/)
- Banner: "Abusers may monitor your phone". It offers a password-protected app with a discreet icon and a custom title. — [domesticshelters.org](https://www.domesticshelters.org/)
- A library of "1451 helpful articles, videos, and more", plus assessment tools, apps and an editorial policy page. It claims "2.5 Million+ Survivors" and Purple Ribbon Awards, and is a Bright Sky US partner. — [domesticshelters.org](https://www.domesticshelters.org/)
- It uses search-demand phrasing explicitly: it uses "abusive relationship" because it is "a common term people search for". — [DomesticShelters: am I experiencing abuse](https://www.domesticshelters.org/common-questions/am-i-experiencing-abuse)

**Safe Horizon (NYC)**
- Header "Talk Now" plus an "Exit" button (to google.com). The bottom bar reads "Call 24/7 at 1.800.621.4673 (HOPE)" and "Chat Live Now". There is an En Español link. — [safehorizon.org](https://www.safehorizon.org/)
- Trust signals: "Fighting for Survivors Since 1978", 250,000+ people served per year, BBB and Charity Navigator badges, annual reports and financials, survivor stories, and a Tech and Cyber Safety page in the footer. — [safehorizon.org](https://www.safehorizon.org/)

**Apps and tools**
- myPlan (Johns Hopkins, Nancy Glass) is a free safety decision aid on iOS, Android and the web, in English and Spanish. It is built on the validated Danger Assessment, gives a four-level danger rating, and was tested in RCTs. It says it is "not meant to replace real live trained domestic violence advocates". — [JHU Hub](https://hub.jhu.edu/magazine/2016/fall/domestic-violence-app-nursing); [App Store](https://apps.apple.com/us/app/myplan-safety-app/id1563802534); [VAWnet](https://www.vawnet.org/material/myplan)
- Bright Sky US is a free app for recognizing signs, assessing relationship safety and locating US support services. It is from Women's Center & Shelter of Greater Pittsburgh and the Vodafone Americas Foundation, with DomesticShelters.org, Hope After Harm and NO MORE. It advises users to "only download the app if it is safe for you to do so". — [NO MORE](https://www.nomore.org/bright-sky-us/); [WCS fact sheet](https://wcspittsburgh.org/wp-content/uploads/2025/09/Bright-Sky-Stylized-Fact-Sheet_Survivors.pdf)

**UK inspiration**
- GOV.UK "Exit this page" component:
  - It is a header button plus a keyboard shortcut ("press shift 3 times… within 5 seconds") with visible progress dots.
  - An overlay appears immediately "to help users with slow connections clear their screen".
  - The default destination is BBC Weather. Avoid destinations with personalised pages.
  - A hidden secondary skip link is provided for assistive technology.
  - Single-key Esc was rejected because it can interfere with other actions.
  - It was researched with people with lived experience of domestic abuse.
  - — [GOV.UK Design System](https://design-system.service.gov.uk/components/exit-this-page/)
- SafeLives designed its exit button with a survivor group and warns that it may behave differently across browsers. — [SafeLives website safety](https://safelives.org.uk/all-policies/website-safety)
- Refuge runs a dedicated tech-safety site with device-by-device "secure your tech" guides. — [refugetechsafety.org](https://refugetechsafety.org/secure-your-tech/)

### Inferences
- The universal baseline that At Her Pace lacks: (a) text and chat shown as first-class buttons, not buried in a sentence; (b) a teen line; (c) original explainer content; (d) at least one interactive tool or a pointer to a vetted tool like myPlan or Bright Sky; (e) institutional trust signals.
- At Her Pace cannot match hotline or chat services and shouldn't try. Its natural differentiator is being the *calmest, most private, most honest navigator*. It can win on curation depth per state and on plain-language explainers that rank in search.

### Gaps
- One Love Foundation, Futures Without Violence and Refuge's main site were not fetched because of the tool budget. Their specific features (One Love's relationship quizzes and Couplets, Futures' health-provider toolkits) are not verified here.
- Bright Sky US 2026 feature changes could not be found. The coverage found dates to the 2023 launch.

## Safety-by-design best practices: how does At Her Pace measure up?

### Takeaway
At Her Pace already meets or exceeds nearly all of NNEDV Safety Net's agency-website recommendations: an every-page alert, quick exit to a neutral site, HTTPS, no cookies, no third-party widgets, limited analytics, a privacy policy, and a no-history-illusion message. The remaining gaps:
- the email-only contact method, which NNEDV advises against;
- no exit shortcut beyond Esc×2 and no secondary skip-link exit;
- no fast-loading overlay pattern on slow connections (it does hide content before navigating, which partly covers this);
- no device-specific tech-safety guidance of its own;
- no warning interstitial before outbound links.

### Cited Findings
- NNEDV recommendations:
  - Put a safety alert at the top of every page, because "a header should also be at the top of every webpage". Warn that visiting the site "creates a digital trail that cannot be completely erased".
  - Quick exit "redirects the web browser to a reliable website, with neutral content" and does not remove history.
  - "Remove email addresses from your website and use web forms instead", with questions about how to respond safely.
  - Email and social media are "generally not secure or confidential".
  - Avoid cookies and third-party plug-ins. Obscure IPs. Limit analytics, possibly to server logs only.
  - Warn that external links, videos and PDFs leave trails. Strip geotags from photos. Make the site accessible.
  - — [NNEDV Safety Net: agency website safety tips](https://www.techsafety.org/agency-website-safety-tips)
- Quick-exit buttons only defend against over-the-shoulder monitoring, not history or spyware. Don't give a false sense of security. — [TechSafety: Exit from this website quickly](https://techsafety.org/exit-from-this-website-quickly)
- Chayn's trauma-informed design principles (eight, survivor-led) include putting physical and emotional safety first and building trust through clear, consistent communication. They prioritise "trust and safety over aesthetic or simplicity" and recognise that survivors are not homogenous. — [Chayn trauma-informed design (Notion)](https://chayn.notion.site/How-we-practice-trauma-informed-design-at-Chayn-1-Feb-2024-6f5211828e4a4a1db9735fe371febb79); [Orbits/Chayn on Medium](https://medium.com/orbiting/stopping-abuse-design-principles-for-creating-trauma-informed-technology-for-tackling-ed12bef494)
- Health sources advise searching for shelters on a device the abuser can't access. — [UCSD Health](https://myhealth.ucsd.edu/1,2579)

### Inferences (scorecard: At Her Pace vs. best practice)
| Practice | At Her Pace | Best-in-class reference |
|---|---|---|
| Every-page safety alert | Yes (banner) | NNEDV |
| Quick exit to a neutral site, history replace | Yes (weather.com, `location.replace`) | GOV.UK / Hotline |
| Keyboard shortcut | Esc×2 (may clash with selects) | GOV.UK Shift×3 with progress dots; Hotline Esc×2 |
| Exit always reachable on mobile (sticky/floating) | Unverified | Safe Horizon's bottom bar; Hotline floating bar |
| Exit works without JS | No (disclosed) | Could add a plain `<a href>` fallback to weather |
| Secondary skip-link exit for AT | No | GOV.UK |
| Zero trackers / cookies / 3rd-party | Yes (CSP `connect-src 'none'`) | Exceeds most competitors |
| Contact method | mailto only | NNEDV: web form with "safe to respond?" questions |
| Leaving-site interstitial | No | loveisrespect |
| On-site tech safety guide | Links out only | Refuge Tech Safety, Safe Horizon |
| Honest limits copy | Excellent | Matches NNEDV's "no false sense of security" |

- The Hide page feature is a novel, thoughtful extra that is uncommon among competitors.
- The mailto recommendation conflicts with the "collect nothing" philosophy. A contact form needs a backend or third party. Keeping email but adding NNEDV-style guidance ("use a safe email account; tell us if it's safe to reply") is a reasonable compromise.

### Gaps
- No published empirical study was found comparing exit-button designs. The GOV.UK component is the best-documented research-based pattern.

## Content gaps

### Takeaway
At Her Pace has essentially no first-party topical content. Every topic in the brief is either missing or a single outbound link: protective orders by state, financial abuse, tech abuse, pets, LGBTQ+, immigrant survivors, men, teens, children/custody, housing, shelter finders, firearms, stalking and sexual assault.

### Cited Findings
- Present on At Her Pace (outbound only):
  - legal: WomensLaw laws/{state};
  - immigration: one WomensLaw federal immigration link;
  - tech: techsafety.org and Hotline internet safety;
  - past or sexual abuse: RAINN homepage, without the RAINN 800-656-4673 number displayed;
  - practical needs: 211;
  - Deaf and Native lines; Spanish (Hotline en español);
  - pets and children mentioned only as "questions to ask".
  - — source `index.html`
- Missing entirely: a teen or young adult line (loveisrespect: 866-331-9474, text LOVEIS to 22522 — [loveisrespect.org](https://www.loveisrespect.org/)), LGBTQ+-specific resources, men or male survivors (the site "centers women… welcomes anyone"), elder abuse, stalking, firearms and protective orders, financial or economic abuse, housing rights, and custody.
- Competitor content depth for comparison:
  - The Hotline covers types of abuse, the Power and Control Wheel, safety planning and help for people causing harm. — [thehotline.org](https://www.thehotline.org/)
  - DomesticShelters has 1,451 articles, including escaping with children and financial independence. — [domesticshelters.org](https://www.domesticshelters.org/)
  - WomensLaw covers state protective-order types. — [WomensLaw](https://www.womenslaw.org/laws/general/what-protective-order)
- Shelter finders: The Hotline's directory and DVBeds real-time beds ([thehotline.org](https://www.thehotline.org/)); DomesticShelters search by location, services and language ([domesticshelters.org](https://www.domesticshelters.org/)). At Her Pace links to the Hotline directory but not to DomesticShelters' search.

### Inferences
- The biggest content wins at low risk are plain-language, curated hub pages that each link to two to five vetted specialist sources and keep the site's calm tone and honesty. Suggested hubs:
  - "Protective orders in [State]": 51 static pages
  - "Is this abuse?"
  - "Tech & phone safety"
  - "Money & financial abuse"
  - "Leaving with pets"
  - "Immigrant survivors"
  - "LGBTQ+ survivors"
  - "Teens & young adults"
  - "Men & male survivors"
  - "Children & custody"
  - "Housing & shelter"
- Per-state depth: add more than three links per state, and diversify beyond WomensLaw, for example with legal aid (LawHelp.org state sites), state court self-help protective-order forms, state crime-victim compensation, address confidentiality programs and the state sexual-assault coalition. Any of these would need sourcing and review dates in the existing style.

### Gaps
- No verified list of 2026 national LGBTQ+, male-survivor, elder or financial-abuse US hotlines was gathered here because of the tool budget. These need verification before listing.

## Trust signals, SEO, accessibility

### Takeaway
Trust at At Her Pace rests on transparency: review dates, "not paid placements", and candid scope and limits. It lacks the institutional signals competitors lead with, such as a named organization, history, numbers served, ratings badges, funders, advisory review and survivor voices.

SEO is near zero by design. The site has one hash-routed URL, a neutral title, no DV keywords, no sitemap and no structured data.

Accessibility is thoughtfully built but untested with assistive tech.

### Cited Findings
- Competitor trust signals:
  - The Hotline: 1.2M contacts per year, Charity Navigator 4-star, Candid Platinum and funder disclosure ([thehotline.org](https://www.thehotline.org/)).
  - Safe Horizon: "since 1978", BBB, annual reports ([safehorizon.org](https://www.safehorizon.org/)).
  - DomesticShelters: editorial policy, awards, "no sale of user information" ([domesticshelters.org](https://www.domesticshelters.org/)).
- Search behavior: high-ranking pages frame headings as survivor questions. WSCADV uses "How do I know if it is abuse or just a bad relationship?" and WomensHealth.gov uses "How do I know whether I'm being abused?". — [WSCADV](https://wscadv.org/about-domestic-violence/); [WomensHealth.gov](https://womenshealth.gov/relationships-and-safety/partner-violence/signs-domestic-violence)
- Overlapping search terms include "domestic violence", "domestic abuse", "intimate partner violence" and "abusive relationship". — [DomesticShelters](https://www.domesticshelters.org/common-questions/am-i-experiencing-abuse)
- "How to get a restraining order" queries are dominated by commercial and legal publishers (LegalZoom, FindLaw) and state DOJ or court pages. This is an opening for plain-language, state-specific survivor pages. — [LegalZoom](https://legalzoom.com/articles/how-to-get-a-restraining-order); [Wisconsin DOJ](https://www.wisdoj.gov/Pages/CrimeVictimServices/restraining-orders.aspx)
- The At Her Pace accessibility statement says there has been no full AT, zoom/reflow or disability-led review, and claims no WCAG conformance. — source `index.html`
- The site links DOJ ADA web guidance. — [ada.gov](https://www.ada.gov/resources/web-guidance/)

### Inferences
- SEO fixes that don't hurt safety:
  - Split hash "pages" into real URLs: `/states/texas/`, `/protective-orders/texas/`, `/tech-safety/`.
  - Give each page a descriptive `<title>` and meta description. Use `Organization` and `FAQPage` JSON-LD.
  - Add a `sitemap.xml`. Drop `Crawl-delay`, which Google ignores and may slow others.
  - Keep `noarchive`.
  - The homepage tab title could stay neutral as the deliberate safety choice, with sub-pages descriptive. Alternatively, the quick exit's title rewrite already covers tab privacy at exit time.
  - The meta description should include "domestic violence" and "abuse".
- Keyword targets (no volume data was obtained, so this is inference from competitor framing):
  - "am I being abused"
  - "signs of an abusive relationship"
  - "how to get a protective order in [state]"
  - "domestic violence shelter near me [state]"
  - "how to leave an abusive relationship"
  - "is my phone being tracked by my partner"
  - "financial abuse"
  - "emotional abuse signs"
- Trust additions:
  - A named curator or "About the founder" with credentials and motivation.
  - Volunteer review by a credentialed DV advocate or survivor advisory, stated on the About page.
  - A methodology page (already partly there) and an "editorial and review policy" like DomesticShelters'.
  - A changelog of reviews. A "report a broken link" path.
  - Nonprofit or fiscal-sponsor status if pursued.
- Accessibility actions:
  - Commission a WCAG 2.2 AA audit, including screen readers (NVDA/VoiceOver), 400% zoom/reflow and target size.
  - Downscale the 1942px logo (87 KB) to an SVG or a 2x-size PNG.
  - Test whether Esc×2 conflicts with select dropdowns.
  - Ensure the exit button is reachable at all scroll positions on mobile.

### Gaps
- No keyword search-volume data was found (it requires Keyword Planner or Semrush).
- Contrast and target sizes were not measured on the live CSS.

## Prioritized recommendations (synthesized from the findings above)
**P0: quick, high impact, no safety cost**
1. Make **call / text / chat** three visible buttons in a sticky mobile bottom bar ([Safe Horizon](https://www.safehorizon.org/)/[Hotline](https://www.thehotline.org/) pattern). Add the loveisrespect teen line (866-331-9474, text LOVEIS 22522) and display the RAINN number.
2. Make the **exit control** always visible (sticky or floating on mobile). Add a no-JS `<a href="https://www.weather.com/">` fallback and a GOV.UK-style secondary skip link. Consider Shift×3 in addition to Esc×2 ([GOV.UK](https://design-system.service.gov.uk/components/exit-this-page/)).
3. SEO basics: a descriptive meta description with DV terms, `sitemap.xml`, `Organization`/`FAQPage` JSON-LD and OG tags (a neutral OG image). Remove `Crawl-delay`.
4. Sync the repo with the live CSS, since production is ahead of the repo.

**P1: content and depth**
5. Convert hash sections to real static URLs. Build **51 state pages** with 6–10 vetted links each: coalition, WomensLaw laws, court protective-order self-help, legal aid, victim compensation, address confidentiality program and sexual-assault coalition. Keep the "reviewed on" stamps.
6. Add about 10 plain-language **topic hubs** (listed above), each written as survivor-question headings and each linking out to specialists.
7. Point to vetted **safety-planning and danger-assessment tools**: myPlan ([JHU](https://hub.jhu.edu/magazine/2016/fall/domestic-violence-app-nursing)), Bright Sky US ([NO MORE](https://www.nomore.org/bright-sky-us/)), loveisrespect's interactive plan. Include the "only download if safe" caveat. Do not build an in-house danger assessment.
8. Add an on-site **tech safety primer**: device checks and "clearing history can itself be a red flag", linking to [Safety Net](https://www.techsafety.org/agency-website-safety-tips) and the [Refuge tech-safety](https://refugetechsafety.org/secure-your-tech/) model.

**P2: trust and accessibility**
9. Strengthen trust: a named curator bio, advocate or survivor review panel, an editorial policy, a review changelog, and a "report an outdated link" path. Add a safe-contact note to the email ("use an account others can't access; tell us if it's safe to reply") per [NNEDV](https://www.techsafety.org/agency-website-safety-tips).
10. Commission a WCAG 2.2 AA plus disability-led audit. Optimize images by converting the logo to SVG.
11. Add Spanish versions of the core pages, as the Spanish-language market is a large part of the audience ([WomensLaw](https://nnedv.org/whats-new-at-womenslaw/), Hotline and loveisrespect all offer Spanish).
12. Optionally add a light "you're leaving At Her Pace" note on outbound links ([loveisrespect](https://www.loveisrespect.org/)), only if it doesn't slow urgent users.
