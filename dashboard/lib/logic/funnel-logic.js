// Shared with the Claude dashboard: data loaders and funnel calculations.
// Registered through a `dash` object ({loader, calc}) supplied by the caller.

// ---------- loaders ----------
dash.loader('meta_daily', { description: 'Reads the per-day rows out of the Meta Ads answer and turns money and counts into numbers.', fn: ({ answer }) => {
  const list = typeof answer.ad_entities === 'string' ? JSON.parse(answer.ad_entities) : answer.ad_entities;
  if (!Array.isArray(list)) throw new Error((answer.error && (answer.error.message || answer.error)) || 'Meta returned no rows');
  const n = (v) => v == null ? 0 : Number(typeof v === 'object' ? v.value : v) || 0;
  return list.map((r) => ({ date: r.date_start, spend: n(r.amount_spent), impressions: n(r.impressions), link_clicks: n(r.link_click), landing_page_views: n(r.landing_page_view), meta_leads: n(r.lead) }));
}});

dash.loader('meta_ads', { description: 'Reads one row per ad out of the Meta Ads answer.', fn: ({ answer }) => {
  const list = typeof answer.ad_entities === 'string' ? JSON.parse(answer.ad_entities) : answer.ad_entities;
  if (!Array.isArray(list)) throw new Error((answer.error && (answer.error.message || answer.error)) || 'Meta returned no rows');
  const n = (v) => v == null ? 0 : Number(typeof v === 'object' ? v.value : v) || 0;
  return list.map((r) => ({ ad_id: String(r.id), ad_name: r.name, adset_name: r.adset_name, status: r.effective_status, spend: n(r.amount_spent), impressions: n(r.impressions), link_clicks: n(r.link_click), meta_leads: n(r.lead) }));
}});

dash.loader('ghl_contacts', { description: 'Pages through GoHighLevel contacts (100 at a time) and keeps the fields the dashboard uses.', fn: async ({ answer, call, args }) => {
  const unwrap = (a) => { const x = typeof a === 'string' ? JSON.parse(a) : a; if (!x || x.success === false) throw new Error((x && (x.error || (x.data && x.data.message))) || 'GoHighLevel returned an error'); return x.data || x; };
  let page = unwrap(answer); const all = [...(page.contacts || [])]; let p = 1;
  while ((page.contacts || []).length === 100 && p < 10) {
    p += 1;
    page = unwrap(await call('execute_operation', Object.assign({}, args, { params: { body: Object.assign({}, args.params.body, { page: p }) } })));
    all.push(...(page.contacts || []));
  }
  const rows = all.map((c) => {
    const a = c.attributionSource || {};
    return { contact_id: c.id, first_name: c.firstName || c.firstNameLowerCase || '', last_name: c.lastName || c.lastNameLowerCase || '', email: c.email || '', phone: c.phone || '', source: (c.source || '').trim(), date_added: c.dateAdded, utm_source: a.utmSource || '', session_source: a.sessionSource || '', utm_content: a.utmContent || '', has_fbclid: !!(a.fbclid || a.fbc), lead_tag: (c.tags || []).some((t) => String(t).toLowerCase() === '9miles media lead') };
  });
  return { rows, cut: p >= 10 && (page.contacts || []).length === 100 };
}});

dash.loader('ghl_surveys', { description: 'Pages through application (survey) submissions and keeps who submitted, when, whether they were disqualified, and their ad tracking.', fn: async ({ answer, call, args }) => {
  const unwrap = (a) => { const x = typeof a === 'string' ? JSON.parse(a) : a; if (!x || x.success === false) throw new Error((x && (x.error || (x.data && x.data.message))) || 'GoHighLevel returned an error'); return x.data || x; };
  let page = unwrap(answer); const all = [...(page.submissions || [])]; let p = 1;
  while (page.meta && page.meta.nextPage && p < 10) {
    p += 1;
    page = unwrap(await call('execute_operation', Object.assign({}, args, { params: { query: Object.assign({}, args.params.query, { page: p }) } })));
    all.push(...(page.submissions || []));
  }
  return { rows: all.map((s) => {
    const o = s.others || {}; const e = o.eventData || {}; const u = e.url_params || {};
    return { submission_id: s.id, survey_id: s.surveyId, contact_id: s.contactId, name: (s.name || `${o.first_name || ''} ${o.last_name || ''}`).trim(), email: s.email || o.email || '', created_at: s.createdAt, disqualified: o.disqualified === true, phone: o.phone || '', company: o.MhxkfPO9Vgydescwb2O5 || o.organization || '', team_size: o.aB3NR4fzbIOBE2KLGDlJ || '', role: o['1InzOjJIrH8jsWRoyQYG'] || '', challenge: o.pRMTI6DcIWuDpS80uLSY || '', budget: o.Co9PxagdBxyfddvqAvfe || '', timeline: o.IFD6120Te2UQh6cE9OJT || '', decision_maker: o.OlgNWxAqqo1PGpJ0jErd || '', training: o.yjADYukQUHEnZ3gB8Ghh || '', notes: o.YBpyedxu19IULlIoV4lb || '', utm_source: u.utm_source || '', utm_content: u.utm_content || '', has_fbclid: !!(u.fbclid || e.fbc), referrer: e.referrer || '' };
  }), cut: !!(page.meta && page.meta.nextPage) };
}});

dash.loader('ghl_funnel_b', { description: 'Keeps one row per Funnel B (X-Ray) opt-in with its ad tracking.', fn: async ({ answer, call, args }) => {
  const unwrap = (a) => { const x = typeof a === 'string' ? JSON.parse(a) : a; if (!x || x.success === false) throw new Error((x && (x.error || (x.data && x.data.message))) || 'GoHighLevel returned an error'); return x.data || x; };
  let page = unwrap(answer); const all = [...(page.submissions || [])]; let p = 1;
  while (page.meta && page.meta.nextPage && p < 10) {
    p += 1;
    page = unwrap(await call('execute_operation', Object.assign({}, args, { params: { query: Object.assign({}, args.params.query, { page: p }) } })));
    all.push(...(page.submissions || []));
  }
  return { rows: all.map((s) => {
    const o = s.others || {}; const e = o.eventData || {}; const u = e.url_params || {};
    return { submission_id: s.id, contact_id: s.contactId, name: (s.name || `${o.first_name || ''} ${o.last_name || ''}`).trim(), email: s.email || o.email || '', created_at: s.createdAt, utm_source: u.utm_source || '', utm_content: u.utm_content || '', has_fbclid: !!(u.fbclid || e.fbc), referrer: e.referrer || '' };
  }), cut: !!(page.meta && page.meta.nextPage) };
}});

dash.loader('ghl_opps', { description: 'Keeps one row per opportunity in the New Velocity Sales pipeline.', fn: ({ answer }) => {
  const x = typeof answer === 'string' ? JSON.parse(answer) : answer;
  if (!x || x.success === false) throw new Error((x && (x.error || (x.data && x.data.message))) || 'GoHighLevel returned an error');
  return ((x.data || x).opportunities || []).map((o) => ({ opp_id: o.id, contact_id: o.contactId, name: (o.contact && o.contact.name) || o.name || '', stage_id: o.pipelineStageId, status: o.status, value: Number(o.monetaryValue || 0), updated_at: o.updatedAt, stage_changed_at: o.lastStageChangeAt || o.updatedAt, status_changed_at: o.lastStatusChangeAt || o.updatedAt }));
}});

dash.loader('ghl_stages', { description: 'Lists the stages of the New Velocity Sales pipeline in order.', fn: ({ answer }) => {
  const x = typeof answer === 'string' ? JSON.parse(answer) : answer;
  if (!x || x.success === false) throw new Error((x && (x.error || (x.data && x.data.message))) || 'GoHighLevel returned an error');
  const p = ((x.data || x).pipelines || []).find((q) => q.id === 'GjTGTlPGk4kS0PlHjweF');
  if (!p) throw new Error('The New Velocity Sales pipeline was not found');
  return p.stages.map((s) => ({ stage_id: s.id, stage: s.name, position: s.position }));
}});

dash.loader('ghl_events', { description: 'Keeps one row per booking on the intro-call calendar.', fn: ({ answer }) => {
  const x = typeof answer === 'string' ? JSON.parse(answer) : answer;
  if (!x || x.success === false) throw new Error((x && (x.error || (x.data && x.data.message))) || 'GoHighLevel returned an error');
  return ((x.data || x).events || []).filter((e) => !e.deleted).map((e) => {
    const f = (e.appointmentMeta && e.appointmentMeta.defaultFormDetails) || {};
    return { event_id: e.id, contact_id: e.contactId, status: e.appointmentStatus || '', booked_at: e.dateAdded || e.startTime, start_time: new Date(e.startTime).toISOString(), name: `${f.firstName || ''} ${f.lastName || ''}`.trim(), email: f.email || '' };
  });
}});

// ---------- the action log: one row per thing a person did ----------
dash.calc('actions', {
  title: 'What each person did',
  description: 'Every step a real (non-test) person took: started or completed the application, qualified or not, opted into Funnel B, booked or attended a call, and sales outcomes.',
  inputs: ['ghl_contacts', 'ghl_surveys', 'ghl_funnel_b', 'ghl_events', 'ghl_opps', 'ghl_stages'],
  fn: (contacts, surveys, funnelB, events, opps, stages) => {
    const FUNNEL_A_SURVEYS = ['79sQ7ZSdQ93EHLq5YTEr', 'MifJfW1QNI0juzxfQg70']; // Sales Growth Call Qualifier (short, long)
    const STAFF_DOMAINS = ['9milesmedia.com', 'mynewvelocity.com', 'example.com'];
    const STAFF_CONTACT_IDS = ['lbRiEDZvxRs5kiGH0Ykg'];
    const CONFIRMED_STAGES = ['proposal sent', 'closed'];
    const isStaff = (id, email, name) => STAFF_CONTACT_IDS.includes(id) || STAFF_DOMAINS.some((d) => (email || '').toLowerCase().endsWith('@' + d)) || /\btest\b/i.test(name || '');
    const fromAds = (r) => r.has_fbclid || /^(fb|ig|facebook|instagram)$/i.test(r.utm_source || '') || /facebook|instagram/i.test(r.referrer || '');
    const day = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    const title = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[\s-])\S/g, (m) => m.toUpperCase());
    const byId = new Map(contacts.map((c) => [c.contact_id, c]));
    const staffIds = new Set();
    const personOf = new Map(); // contact_id -> person key
    const key = (name, email) => (name ? title(name).toLowerCase() : (email || '').toLowerCase());
    const out = [];
    const add = (person, name, contactId, action, iso, ads, extra) => out.push(Object.assign({ action_id: `${action}|${person}|${iso}`, person, name: title(name || person), contact_id: contactId, action, date: day(iso), at: iso, from_ads: ads ? 'Yes' : 'No', ad_id: '' }, extra || {}));

    const subs = surveys.filter((s) => FUNNEL_A_SURVEYS.includes(s.survey_id));
    const submittedIds = new Set();
    for (const s of subs) {
      if (isStaff(s.contact_id, s.email, s.name)) { staffIds.add(s.contact_id); continue; }
      if (!s.name && !s.email) continue;
      const p = key(s.name, s.email); personOf.set(s.contact_id, p); submittedIds.add(s.contact_id);
      add(p, s.name, s.contact_id, 'Completed application', s.created_at, fromAds(s), { ad_id: s.utm_content, form: { email: s.email, phone: s.phone, company: s.company, role: s.role, team_size: s.team_size, challenge: s.challenge, budget: s.budget, timeline: s.timeline, decision_maker: s.decision_maker, training: s.training, notes: s.notes } });
      add(p, s.name, s.contact_id, s.disqualified ? 'Disqualified' : 'Qualified', s.created_at, fromAds(s), { ad_id: s.utm_content, detail: [s.team_size, s.role].filter(Boolean).join(' · ') });
    }
    for (const f of funnelB) {
      if (isStaff(f.contact_id, f.email, f.name)) { staffIds.add(f.contact_id); continue; }
      if (!f.name && !f.email) continue;
      const p = key(f.name, f.email); personOf.set(f.contact_id, p);
      add(p, f.name, f.contact_id, 'Funnel B opt-in', f.created_at, fromAds(f), { ad_id: f.utm_content, form: { email: f.email } });
    }
    for (const c of contacts) {
      const name = `${c.first_name} ${c.last_name}`.trim();
      if (!/sales growth call qualifier/i.test(c.source) || submittedIds.has(c.contact_id)) continue;
      if (isStaff(c.contact_id, c.email, name) || (!name && !c.email)) continue;
      const p = key(name, c.email);
      if (out.some((a) => a.person === p && a.action === 'Completed application')) continue;
      personOf.set(c.contact_id, p);
      add(p, name, c.contact_id, 'Started application only', c.date_added, fromAds({ has_fbclid: c.has_fbclid, utm_source: c.utm_source, referrer: '' }), { ad_id: c.utm_content, form: { email: c.email, phone: c.phone } });
    }
    // Leads: contacts tagged "9miles media lead" (entered through the application page).
    for (const c of contacts) {
      if (!c.lead_tag) continue;
      const name = `${c.first_name} ${c.last_name}`.trim();
      if (isStaff(c.contact_id, c.email, name) || (!name && !c.email)) continue;
      const p = personOf.get(c.contact_id) || key(name, c.email);
      personOf.set(c.contact_id, p);
      add(p, name, c.contact_id, 'Lead tagged', c.date_added, fromAds({ has_fbclid: c.has_fbclid, utm_source: c.utm_source, referrer: '' }), { ad_id: c.utm_content, form: { email: c.email, phone: c.phone } });
    }
    const who = (id, name, email) => {
      if (personOf.has(id)) return personOf.get(id);
      const c = byId.get(id); const n = name || (c ? `${c.first_name} ${c.last_name}` : '');
      return key(n, email || (c && c.email));
    };
    const nameOf = (p) => (out.find((a) => a.person === p) || {}).name;
    const adsOf = (p) => out.some((a) => a.person === p && a.from_ads === 'Yes');
    const now = new Date().toISOString();
    for (const e of events) {
      if (staffIds.has(e.contact_id) || isStaff(e.contact_id, e.email, e.name)) continue;
      const p = who(e.contact_id, e.name, e.email); if (!p) continue;
      const nm = nameOf(p) || e.name; const ads = adsOf(p);
      const st = e.status.toLowerCase();
      if (st === 'cancelled' || st === 'invalid') { add(p, nm, e.contact_id, 'Cancelled call', e.booked_at, ads, { call_id: e.event_id, call_at: e.start_time }); continue; }
      add(p, nm, e.contact_id, 'Booked call', e.booked_at, ads, { call_id: e.event_id, call_at: e.start_time });
      if (st === 'showed') add(p, nm, e.contact_id, 'Attended call', e.start_time, ads, { call_id: e.event_id });
      else if (st === 'noshow') add(p, nm, e.contact_id, 'No-show', e.start_time, ads, { call_id: e.event_id });
      else if (e.start_time <= now) add(p, nm, e.contact_id, 'Call outcome not marked', e.start_time, ads, { call_id: e.event_id });
    }
    const stageName = new Map(stages.map((s) => [s.stage_id, s.stage]));
    for (const o of opps) {
      if (staffIds.has(o.contact_id) || isStaff(o.contact_id, '', o.name)) continue;
      const p = who(o.contact_id, o.name, ''); if (!p) continue;
      const nm = nameOf(p) || o.name; const ads = adsOf(p);
      const stage = (stageName.get(o.stage_id) || '').toLowerCase();
      if (CONFIRMED_STAGES.includes(stage) || o.status === 'won') add(p, nm, o.contact_id, 'Confirmed qualified', o.stage_changed_at, ads);
      if (o.status === 'won' || stage === 'closed') add(p, nm, o.contact_id, 'Customer', o.status_changed_at, ads, { value: o.value });
      else if (o.status === 'lost') add(p, nm, o.contact_id, 'Lost', o.status_changed_at, ads);
    }
    return out.sort((a, b) => b.at.localeCompare(a.at));
  },
});

dash.calc('people', {
  title: 'People and the furthest step they reached',
  description: 'One row per person from the action log: their application result, Funnel B, call and sales outcome.',
  inputs: ['actions'],
  fn: (actions) => {
    const by = new Map();
    for (const a of actions) { if (!by.has(a.person)) by.set(a.person, []); by.get(a.person).push(a); }
    const has = (list, x) => list.some((a) => a.action === x);
    return [...by.entries()].map(([person, list]) => {
      const first = list.reduce((m, a) => (a.date < m ? a.date : m), list[0].date);
      const funnelA = has(list, 'Qualified') ? 'Completed · qualified' : has(list, 'Disqualified') ? 'Completed · not qualified' : has(list, 'Started application only') ? 'Started, did not finish' : '—';
      const call = has(list, 'Attended call') ? 'Attended' : has(list, 'No-show') ? 'No-show' : has(list, 'Call outcome not marked') ? 'Booked · outcome not marked' : has(list, 'Booked call') ? 'Booked · upcoming' : has(list, 'Cancelled call') ? 'Cancelled' : '—';
      const sales = has(list, 'Customer') ? 'Customer' : has(list, 'Lost') ? 'Lost' : has(list, 'Confirmed qualified') ? 'Confirmed qualified' : '—';
      const FIELDS = ['email', 'phone', 'company', 'role', 'team_size', 'challenge', 'budget', 'timeline', 'decision_maker', 'training', 'notes'];
      const forms = list.filter((a) => a.form).sort((a, b) => (a.action === 'Completed application' ? 0 : 1) - (b.action === 'Completed application' ? 0 : 1) || b.at.localeCompare(a.at));
      const answers = Object.fromEntries(FIELDS.map((f) => [f, (forms.find((a) => a.form[f]) || { form: {} }).form[f] || '']));
      const byTime = [...list].sort((a, b) => a.at.localeCompare(b.at));
      const ad_id = (byTime.find((a) => a.ad_id) || {}).ad_id || '';
      const main = byTime.find((a) => ['Completed application', 'Started application only', 'Lead tagged'].includes(a.action)) || byTime[0];
      return { person, name: list[0].name, first_date: first, ad_id, contact_id: main.contact_id, lead_tag: has(list, 'Lead tagged') ? 'Yes' : 'No', ...answers, funnel_a: funnelA, funnel_b: has(list, 'Funnel B opt-in') ? 'Opted in' : '—', call, sales, from_ads: list.some((a) => a.from_ads === 'Yes') ? 'Facebook/Instagram' : 'Not tracked' };
    }).sort((a, b) => b.first_date.localeCompare(a.first_date));
  },
});

dash.calc('calls', {
  title: 'Intro calls',
  description: 'Bookings with Chris from the action log, newest call first.',
  inputs: ['actions'],
  fn: (actions) => {
    const outcome = new Map();
    for (const a of actions) if (a.call_id && a.action !== 'Booked call') outcome.set(a.call_id, a.action);
    return actions.filter((a) => a.action === 'Booked call' || a.action === 'Cancelled call').map((a) => {
      const o = a.action === 'Cancelled call' ? 'Cancelled' : ({ 'Attended call': 'Attended', 'No-show': 'No-show', 'Call outcome not marked': 'Outcome not marked' })[outcome.get(a.call_id)] || 'Upcoming';
      return { id: a.call_id, name: a.name, booked_date: a.date, call_at: a.call_at, start_label: new Date(a.call_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET', outcome: o };
    }).sort((a, b) => b.call_at.localeCompare(a.call_at));
  },
});

dash.calc('kpis', {
  title: 'Funnel counts by date range',
  description: 'For the last 7, 14, 30 and 90 days: spend, people at each funnel step, costs per step, and the Meta-vs-GoHighLevel reconciliation, with change against the period before.',
  inputs: ['meta_daily', 'actions'],
  fn: (days, actions) => {
    const until = days.reduce((m, d) => (d.date > m ? d.date : m), '') || new Date().toISOString().slice(0, 10);
    const shift = (d, n) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
    const div = (a, b) => (b > 0 ? a / b : null);
    const chg = (a, b) => (a == null || b == null || b === 0 ? null : (a - b) / b);
    const now = new Date().toISOString();
    const period = (since, to) => {
      const dd = days.filter((d) => d.date >= since && d.date <= to);
      const sum = (k) => dd.reduce((s, d) => s + d[k], 0);
      const spend = sum('spend'), impressions = sum('impressions'), link_clicks = sum('link_clicks');
      const inR = actions.filter((a) => a.date >= since && a.date <= to);
      const people = (...acts) => new Set(inR.filter((a) => acts.includes(a.action)).map((a) => a.person));
      const submitted = people('Completed application'), qualified = people('Qualified'), booked = people('Booked call');
      const startedAll = new Set([...people('Started application only'), ...submitted]);
      const fb = people('Funnel B opt-in');
      const dqEver = new Set(actions.filter((a) => a.action === 'Disqualified').map((a) => a.person));
      const adForms = inR.filter((a) => (a.action === 'Completed application' || a.action === 'Funnel B opt-in') && a.from_ads === 'Yes');
      const customers = inR.filter((a) => a.action === 'Customer');
      return {
        since, until: to, spend, impressions, link_clicks, landing_page_views: sum('landing_page_views'), meta_leads: sum('meta_leads'),
        ctr: div(link_clicks, impressions), cpc: div(spend, link_clicks), cpm: div(spend * 1000, impressions),
        started: startedAll.size, submitted: submitted.size, qualified: qualified.size, disqualified: people('Disqualified').size,
        booked: booked.size, attended: people('Attended call').size, no_show: people('No-show').size,
        confirmed: people('Confirmed qualified').size, customers: new Set(customers.map((a) => a.person)).size,
        revenue: customers.reduce((s, a) => s + (a.value || 0), 0),
        funnel_b: fb.size, funnel_b_from_dq: [...fb].filter((p) => dqEver.has(p)).length,
        inquiries: people('Lead tagged').size,
        cost_per_qualified: div(spend, qualified.size), cost_per_booked: div(spend, booked.size), cost_per_inquiry: div(spend, people('Lead tagged').size),
        ad_form_events: adForms.length, ad_form_people: new Set(adForms.map((a) => a.person)).size,
        untracked_submissions: inR.filter((a) => (a.action === 'Completed application' || a.action === 'Funnel B opt-in') && a.from_ads === 'No').length,
        upcoming: actions.filter((a) => a.action === 'Booked call' && a.call_at > now).length,
        unmarked: actions.filter((a) => a.action === 'Call outcome not marked').length,
      };
    };
    return [7, 14, 30, 90].map((n) => {
      const cur = period(shift(until, -(n - 1)), until);
      const prev = period(shift(until, -(2 * n - 1)), shift(until, -n));
      const out = Object.assign({ range: n + 'd' }, cur);
      for (const k of ['spend', 'inquiries', 'qualified', 'booked', 'cost_per_qualified', 'cost_per_booked']) out[k + '_chg'] = chg(cur[k], prev[k]);
      return out;
    });
  },
});

dash.calc('daily', {
  title: 'Spend and applications per day',
  description: 'Meta spend per day beside the number of completed applications that day (Eastern time).',
  inputs: ['meta_daily', 'actions'],
  fn: (days, actions) => {
    const count = new Map();
    for (const a of actions) if (a.action === 'Completed application') count.set(a.date, (count.get(a.date) || 0) + 1);
    return days.map((d) => ({ date: d.date, spend: d.spend, applications: count.get(d.date) || 0 })).sort((a, b) => a.date.localeCompare(b.date));
  },
});

dash.calc('ad_table', {
  title: 'Results by ad',
  description: 'Each ad with spend in the last 90 days: Meta numbers beside the GoHighLevel submissions and qualified applicants tagged with that ad.',
  inputs: ['meta_ads', 'actions'],
  fn: (ads, actions) => {
    const count = (id, acts) => actions.filter((a) => a.ad_id === id && acts.includes(a.action)).length;
    return ads.filter((a) => a.spend > 0).map((a) => ({
      ad_id: a.ad_id, ad_name: a.ad_name, adset_name: a.adset_name, status: a.status === 'ACTIVE' ? 'Active' : 'Paused',
      spend: a.spend, impressions: a.impressions, ctr: a.impressions ? a.link_clicks / a.impressions : null, cpc: a.link_clicks ? a.spend / a.link_clicks : null,
      meta_leads: a.meta_leads, ghl_submissions: count(a.ad_id, ['Completed application', 'Funnel B opt-in']), qualified: count(a.ad_id, ['Qualified']),
    })).sort((a, b) => b.spend - a.spend);
  },
});

dash.calc('health', {
  title: 'Record-keeping checks',
  description: 'Gaps in GoHighLevel that stop later funnel steps from being counted.',
  inputs: ['people', 'actions', 'ghl_opps'],
  fn: (people, actions, opps) => {
    const unmarked = actions.filter((a) => a.action === 'Call outcome not marked');
    const qualNoCall = people.filter((p) => p.funnel_a === 'Completed · qualified' && p.call === '—');
    const inPipe = new Set(opps.map((o) => o.contact_id));
    const notInPipe = people.filter((p) => p.funnel_a.startsWith('Completed') && !actions.some((a) => a.person === p.person && inPipe.has(a.contact_id)));
    const untracked = people.filter((p) => p.from_ads === 'Not tracked' && p.funnel_a.startsWith('Completed'));
    const started = people.filter((p) => p.funnel_a === 'Started, did not finish');
    const list = (rows) => rows.map((r) => r.name).join(', ');
    const untagged = people.filter((p) => p.funnel_a !== '—' && p.lead_tag !== 'Yes');
    return [
      { check: 'Call outcomes are marked', ok: unmarked.length ? 'Needs attention' : 'OK', detail: unmarked.length ? `${unmarked.length} past call(s) still say confirmed: ${unmarked.map((a) => a.name).join(', ')}. Mark Showed or No-show so attended calls count.` : 'Every past call has an outcome.' },
      { check: 'Qualified applicants have booked', ok: qualNoCall.length ? 'Needs attention' : 'OK', detail: qualNoCall.length ? `Qualified but no call booked: ${list(qualNoCall)}. Worth a follow-up.` : 'Every qualified applicant has booked.' },
      { check: 'Completed applications are in the sales pipeline', ok: notInPipe.length ? 'Needs attention' : 'OK', detail: notInPipe.length ? `No opportunity in New Velocity Sales: ${list(notInPipe)}. Confirmed qualification and sales outcomes are read from the pipeline.` : 'All completed applications have an opportunity.' },
      { check: 'Applications carry ad tracking', ok: untracked.length ? 'Needs attention' : 'OK', detail: untracked.length ? `No Facebook/Instagram tracking on: ${list(untracked)}. They count in GoHighLevel but not in Meta.` : 'All applications are tracked to an ad.' },
      { check: 'Application-page contacts carry the 9miles media lead tag', ok: untagged.length ? 'Needs attention' : 'OK', detail: untagged.length ? `Missing the tag: ${list(untagged)}. Add it in GoHighLevel (or check the auto-tag workflow) so they count as leads.` : 'Everyone who entered through the application page is tagged.' },
      { check: 'Started but didn’t finish the application', ok: started.length ? 'Needs attention' : 'OK', detail: started.length ? `${started.length} people left contact details but didn’t submit: ${list(started)}. Possible follow-up list.` : 'None.' },
    ];
  },
});

dash.calc('highlights', {
  title: 'Best results since the campaign started',
  description: 'The strongest ad, cost, click-through, week and quality numbers across all spend so far (last 90 days of Meta data).',
  inputs: ['meta_ads', 'meta_daily', 'actions'],
  fn: (ads, days, actions) => {
    const usd = (v) => '$' + Math.round(v).toLocaleString('en-US');
    const pct = (v, d) => (v * 100).toFixed(d) + '%';
    const apps = actions.filter((a) => a.action === 'Completed application');
    const qual = actions.filter((a) => a.action === 'Qualified');
    const people = (list) => new Set(list.map((a) => a.person)).size;
    const byAd = new Map();
    for (const ad of ads) {
      const c = byAd.get(ad.ad_name) || { name: ad.ad_name, ids: [], spend: 0, impressions: 0, link_clicks: 0 };
      c.ids.push(ad.ad_id); c.spend += ad.spend; c.impressions += ad.impressions; c.link_clicks += ad.link_clicks;
      byAd.set(ad.ad_name, c);
    }
    const creatives = [...byAd.values()].map((c) => Object.assign(c, {
      apps: people(apps.filter((a) => c.ids.includes(a.ad_id))),
      qualified: people(qual.filter((a) => c.ids.includes(a.ad_id))),
    }));
    const totalSpend = days.reduce((s, d) => s + d.spend, 0);
    const out = [];
    const top = creatives.filter((c) => c.apps > 0).sort((a, b) => b.qualified - a.qualified || b.apps - a.apps)[0];
    if (top) out.push({ key: 'top_ad', value: top.name, detail: `${top.apps} of ${people(apps)} applicants and ${top.qualified} of ${people(qual)} qualified applicants came from this ad.` });
    const cheap = creatives.filter((c) => c.apps > 0).sort((a, b) => a.spend / a.apps - b.spend / b.apps)[0];
    if (cheap && people(apps)) out.push({ key: 'best_cpa', value: usd(cheap.spend / cheap.apps), detail: `per applicant from “${cheap.name}”, against ${usd(totalSpend / people(apps))} across all ads.` });
    const ctr = ads.filter((a) => a.impressions >= 500 && a.link_clicks > 0).sort((a, b) => b.link_clicks / b.impressions - a.link_clicks / a.impressions)[0];
    if (ctr) out.push({ key: 'best_ctr', value: pct(ctr.link_clicks / ctr.impressions, 1), detail: `“${ctr.ad_name}” (${ctr.adset_name}) at $${(ctr.spend / ctr.link_clicks).toFixed(2)} per click.` });
    const weekOf = (d) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7)); return t.toISOString().slice(0, 10); };
    const weeks = new Map();
    for (const a of actions) { const w = weekOf(a.date); if (!weeks.has(w)) weeks.set(w, []); weeks.get(w).push(a); }
    const best = [...weeks.entries()].map(([w, list]) => ({ w, apps: people(list.filter((a) => a.action === 'Completed application')), qual: people(list.filter((a) => a.action === 'Qualified')), booked: people(list.filter((a) => a.action === 'Booked call')) }))
      .filter((x) => x.apps > 0).sort((a, b) => b.apps - a.apps || b.qual - a.qual)[0];
    if (best) out.push({ key: 'best_week', value: `${best.apps} applications`, detail: `Week of ${new Date(best.w + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}: ${best.qual} qualified and ${best.booked} booked a call.` });
    if (people(apps)) out.push({ key: 'qual_rate', value: pct(people(qual) / people(apps), 0), detail: `${people(qual)} of ${people(apps)} completed applications passed the qualifying questions.` });
    const metaLeads = days.reduce((s, d) => s + d.meta_leads, 0);
    const tracked = actions.filter((a) => (a.action === 'Completed application' || a.action === 'Funnel B opt-in') && a.from_ads === 'Yes').length;
    if (metaLeads) out.push({ key: 'tracking', value: pct(Math.min(1, tracked / metaLeads), 0), detail: `${Math.min(tracked, metaLeads)} of ${metaLeads} Meta-reported leads match a form submission in GoHighLevel.` });
    return out;
  },
});
