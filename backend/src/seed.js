const bcrypt = require('bcryptjs');
const pool = require('./db');

const SEED_PASSWORD = 'TestPass123!';

const IMG_DELTAQUAD = 'https://commons.wikimedia.org/wiki/Special:FilePath/DeltaQuad_VTOL_surveillance_UAV.jpg?width=800';
const IMG_MITSUBISHI = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mitsubishi_Fixed-wing_VTOL_UAV_front_view_at_JASDF_Gifu_Air_Base_November_17,_2024.jpg?width=800';
const IMG_ZIPLINE = 'https://commons.wikimedia.org/wiki/Special:FilePath/Zipline_Drone_Launch.jpg?width=800';
const IMG_FLARGO = 'https://commons.wikimedia.org/wiki/Special:FilePath/Flargo_Heavy-Lift_Drone_(quarry).jpg?width=800';

async function resetTables() {
  await pool.query(
    `TRUNCATE TABLE newsletter_subscribers, activity_events, campaign_links, favorites, testimonials, inquiries, gallery_items, articles, drones, users RESTART IDENTITY CASCADE`
  );
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const rows = [
    { key: 'admin', email: 'admin@punctuldezbor.com', name: 'Site Admin', role: 'admin', referral_source: null },
    { key: 'editor', email: 'editor@punctuldezbor.com', name: 'Campaign Editor', role: 'editor', referral_source: null },
    { key: 'reader1', email: 'reader1@example.com', name: 'Elena Popescu', role: 'user', referral_source: 'yt-launch' },
    { key: 'reader2', email: 'reader2@example.com', name: 'Marcus Ionescu', role: 'user', referral_source: 'ig-teaser' },
    { key: 'reader3', email: 'reader3@example.com', name: 'Anca Dumitrescu', role: 'user', referral_source: null },
    { key: 'reader4', email: 'reader4@example.com', name: 'Tudor Radu', role: 'user', referral_source: 'fb-demo-day' },
    { key: 'reader5', email: 'reader5@example.com', name: 'Ioana Marin', role: 'user', referral_source: null },
    { key: 'reader6', email: 'reader6@example.com', name: 'Bogdan Stanciu', role: 'user', referral_source: 'yt-launch' },
  ];

  const ids = {};
  for (const u of rows) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, referral_source)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [u.email, passwordHash, u.name, u.role, u.referral_source]
    );
    ids[u.key] = result.rows[0].id;
  }
  return ids;
}

async function seedDrones() {
  const rows = [
    {
      key: 'vimanaLs',
      name: 'VIMANA-LS "Life Saver"',
      slug: 'vimana-ls-life-saver',
      subcategory: 'rescue',
      description: "Long-endurance fixed-wing platform purpose-built for mountain and backcountry rescue, reaching terrain quadcopters can't operate in.",
      wingspan_mm: 3000,
      weight_kg: 7,
      flight_time_min: 240,
      range_km: null,
      max_speed_kmh: null,
      payload_kg: 2,
      extra_specs: { camera: 'thermal + optical', certification: 'field-tested', propulsion: 'electric' },
      primary_image_url: IMG_DELTAQUAD,
    },
    {
      key: 'hfp2',
      name: 'HFP-2 VTOL',
      slug: 'hfp-2-vtol',
      subcategory: 'medical',
      description: 'VTOL long-range platform capable of vertical landing at incident sites without a runway — the flagship for time-critical medical and ambulance drops.',
      wingspan_mm: 3850,
      weight_kg: 25,
      flight_time_min: 210,
      range_km: 250,
      max_speed_kmh: null,
      payload_kg: 7,
      extra_specs: { camera: 'optical + thermal', certification: 'prototype', propulsion: 'electric VTOL' },
      primary_image_url: IMG_ZIPLINE,
    },
    {
      key: 'hfp1',
      name: 'HFP-1',
      slug: 'hfp-1',
      subcategory: 'police',
      description: 'Long-range fixed-wing monitoring platform for border, perimeter, and patrol surveillance missions.',
      wingspan_mm: 3850,
      weight_kg: 25,
      flight_time_min: 240,
      range_km: 250,
      max_speed_kmh: null,
      payload_kg: 7,
      extra_specs: { camera: 'optical + thermal', certification: 'production-ready', propulsion: 'electric' },
      primary_image_url: IMG_MITSUBISHI,
    },
    {
      key: 'hfp3',
      name: 'HFP-3',
      slug: 'hfp-3',
      subcategory: 'police',
      description: 'Modular-propulsion sibling to the HFP-1, trading in a combustion option for extended-endurance patrol missions.',
      wingspan_mm: 3850,
      weight_kg: 25,
      flight_time_min: 240,
      range_km: 250,
      max_speed_kmh: null,
      payload_kg: 7,
      extra_specs: { camera: 'optical + thermal', certification: 'prototype', propulsion: 'modular (electric 4hr+ / combustion 7hr+)' },
      primary_image_url: IMG_MITSUBISHI,
    },
    {
      key: 'vimana',
      name: 'VIMANA',
      slug: 'vimana',
      subcategory: 'medical',
      description: "A jet-powered, high-speed airframe originally developed for rapid-interception and target-drone roles. Its speed and short-hop profile suggest a natural extension into time-critical intervention drops — such as AEDs or blood units — though this is a forward-looking application, not an existing delivery program.",
      wingspan_mm: 1800,
      weight_kg: 7,
      flight_time_min: 45,
      range_km: null,
      max_speed_kmh: null,
      payload_kg: 2,
      extra_specs: { propulsion: 'jet', certification: 'prototype tested', origin: 'originally a high-speed target/interceptor platform' },
      primary_image_url: IMG_FLARGO,
    },
  ];

  const ids = {};
  for (const d of rows) {
    const result = await pool.query(
      `INSERT INTO drones (name, slug, subcategory, description, wingspan_mm, weight_kg, flight_time_min, range_km, max_speed_kmh, payload_kg, extra_specs, primary_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        d.name,
        d.slug,
        d.subcategory,
        d.description,
        d.wingspan_mm,
        d.weight_kg,
        d.flight_time_min,
        d.range_km,
        d.max_speed_kmh,
        d.payload_kg,
        JSON.stringify(d.extra_specs),
        d.primary_image_url,
      ]
    );
    ids[d.key] = result.rows[0].id;
  }
  return ids;
}

async function seedArticles(userIds, droneIds) {
  const rows = [
    { key: 'ruralEmergency', title: 'Why Fixed-Wing VTOL Is Changing Rural Emergency Response', slug: 'why-fixed-wing-vtol-changing-rural-emergency-response', body: 'A look at how VTOL drones combine the range of fixed-wing aircraft with the launch flexibility of multirotors to reach remote areas in minutes rather than hours.', author_id: userIds.editor, category: 'research', status: 'published', featured_image_url: IMG_DELTAQUAD, related_drone_id: null },
    { key: 'vimanaLsInside', title: "Inside VIMANA-LS: Reaching Where Quadcopters Can't", slug: 'inside-vimana-ls-reaching-where-quadcopters-cant', body: 'A closer look at the endurance and sensor tradeoffs behind the mountain-rescue platform, and what search-and-rescue teams have found in the field.', author_id: userIds.editor, category: 'review', status: 'published', featured_image_url: IMG_DELTAQUAD, related_drone_id: droneIds.vimanaLs },
    { key: 'hfp2MedicalFlagship', title: 'Building HFP-2: A VTOL Platform for the First Golden Hour', slug: 'building-hfp-2-vtol-first-golden-hour', body: 'Vertical takeoff and landing means no drop zone and no circling — just a direct landing at the scene. Here is why that matters for time-critical medical response.', author_id: userIds.admin, category: 'research', status: 'published', featured_image_url: IMG_ZIPLINE, related_drone_id: droneIds.hfp2 },
    { key: 'patrolAtRange', title: 'Patrol at Range: What the HFP-1 Brings to Border and Perimeter Security', slug: 'patrol-at-range-hfp-1-border-perimeter-security', body: 'Four-plus hours of loiter time changes how a single platform can cover a patrol route. A look at the endurance tradeoffs behind the HFP-1.', author_id: userIds.editor, category: 'review', status: 'published', featured_image_url: IMG_MITSUBISHI, related_drone_id: droneIds.hfp1 },
    { key: 'economics', title: 'The Economics of Fixed-Wing VTOL: Is It Worth the Premium?', slug: 'economics-of-fixed-wing-vtol-premium', body: 'Fixed-wing VTOL platforms cost more upfront than standard multirotors. We break down total cost of ownership across a three-year operating window.', author_id: userIds.editor, category: 'research', status: 'draft', featured_image_url: IMG_FLARGO, related_drone_id: null },
  ];

  const ids = {};
  for (const a of rows) {
    const result = await pool.query(
      `INSERT INTO articles (title, slug, body, author_id, category, status, featured_image_url, related_drone_id, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [a.title, a.slug, a.body, a.author_id, a.category, a.status, a.featured_image_url, a.related_drone_id, a.status === 'published' ? new Date() : null]
    );
    ids[a.key] = result.rows[0].id;
  }
  return ids;
}

async function seedGalleryItems(droneIds) {
  const rows = [
    { title: 'Ridge Line Rescue Demo', description: 'VIMANA-LS locating a stranded hiker during a live mountain rescue exercise.', media_url: IMG_DELTAQUAD, media_type: 'image', category: 'rescue', drone_id: droneIds.vimanaLs },
    { title: 'Golden Hour Response', description: 'HFP-2 completing a vertical landing at a simulated roadside trauma scene.', media_url: IMG_ZIPLINE, media_type: 'image', category: 'medical', drone_id: droneIds.hfp2 },
    { title: 'Perimeter Overwatch', description: 'HFP-1 holding a four-hour patrol loiter during a joint police exercise.', media_url: IMG_MITSUBISHI, media_type: 'image', category: 'police', drone_id: droneIds.hfp1 },
    { title: 'Extended-Endurance Patrol', description: 'HFP-3 running its combustion propulsion mode during an overnight patrol demonstration.', media_url: IMG_MITSUBISHI, media_type: 'image', category: 'police', drone_id: droneIds.hfp3 },
    { title: 'Rapid-Response Concept Flight', description: "VIMANA during a speed trial exploring its potential for time-critical drops.", media_url: IMG_FLARGO, media_type: 'image', category: 'medical', drone_id: droneIds.vimana },
    { title: 'Night Thermal Search Pass', description: 'VIMANA-LS running a thermal search pattern over forested terrain at dusk.', media_url: IMG_DELTAQUAD, media_type: 'image', category: 'rescue', drone_id: droneIds.vimanaLs },
    { title: '#PunctulDeZbor Demo Day', description: 'Community turnout watching a live VTOL transition demo at the campaign launch event.', media_url: IMG_MITSUBISHI, media_type: 'image', category: 'campaign', drone_id: null },
    { title: 'Behind the Build — Assembly Floor', description: 'A look at the assembly process ahead of demo day.', media_url: IMG_FLARGO, media_type: 'image', category: 'campaign', drone_id: null },
  ];

  for (const g of rows) {
    await pool.query(
      `INSERT INTO gallery_items (title, description, media_url, media_type, category, drone_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [g.title, g.description, g.media_url, g.media_type, g.category, g.drone_id]
    );
  }
}

async function seedInquiries(userIds, droneIds) {
  const rows = [
    { user_id: userIds.reader1, drone_id: droneIds.vimanaLs, message: 'What is the maximum wind speed VIMANA-LS is rated for during search operations at altitude?', status: 'new' },
    { user_id: userIds.reader2, drone_id: droneIds.hfp2, message: 'Can the HFP-2 carry a cold-chain container for blood products, and if so what is the maximum duration before temperature becomes a concern?', status: 'contacted' },
    { user_id: userIds.reader3, drone_id: droneIds.hfp1, message: "Do you offer a package for a county sheriff's department looking to replace two aging fixed-wing patrol platforms?", status: 'new' },
    { user_id: userIds.reader1, drone_id: droneIds.hfp3, message: 'What is the lead time on the combustion propulsion module for HFP-3?', status: 'new' },
    { user_id: userIds.reader4, drone_id: droneIds.vimana, message: 'Is VIMANA available for evaluation as a rapid-response asset, or is it still defense-only?', status: 'new' },
    { user_id: userIds.reader5, drone_id: droneIds.vimanaLs, message: 'What certifications does VIMANA-LS currently hold for operating in EU alpine airspace?', status: 'contacted' },
    { user_id: userIds.reader6, drone_id: droneIds.hfp2, message: 'Can the HFP-2 be configured for both medical and light cargo drops on the same airframe?', status: 'closed' },
    { user_id: userIds.reader2, drone_id: null, message: 'We are a regional EMS provider evaluating VTOL delivery generally — could someone walk us through pricing and pilot-training requirements?', status: 'new' },
    { user_id: userIds.reader3, drone_id: droneIds.hfp1, message: 'What is the warranty period on the HFP-1 airframe and sensor payload?', status: 'closed' },
    { user_id: userIds.reader6, drone_id: droneIds.hfp3, message: 'Do you have case studies from any police aviation units currently operating HFP-3?', status: 'contacted' },
  ];

  for (const i of rows) {
    await pool.query(
      `INSERT INTO inquiries (user_id, drone_id, message, status)
       VALUES ($1, $2, $3, $4)`,
      [i.user_id, i.drone_id, i.message, i.status]
    );
  }
}

async function seedTestimonials(droneIds) {
  const rows = [
    { drone_id: droneIds.vimanaLs, agency_name: 'Cascade County Search & Rescue', contact_title: 'Operations Chief', quote: 'We reached a hiker with a broken leg eleven kilometers up a ridge in under twenty minutes. A ground team would have taken most of the day.', outcome: 'Located and confirmed a stranded hiker in low visibility, cutting response time from an estimated 4+ hours on foot to under 20 minutes.', featured: true },
    { drone_id: droneIds.vimanaLs, agency_name: 'Northridge Mountain Rescue Volunteers', contact_title: 'Team Lead', quote: 'Its ability to launch and land off a switchback road saved us from a two-hour hike just to get eyes in the air.', outcome: 'Enabled rapid deployment from a roadside launch point in terrain with no flat ground for a runway.', featured: false },
    { drone_id: droneIds.hfp2, agency_name: 'Northgate Regional EMS', contact_title: 'Medical Director', quote: 'Landing directly at the scene instead of circling for a drop zone means our AED gets to the patient minutes sooner.', outcome: 'Cut defibrillator delivery time to a rural cardiac-arrest call by approximately 6 minutes versus the nearest ambulance unit.', featured: true },
    { drone_id: droneIds.hfp2, agency_name: 'Truvale County Blood Services', contact_title: 'Logistics Coordinator', quote: 'We moved a cross-matched unit between two rural hospitals faster than our courier van could clear traffic.', outcome: 'Delivered a time-sensitive blood unit between facilities 40km apart in under 25 minutes.', featured: false },
    { drone_id: droneIds.hfp1, agency_name: "Meridian County Sheriff's Office", contact_title: 'Air Support Unit Commander', quote: 'Four hours of loiter time over a perimeter means one platform covers what used to take two crews in relief shifts.', outcome: 'Maintained continuous overwatch on an active perimeter search for a full shift without a mid-mission swap.', featured: true },
    { drone_id: droneIds.hfp1, agency_name: 'Portstead Border Patrol Division', contact_title: 'Field Operations Supervisor', quote: 'Long endurance let us watch a stretch of border overnight without repositioning a crewed aircraft.', outcome: 'Extended unbroken surveillance coverage of a border segment through a full overnight shift.', featured: false },
    { drone_id: droneIds.hfp3, agency_name: 'Westfield Regional Police Aviation Unit', contact_title: 'Unit Commander', quote: 'The combustion mode gave us a full extra patrol cycle before we had to bring it in.', outcome: 'Extended a single patrol sortie from roughly four hours to over seven using the combustion propulsion mode.', featured: false },
  ];

  for (const t of rows) {
    await pool.query(
      `INSERT INTO testimonials (drone_id, agency_name, contact_title, quote, outcome, featured)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [t.drone_id, t.agency_name, t.contact_title, t.quote, t.outcome, t.featured]
    );
  }
}

async function seedFavorites(userIds, droneIds, articleIds) {
  const rows = [
    { user_id: userIds.reader1, item_type: 'drone', item_id: droneIds.vimanaLs },
    { user_id: userIds.reader1, item_type: 'drone', item_id: droneIds.hfp2 },
    { user_id: userIds.reader1, item_type: 'article', item_id: articleIds.vimanaLsInside },
    { user_id: userIds.reader2, item_type: 'drone', item_id: droneIds.hfp1 },
    { user_id: userIds.reader2, item_type: 'article', item_id: articleIds.ruralEmergency },
    { user_id: userIds.reader3, item_type: 'drone', item_id: droneIds.hfp2 },
    { user_id: userIds.reader4, item_type: 'drone', item_id: droneIds.hfp3 },
    { user_id: userIds.reader5, item_type: 'drone', item_id: droneIds.vimana },
    { user_id: userIds.reader5, item_type: 'drone', item_id: droneIds.vimanaLs },
    { user_id: userIds.reader6, item_type: 'article', item_id: articleIds.patrolAtRange },
  ];

  for (const f of rows) {
    await pool.query(
      `INSERT INTO favorites (user_id, item_type, item_id)
       VALUES ($1, $2, $3)`,
      [f.user_id, f.item_type, f.item_id]
    );
  }
}

async function seedCampaignLinks() {
  const rows = [
    { key: 'ytLaunch', slug: 'yt-launch', platform: 'youtube', destination_path: '/' },
    { key: 'fbDemoDay', slug: 'fb-demo-day', platform: 'facebook', destination_path: '/drones' },
    { key: 'igTeaser', slug: 'ig-teaser', platform: 'instagram', destination_path: '/articles/inside-vimana-ls-reaching-where-quadcopters-cant' },
    { key: 'ytRescueDeepdive', slug: 'yt-rescue-deepdive', platform: 'youtube', destination_path: '/articles/building-hfp-2-vtol-first-golden-hour' },
  ];

  const ids = {};
  for (const c of rows) {
    const result = await pool.query(
      `INSERT INTO campaign_links (slug, platform, destination_path)
       VALUES ($1, $2, $3) RETURNING id`,
      [c.slug, c.platform, c.destination_path]
    );
    ids[c.key] = result.rows[0].id;
  }
  return ids;
}

async function seedNewsletterSubscribers(userIds) {
  const rows = [
    { email: 'newsletter1@example.com', referral_source: 'yt-launch', user_id: userIds.reader1 },
    { email: 'newsletter2@example.com', referral_source: 'ig-teaser', user_id: null },
    { email: 'newsletter3@example.com', referral_source: null, user_id: userIds.reader3 },
    { email: 'newsletter4@example.com', referral_source: 'fb-demo-day', user_id: null },
    { email: 'newsletter5@example.com', referral_source: 'yt-rescue-deepdive', user_id: null },
  ];

  for (const n of rows) {
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, referral_source, user_id)
       VALUES ($1, $2, $3)`,
      [n.email, n.referral_source, n.user_id]
    );
  }
}

async function seedActivityEvents(userIds, droneIds, articleIds, campaignLinkIds) {
  const rows = [
    { user_id: null, anon_id: 'anon-001', event_type: 'view', target_type: 'drone', target_id: droneIds.vimanaLs, referral_source: 'ig-teaser' },
    { user_id: null, anon_id: 'anon-002', event_type: 'view', target_type: 'drone', target_id: droneIds.hfp2, referral_source: 'fb-demo-day' },
    { user_id: userIds.reader1, anon_id: null, event_type: 'view', target_type: 'drone', target_id: droneIds.vimanaLs, referral_source: null },
    { user_id: userIds.reader1, anon_id: null, event_type: 'favorite', target_type: 'drone', target_id: droneIds.vimanaLs, referral_source: null },
    { user_id: userIds.reader1, anon_id: null, event_type: 'favorite', target_type: 'drone', target_id: droneIds.hfp2, referral_source: null },
    { user_id: null, anon_id: 'anon-003', event_type: 'view', target_type: 'drone', target_id: droneIds.hfp1, referral_source: null },
    { user_id: userIds.reader2, anon_id: null, event_type: 'view', target_type: 'drone', target_id: droneIds.hfp1, referral_source: 'yt-launch' },
    { user_id: userIds.reader2, anon_id: null, event_type: 'favorite', target_type: 'drone', target_id: droneIds.hfp1, referral_source: null },
    { user_id: null, anon_id: 'anon-004', event_type: 'view', target_type: 'drone', target_id: droneIds.hfp3, referral_source: null },
    { user_id: null, anon_id: 'anon-005', event_type: 'view', target_type: 'drone', target_id: droneIds.vimana, referral_source: 'yt-rescue-deepdive' },
    { user_id: userIds.reader3, anon_id: null, event_type: 'view', target_type: 'article', target_id: articleIds.ruralEmergency, referral_source: null },
    { user_id: null, anon_id: 'anon-006', event_type: 'campaign_redirect', target_type: 'campaign_link', target_id: campaignLinkIds.ytLaunch, referral_source: 'yt-launch' },
    { user_id: null, anon_id: 'anon-007', event_type: 'campaign_redirect', target_type: 'campaign_link', target_id: campaignLinkIds.igTeaser, referral_source: 'ig-teaser' },
    { user_id: userIds.reader4, anon_id: null, event_type: 'view', target_type: 'drone', target_id: droneIds.hfp3, referral_source: null },
    { user_id: userIds.reader5, anon_id: null, event_type: 'favorite', target_type: 'drone', target_id: droneIds.vimana, referral_source: null },
  ];

  for (const e of rows) {
    await pool.query(
      `INSERT INTO activity_events (user_id, anon_id, event_type, target_type, target_id, referral_source)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [e.user_id, e.anon_id, e.event_type, e.target_type, e.target_id, e.referral_source]
    );
  }
}

async function main() {
  try {
    await resetTables();
    const userIds = await seedUsers();
    const droneIds = await seedDrones();
    const articleIds = await seedArticles(userIds, droneIds);
    await seedGalleryItems(droneIds);
    await seedInquiries(userIds, droneIds);
    await seedTestimonials(droneIds);
    await seedFavorites(userIds, droneIds, articleIds);
    const campaignLinkIds = await seedCampaignLinks();
    await seedNewsletterSubscribers(userIds);
    await seedActivityEvents(userIds, droneIds, articleIds, campaignLinkIds);
    console.log(`Every seeded user's password is: ${SEED_PASSWORD}`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
