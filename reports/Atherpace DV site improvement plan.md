# Turn At Her Pace into rural women's navigator

At Her Pace (atherpace.org) already beats most leading domestic violence (DV) websites on safety engineering. It has no trackers, no cookies, no forms, a strict content security policy, a quick exit and a "Hide page" control. As a resource, though, it is thin and close to invisible in search. It has no original content, three outbound links per state (two of them from WomensLaw), one indexable URL titled "Resource guide," and no visible text, chat or teen-line buttons. The highest-impact fixes cost little and do not weaken safety:

- an exit control and call/text/chat buttons that stay on screen;
- real URLs for each state, with 6–10 vetted links per state;
- about ten plain-language topic hubs written around the questions survivors search for;
- the trust signals competitors lead with, such as a named curator, advocate review and an editorial policy.

Revenue is realistic only once the project has a tax-exempt home. A fiscal sponsor is the fastest route, typically keeping 5–15% of funds. After that, donations, small foundation grants and B2B licensing of the curated directory fit the mission. Ads, affiliate links and anything that charges survivors do not. A private survivor peer-support group is feasible and has promising evidence behind it. It has to be built as a supervised program rather than a chat room:

- invite or referral admission;
- pseudonyms and pre-moderation;
- mentors with roughly 40 hours of DV advocate training;
- clinical supervision;
- partnership with an established DV agency.

That plan needs roughly $40–65k in the first year. Rural women are the clearest place for the site to stand out. Their abuse is more severe, help averages about 30 miles away, guns raise lethality, and the states with the highest prevalence (Arkansas, Missouri, Alaska, West Virginia, Oklahoma, Maine) are largely rural. A rural section organized by how women can safely reach help would fill a real gap.

## Strong safety engineering, almost no substance

On privacy, the site outperforms the field. Its policy is `default-src 'none'` with `connect-src 'none'` and `form-action 'none'`. It sends `Referrer-Policy: no-referrer`, a one-year HSTS header and `noarchive`, and makes zero third-party requests. The quick exit clears the page and calls `location.replace` to weather.com, so the back button cannot return to the site. **Hide page**, a neutral "Page paused" screen, is a thoughtful extra that few competitors offer ([atherpace.org](https://atherpace.org/)). The site already meets nearly every one of NNEDV Safety Net's website recommendations: an alert on every page, a quick exit to a neutral site, no cookies or third-party plug-ins, minimal analytics, and copy that does not overstate what the exit does ([Safety Net](https://www.techsafety.org/agency-website-safety-tips)). The Hotline, by comparison, runs chat widgets and donation tooling.

The problems are depth, discoverability, contact breadth and credibility. **The site has no original explanatory content.** Each state shows three cards: WomensLaw's find-help page, the state coalition, and WomensLaw's laws page. Across the script, womenslaw.org appears 204 times. Topics such as protective orders, financial abuse, stalking, firearms, custody, housing, LGBTQ+ survivors, teens, men and elder abuse are either missing or reduced to a single outbound link. **Contact breadth is narrow.** The Hotline's text option (START to 88788) sits inside a sentence rather than on its own button. There is no teen line, and RAINN is linked without its phone number. **Search engines barely see the site.** It is one hash-routed URL with the title "Resource guide." The meta description never mentions domestic violence or abuse. There are no Open Graph tags, no canonical URL and no structured data, `/sitemap.xml` returns 404, and robots.txt sets a `Crawl-delay` ([atherpace.org](https://atherpace.org/)). The neutral title is a deliberate tab-privacy choice, but it costs the site most of its search ranking. The quick exit already rewrites the title when it fires.

The leading sites show what "complete" looks like.

The National DV Hotline offers:
- call, live chat and text START to 88788, plus "Ruth," an AI chatbot for times when no advocate is free;
- an "X" or double-Escape exit;
- specialty lines: the teen line 866-331-9474, StrongHearts 844-762-8483 and the Deaf Hotline;
- the Power and Control Wheel, a provider directory and DVBeds real-time bed availability;
- trust signals: about 1.2M contacts a year, a Charity Navigator 4-star rating, a Candid Platinum Seal and funder disclosure ([thehotline.org](https://www.thehotline.org/)).

DomesticShelters.org searches programs by location, services and language. It also has a library of **1,451 articles**, an editorial policy, and a password-protected app with a discreet icon ([domesticshelters.org](https://www.domesticshelters.org/)). Loveisrespect adds quizzes, an interactive safety plan and a "You are about to leave this site" prompt ([loveisrespect.org](https://www.loveisrespect.org/)). Safe Horizon keeps "Call 24/7" and "Chat Live Now" in a bar along the bottom of the screen and opens with "Fighting for Survivors Since 1978" ([safehorizon.org](https://www.safehorizon.org/)). One housekeeping note: ncadv.org now says only that NCADV merged into the Hotline ([ncadv.org](https://ncadv.org/)). At Her Pace has no NCADV links, but any future list should leave it out.

At Her Pace cannot and should not copy a hotline. Its natural position is to be **the calmest, most private, most honest navigator**. It can win on curated depth for each state and on plain-language explainers that rank in search, where commercial publishers such as LegalZoom and state DOJ pages currently own "how to get a restraining order" ([LegalZoom](https://legalzoom.com/articles/how-to-get-a-restraining-order); [Wisconsin DOJ](https://www.wisdoj.gov/Pages/CrimeVictimServices/restraining-orders.aspx)).

| Practice | At Her Pace now | Best-in-class reference |
|---|---|---|
| Zero trackers, cookies or third-party code | Yes. Beats most competitors | — |
| Quick exit to a neutral site, history replaced | Yes | [GOV.UK](https://design-system.service.gov.uk/components/exit-this-page/), [Hotline](https://www.thehotline.org/) |
| Exit visible at every scroll position on mobile | Not verified | Safe Horizon bottom bar |
| Exit without JavaScript, extra exit link for assistive tech | No | GOV.UK |
| Call, text and chat as buttons | Call only, in a sentence | Hotline, Safe Horizon |
| Original content library | None | DomesticShelters (1,451 items) |
| Interactive or decision tools | None | myPlan, Bright Sky, loveisrespect plan |
| Institutional trust signals | Candid limits only, curator anonymous | Hotline, Safe Horizon |
| Indexable pages and SEO metadata | One URL, neutral title | Descriptive titles on most leaders |

## Twelve fixes ranked by impact and safety cost

The ranking follows one rule: do the fixes that help a frightened visitor today and cost nothing in privacy first, then build depth, then build credibility.

**P0, this month.** First, add a **sticky mobile bar with three buttons**: Call 800-799-7233, Text START to 88788, and Chat. This follows the Safe Horizon and Hotline pattern. Add the loveisrespect teen line (866-331-9474, text LOVEIS to 22522) and show RAINN's number ([loveisrespect.org](https://www.loveisrespect.org/); [safehorizon.org](https://www.safehorizon.org/)). Second, keep the **exit control on screen** at every scroll position. Back it with a plain `<a href>` to the weather site for visitors without JavaScript, and a hidden extra exit link for assistive technology, as in the GOV.UK "Exit this page" component. GOV.UK researched that component with people who had lived experience of domestic abuse. It rejected a single Esc key because Esc conflicts with other actions, and uses Shift pressed three times with progress dots instead ([GOV.UK Design System](https://design-system.service.gov.uk/components/exit-this-page/)). At Her Pace's double-Esc shortcut should be tested against native select dropdowns, which also close on Esc. Third, fix the **SEO basics without touching the safety model**: put "domestic violence" and "abuse" in the meta description, add `sitemap.xml`, `Organization` and `FAQPage` structured data, and Open Graph tags with a neutral image, and remove `Crawl-delay`. Fourth, bring the repository up to date: the live CSS (21 KB) is newer than the repo copy (14 KB) ([atherpace.org](https://atherpace.org/)).

**P1, next quarter.** Fifth, turn the hash sections into real static URLs such as `/states/texas/` and `/protective-orders/texas/`. Build **51 state pages with 6–10 vetted links each**: the coalition, WomensLaw laws, court self-help for protective orders, LawHelp legal aid, crime-victim compensation, the address confidentiality program and the sexual-assault coalition. Keep the "Source reviewed" date stamps. Sixth, write about **ten plain-language topic hubs**:

- Is this abuse?
- Tech and phone safety
- Money and financial abuse
- Leaving with pets
- Immigrant survivors
- LGBTQ+ survivors
- Teens and young adults
- Men and male survivors
- Children and custody
- Housing and shelter

Each hub should use the survivor-question headings that rank well elsewhere ("How do I know whether I'm being abused?") and link out to two to five specialists ([WomensHealth.gov](https://womenshealth.gov/relationships-and-safety/partner-violence/signs-domestic-violence); [WSCADV](https://wscadv.org/about-domestic-violence/)). Seventh, **point to vetted safety tools rather than building one**. myPlan, from Johns Hopkins, is built on the validated Danger Assessment and was tested in randomized trials ([JHU Hub](https://hub.jhu.edu/magazine/2016/fall/domestic-violence-app-nursing)). Bright Sky US helps users recognize warning signs and find services, and itself says to "only download the app if it is safe for you to do so" ([NO MORE](https://www.nomore.org/bright-sky-us/)). Eighth, write an on-site **tech-safety primer**. Model it on Refuge's device-by-device guides ([Refuge Tech Safety](https://refugetechsafety.org/secure-your-tech/)) and include Safety Net's reminder that clearing history can itself look suspicious.

**P2, within six months.** Ninth, build **trust signals**: a named curator bio, review by an advocate or survivor panel, an editorial and review policy like DomesticShelters', a changelog of reviews, and a way to report an outdated link. NNEDV advises against email-only contact ([Safety Net](https://www.techsafety.org/agency-website-safety-tips)). A web form would break the site's "collect nothing" design, so keep email but add guidance: "use an account others can't access; tell us if it's safe to reply." Tenth, commission a WCAG 2.2 AA audit led by disabled testers, and replace the 87 KB, 1942-pixel logo with an SVG. Eleventh, add **Spanish versions of the core pages**, the norm at WomensLaw, the Hotline and loveisrespect ([NNEDV](https://nnedv.org/whats-new-at-womenslaw/)). Twelfth, consider a light "you're leaving At Her Pace" note on outbound links, but only if testing shows it does not slow down urgent users.

## Money arrives only after a fiscal home exists

**The site cannot accept charitable money today.** It says it is "an independent project" and that "no referral commissions or donations are collected through this site," and it claims no nonprofit status ([atherpace.org](https://atherpace.org/)). The first decision is structural. A **fiscal sponsor** keeps 5–15% of funds; Open Collective hosts take about 10%, and some take as little as 6%. In exchange, the project can take tax-deductible gifts within weeks ([Givebutter](https://givebutter.com/blog/fiscal-sponsorship); [Open Collective docs](https://docs.opencollective.com/help/fiscal-hosts/fiscal-hosts.md)). Filing for 501(c)(3) status costs **$275 (Form 1023-EZ) or $600 (Form 1023)**. Processing estimates range from weeks to a year and are not official ([Inc Authority](https://www.incauthority.com/blog/how-to-apply-for-501c3-status/); [IRS](https://www.irs.gov/charities-non-profits/charitable-organizations/wheres-my-application)). Incorporate only once there is a board of three unrelated people and some funding history. An LLC rules out deductible gifts and nearly every grant.

**Federal DV money is mostly out of reach.** VAWA, FVPSA and VOCA fund direct-service providers, governments, tribes and coalitions, and in 2025–26 they were unstable. OVW applications "were unavailable for months," the President's budget proposed cutting VAWA programs from $713M to $505M, and nonprofits sued over grant conditions that restricted aid to trans and immigrant survivors ([WFAE](https://www.wfae.org/politics/2025-11-02/without-the-federal-government-almost-no-money-exists-to-fight-domestic-violence)). VOCA funds fell by about $600M from FY23 to FY24, which cut state victim-assistance grants by about 40% on average ([NNEDV FY27 factsheet](https://nnedv.org/wp-content/uploads/2026/03/Approps_Factsheet_FY27_final.pdf)). The large private programs are also aimed at shelters and coalitions. The Mary Kay Ash Foundation gives $20,000 shelter grants, 51 of them in 2026 ([Rural Health Info Hub](https://www.ruralhealthinfo.org/funding/1176)). Allstate's Moving Ahead grants go to state coalitions ([NCJA](https://ncja.org/connect2grants-test-1/allstate-foundation---purple-purse-moving-ahead-grant-program)). Less than 2% of US philanthropy goes to women's and girls' causes ([WFAE](https://www.wfae.org/politics/2025-11-02/without-the-federal-government-almost-no-money-exists-to-fight-domestic-violence)). The realistic way into public money is as a **contractor to a coalition**, for example being paid to maintain its statewide resource directory.

The options sort cleanly by fit with the mission:

| Revenue option | Fit | Key condition or risk |
|---|---|---|
| Monthly donors, plus campaigns in October (DV Awareness Month) and on Giving Tuesday (Dec 1, 2026) | Best first revenue | Needs a sponsor. Keep donation scripts on a separate `/support` page |
| Licensing or maintaining the curated state directory for coalitions, hospitals, EAPs or HR platforms | Most aligned earned income | No market data found. Survivors never pay |
| Small foundation, women's fund and tech-for-good grants | Realistic | Competitive. Federal cuts pushed established agencies into the same pool |
| Google Ad Grants (in-kind search ads) | Large but tricky | Requires 501(c)(3) status, a 5% click-through rate and conversion tracking, which clashes with "no analytics" ([Google](https://support.google.com/grants/answer/117827)) |
| Workplace training co-delivered with a credentialed agency | Conditional | Free OVW-funded Workplaces Respond competes ([Workplaces Respond](https://workplacesrespond.org/)). The curator is not a credentialed advocate |
| "Supported by" sponsor credit on the About or Support page | Acceptable | Sponsors must never affect listings. Avoid location-tracking or "family safety" companies |
| Merch (purple ribbon) | Marginal | Low margin, and a third-party store |
| Display ads, affiliate links, paid placements, paid survivor tiers | Never | Trackers can expose DV browsing. Breaks the "not paid placements" promise |

Choose the donation platform with care. Zeffy is "free," but one audit found a **$16.95 (17%) donor tip pre-selected** on a $100 gift ([Donately](https://www.donately.com/total-donor-cost)). Donorbox charges a 2.95% platform fee plus card processing ([donationfeecalc](https://donationfeecalc.pages.dev/givebutter-vs-donorbox/)). Donors to DV causes are often survivors themselves, so use discreet receipt emails (a neutral sender name and subject), publish no donor names without opt-in, and never add donors to remarketing audiences. If the project ever takes a VAWA subgrant, VAWA confidentiality, which bars disclosure of survivors' personal information by "all grantees and subgrantees," applies to it ([OVW FAQ](https://www.justice.gov/ovw/page/file/1006896/download)). The site's current no-data design makes that easy to comply with, and every new form or customer database makes it harder. A longer-term option is the path DomesticShelters.org took. It was founded by a family foundation in 2014 and became a program of Alliance for HOPE International in 2023 ([DomesticShelters](https://www.domesticshelters.org/news/domesticshelters-org-merges-with-alliance-for-hope-intl)). Folding At Her Pace into a coalition or national organization is a real sustainability strategy, not a failure.

## A survivor-mentor circle works only with structure and supervision

**Yes, At Her Pace could host a private group where women in DV support talk with women further along**, and there are good precedents:

- Women's Aid UK runs a forum for women 18+ that it describes as "not a direct help service." Members are told to assume anyone can read their posts and never to share names, children's names, workplaces or locations ([Women's Aid](https://www.womensaid.org.uk/the-survivors-handbook/survivors-forum-guidelines/)).
- Galop pre-moderates its LGBT+ forum and edits posts before they appear ([Galop](https://galop.org.uk/get-help/online-community/domestic-abuse-forum/topic/keeping-safe-on-the-forum)).
- SAFE Alliance in Austin runs free groups led by survivors, including groups for queer, Black and Latinx survivors ([SAFE Austin](https://safeaustin.org/our-services/face-to-face-support/survivor-peer-support)).
- Brave Beginnings in Canada pairs survivors with trained peer mentors for a year of one-on-one Zoom sessions ([Brave Beginnings](https://bravebeginnings.ca/what-we-do/)).

The evidence is promising but thin. In the MOSAIC cluster trial, trained, *supervised* non-professional mentors made 12 months of weekly visits, and **abuse scores fell (15.9 vs 21.8, adjusted difference −8.67)** ([Taft et al. 2011](https://link.springer.com/content/pdf/10.1186/1471-2458-11-178.pdf)). A 2025 review of UK services found most studies had a high risk of bias and did not measure peer support separately ([Carlisle et al.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11908015/)). No trial of online DV peer forums exists, so the group should be described as "peer support, not therapy or advocacy," with no promise of outcomes.

The cautionary example is 7 Cups. It relied on lightly trained volunteers to moderate and run groups, and in a 2018 criminal case an adult man posed as a 15-year-old to get into its teen community ([AHCJ](https://healthjournalism.org/blog/2024/06/how-a-mashable-senior-reporter-exposed-hidden-dangers-of-online-teen-peer-support-forums/)). The DV threat model is harsher than that. An abuser or an ally can join the group, monitor a survivor's device, or impersonate her ([USENIX 2024](https://usenix.org/system/files/usenixsecurity24-gupta.pdf); [WomensLaw](https://nocache.womenslaw.org/about-abuse/abuse-using-technology/ways-survivors-use-and-abusers-misuse-technology/impersonation)). Encryption does not help if the device itself is compromised ([Safety Net](https://www.techsafety.org/understanding-encryption)). **No published method reliably keeps abusers out**, so the design has to limit the harm they can do once inside.

In practice, the group would work like this:

- **Admission:** by invitation or referral. A partner advocate can vouch for someone without sharing her case file. A short voice intake call is a safety conversation, not an ID check.
- **New members:** start in a read-only tier, and their posts are pre-moderated for several weeks.
- **Identity and visibility:** pseudonyms are required, profiles carry no photos, and member lists and "online now" status are hidden. Email notifications are off by default, or say nothing about content and come from a neutral sender.
- **Messaging:** members cannot message each other directly. Women's Aid's unmoderated private messages are a known gap. The only private channel is between matched mentor pairs, and it is reviewable with consent.
- **Rules:** never move off-platform and never share contact details. Moderators watch for anyone asking about locations, court dates, shelter names or schools.
- **Crisis cover:** a banner on every page lists the Hotline, 988 and 911, and the page states plainly that the space is "not monitored 24/7."
- **Mentors:** at least 12–24 months past the abusive relationship and currently safe. They complete the roughly **40 hours of DV advocate training** that California and Oregon use as their legal standard ([CA Evid. Code §1037.1](https://codes.findlaw.com/ca/evidence-code/evid-sect-1037-1/); [OCADSV](https://www.ocadsv.org/resources/confidentiality-protections-for-victims-and-certified-advocates/)), with 1–3 mentees each.
- **Mentor boundaries:** no money, housing offers or in-person meetings, no legal advice, and never telling a mentee to leave or stay.
- **Supervision:** monthly group supervision by a licensed clinician, and debriefs after any crisis.
- **Eligibility and legal terms:** adults 18+ only. Decide explicitly whether trans women are included, and publish the decision. Have counsel review mandated-reporting rules, because some states make every adult a mandated reporter of child abuse.

On platform choice, **self-hosted Discourse** is the best core. It is open source, keeps full control of the data, and has trust levels, approval queues and private categories built in. Hosted plans cost **$100/month (Pro) or $500/month (Business)** ([Discourse pricing](https://www.discourse.org/pricing)). Circle and Mighty Networks are creator platforms that collect a lot of analytics. Discord is a poor fit: text is not end-to-end encrypted, identities persist across servers, and strangers can send messages. Weekly live groups can run on Zoom or self-hosted Jitsi with camera optional. NNEDV warns that "no tool is labeled VAWA/FVPSA/VOCA-compliant" and that a "HIPAA-compliant" label does not settle the question ([Safety Net platform guide](https://techsafety.org/step-by-step-guide)). Keep IP logs for 30 days or less, and let members delete their accounts with their posts anonymized.

A realistic launch moves in three phases:

- **Months 0–3, foundations:** fiscal sponsor, legal review, insurance (general liability, professional, abuse and molestation, D&O, cyber), a clinical advisor and one or two partner agencies.
- **Months 3–6, pilot:** 15–30 referred members and 4–6 trained mentors.
- **Months 6–12:** formal mentor matches of 3–6 months, then Spanish-language and identity-specific groups.

The first-year budget is an estimate that should be checked with partner agencies:

- half-time coordinator: about $30–40k
- legal: $5–15k
- insurance: $2–6k a year
- technology: $1–3k

That roughly $40–65k is the strongest argument for the fiscal sponsor and the partner agency: they bring training, supervision, insurance and possibly advocate privilege. Admissions pause automatically after any confirmed infiltration or any gap in supervision. The group stays **free to every survivor, permanently**, with no "premium mentors," and paid mentor stipends are encouraged.

## Rural women face worse violence about 30 miles from help

**Where the burden is heaviest.** No current state ranking exists for women killed by men. The Violence Policy Center stopped ranking states after the FBI changed how it reports crime data, and its 2025 edition (2023 data) is national only ([VPC](https://vpc.org/publication/when-men-murder-women-an-analysis-of-2023-homicide-data/)). Across years of earlier editions, **Alaska ranked worst repeatedly** ([Alaska's News Source](https://www.alaskasnewssource.com/content/news/Report-For-fourth-year-in-a-row-Alaska-has-highest-rate-of-men-killing-women-560736821.html)). South Carolina and Oklahoma often appeared near the top ([Time](https://time.com/3312681/women-are-most-likely-to-be-killed-by-a-man-in-these-states)), and Nevada ranked high repeatedly ([News3LV](https://news3lv.com/news/local/nevada-rate-of-women-killed-by-men-domestic-sexual-violencee-dv)). For prevalence, the latest CDC state data are from 2016/2017. A compilation of those data ranks women's lifetime DV highest in:

- **Arkansas (48.1%)**
- **Missouri (47.3%)**
- **Alaska (47.1%)**
- Oregon
- **West Virginia (44.1%)**
- Maryland
- Washington
- **Maine**
- **Oklahoma**
- Pennsylvania

New Jersey is lowest at 21.0% ([WorldPopulationReview](https://worldpopulationreview.com/state-rankings/domestic-violence-by-state); [CDC NISVS](https://stacks.cdc.gov/view/cdc/124646)). The compilation's "2024" year label does not match its source, so verify these figures against the CDC tables before publishing them. The pattern is clear even so: the highest-burden states are concentrated in **Alaska, Appalachia (WV, KY, TN), the Ozarks and rural South (AR, MO, OK, SC), and the tribal lands of the Plains and Mountain West**. American Indian and Alaska Native women carry the heaviest load. **84.3% experience violence in their lifetime**, 97% of victims were harmed by a perpetrator of another race, which creates gaps in tribal jurisdiction ([NIJ](https://nij.ojp.gov/library/publications/violence-against-american-indian-and-alaska-native-women-and-men-0)), and their murder rate is about **3 times** that of white women, **6.4 times** in Wyoming ([NCAI](https://ncai.org/section/vawa/overview/key-statistics)). One caveat: the national survey has no rural/urban variable, so no nationally representative rural prevalence figure exists ([RHIhub](https://ruralhealthinfo.org/topics/violence-and-abuse)).

**What rural women face.** The best study of distance and severity comes from Iowa:

- **Prevalence:** 12-month IPV was **22.5% in small rural towns vs 15.5% in urban areas**.
- **Severity:** over 30% of isolated rural victims reported severe violence, vs 10% of urban victims.
- **Distance:** the nearest DV program averaged **29.4–29.6 miles away for rural women vs 6.5 for urban women**, and more than a quarter of rural victims lived over 40 miles from services.
- **Coverage:** 71 of Iowa's 99 counties had no DV program.
- **Beds:** shelter beds averaged 3.3 per remote rural county vs 13.8 per urban county.

([Peek-Asa et al. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3216064))

Rural women are also hospitalized for IPV more often, and areas with few services have more IPV-related homicide ([RHIhub](https://ruralhealthinfo.org/topics/violence-and-abuse)). **46% of rural adults own guns vs 19% of urban adults.** Extending gun bans to people under temporary restraining orders is associated with about 14% lower intimate partner homicide ([DeKeseredy 2025](https://www.mississippifreepress.org/opinion-rural-women-are-at-a-higher-risk-of-violence-less-likely-to-get-help/)). Beyond distance, the barriers are human:

- **No anonymity:** the abuser may know the advocate, the clerk or the deputy, and abusers can have ties to local law enforcement.
- **Self-reliance norms** that discourage asking outsiders for help.
- **Economic dependence**, with little money to relocate.
- **Weak broadband and phone service.**
- **Confidential shelter locations are hard to keep secret** in a small town.
- **More fear after a protective order:** rural women granted one were more likely to fear future harm ([RHIhub](https://ruralhealthinfo.org/topics/violence-and-abuse)).

Animals make leaving harder. **97% of survivors** say keeping their pets is important when deciding whether to seek shelter, but only about 3% of shelters let pets live with residents ([AVMA](https://www.avma.org/javma-news/2021-11-01/report-shows-need-more-pet-friendly-domestic-violence-shelters)). No data exist on livestock, but the problem is likely worse for farm and ranch women whose animals are their livelihood. In Appalachia, IPV is closely tied to opioid use: **75.3%** of pregnant women entering detox in Kentucky reported past-year IPV ([PMC8628311](https://rcastoragev2.blob.core.windows.net/35a874ebfd05ff498567574cdb04b1e1/PMC8628311.pdf)).

**What a rural section should contain.** Organize it by how a woman can reach help safely, not by type of agency.

*Help without being seen.* Text and chat lines for women who have a signal but no privacy: Hotline text START to 88788, StrongHearts call or text 1-844-762-8483 ([StrongHearts](https://strongheartshelpline.org/about/terms-and-conditions)), and loveisrespect for women under 27. Add guidance on using a library or clinic computer instead of a shared one.

*Help that comes to you.* Explain **mobile advocacy**, where advocates meet a survivor at a safe place she chooses ([RHIhub](https://ruralhealthinfo.org/topics/violence-and-abuse)). Note that rural programs often provide transportation: 100% of rural programs in Iowa did, vs 52% of urban programs ([Peek-Asa](https://pmc.ncbi.nlm.nih.gov/articles/PMC3216064)). Give a script for asking "do you offer transport or meet-ups?"

*Pets, livestock and the farm.* Explain RedRover Safe Escape grants, which cover up to 45 days of pet boarding, and the Safe Havens for Pets directory searchable by ZIP code ([RedRover](https://redrover.org/dvhelp/); [DomesticShelters](https://www.domesticshelters.org/domestic-violence-articles-information/ask-amanda-what-to-do-with-pets)). Add a checklist for livestock and farm-business records.

*Guns and protective orders.* A plain-language page for each state on firearm surrender and protective orders, linked to the court self-help pages that the state-page upgrade already adds.

*Trusted local touchpoints.* Libraries, rural clinics and faith leaders who have been trained, for example through the Hearts and Hands rural faith toolkit ([RHIhub](https://ruralhealthinfo.org/resources/6599)), plus a printable, discreet card designed to be left at those places.

*When everyone knows everyone.* How to ask a provider about confidentiality and conflicts of interest. This extends the site's existing "You're allowed to ask questions first" scripts.

*Tribal lands.* Lead with StrongHearts and a plain explanation of who has jurisdiction, and avoid the unsourced "10 times the national average" claim ([Campbell Law Observer](https://campbelllawobserver.com/missing-and-murdered-indigenous-women-an-epidemic/)).

*Farmworker women.* Spanish-first content on fear of immigration consequences, linking WomensLaw's immigration pages. About 80% of immigrant women farmworkers in one California study reported workplace sexual harassment ([OJP](https://ojp.gov/ncjrs/virtual-library/abstracts/examining-sexual-harassment-experiences-mexican-immigrant)).

*Regional landing pages* for Alaska, Appalachia and the Ozarks/rural South, written with the region's coalition.

The rural section also helps with funding. The OVW Rural Program made **56 awards worth $38.38M in FY2025** ([DOJ OVW](https://www.justice.gov/ovw/rural-program)). At Her Pace is unlikely to win one directly, but it is a natural subcontractor for a rural coalition grantee that needs exactly this kind of navigator.

## Conclusion

At Her Pace's best asset is the one competitors find hardest to copy: a site built from the start to leave no trace. Every recommendation here works by adding to that base, not trading it away. Real URLs, topic hubs and rural pages all add reach without adding a single tracker. The biggest risk is not technical. It is the pull, once money and community enter, to add donation widgets, analytics, forms and a forum that quietly undo the privacy promise. Keeping revenue tools on separate pages, keeping the community on infrastructure the project controls, and making every new data flow visible on the privacy page is what lets the site grow without becoming another place a survivor's browsing can be found.

The rural focus is more than one section among many. A site that works without JavaScript or a fast connection, keeps no history and helps women question providers before trusting them was effectively designed for women who live 30 miles from help in a town where everyone knows everyone. Leading with that audience gives At Her Pace a clear identity, a fundable partnership story with rural coalitions, and a reason for search engines and referrers to send people to it rather than to the large national sites.
