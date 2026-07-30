const bcrypt = require('bcryptjs');
const pool = require('./db');

const SEED_PASSWORD = 'TestPass123!';

const NOW = new Date();

// Backdate helper: `daysAgo` days before the seed run, at a fixed hour/minute so
// times within the same day are still distinct and ordered.
function daysAgo(days, hour = 12, minute = 0) {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function hoursAfter(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

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

  // created_at is backdated to spread signups across the last 30 days instead of
  // clustering on seed-run time; each reader's join date lands shortly after the
  // campaign bump tied to their referral_source (see seedActivityEvents).
  const rows = [
    { key: 'admin', email: 'admin@punctuldezbor.com', name: 'Site Admin', role: 'admin', referral_source: null, created_at: daysAgo(29, 8, 0) },
    { key: 'editor', email: 'editor@punctuldezbor.com', name: 'Campaign Editor', role: 'editor', referral_source: null, created_at: daysAgo(28, 9, 30) },
    { key: 'reader3', email: 'reader3@example.com', name: 'Anca Dumitrescu', role: 'user', referral_source: null, created_at: daysAgo(27, 14, 0) },
    { key: 'reader1', email: 'reader1@example.com', name: 'Elena Popescu', role: 'user', referral_source: 'yt-launch', created_at: daysAgo(23, 19, 0) },
    { key: 'reader6', email: 'reader6@example.com', name: 'Bogdan Stanciu', role: 'user', referral_source: 'yt-launch', created_at: daysAgo(21, 20, 45) },
    { key: 'reader4', email: 'reader4@example.com', name: 'Tudor Radu', role: 'user', referral_source: 'fb-demo-day', created_at: daysAgo(13, 21, 15) },
    { key: 'reader5', email: 'reader5@example.com', name: 'Ioana Marin', role: 'user', referral_source: null, created_at: daysAgo(9, 11, 0) },
    { key: 'reader2', email: 'reader2@example.com', name: 'Marcus Ionescu', role: 'user', referral_source: 'ig-teaser', created_at: daysAgo(4, 17, 30) },
  ];

  const ids = {};
  for (const u of rows) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, referral_source, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [u.email, passwordHash, u.name, u.role, u.referral_source, u.created_at]
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
      max_speed_kmh: 500,
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
    {
      key: 'angelFunding',
      title: "Inside BraveX's €315,000 Seed Round from the Transylvania Angels Network",
      slug: 'inside-bravex-315000-seed-round-transylvania-angels-network',
      body: `Three hundred fifteen thousand euros is a modest number by aerospace standards — barely enough to certify a single new sensor package on some defense programs. For BraveX Aero, it was the check that turned a Cluj-Napoca prototype line into a company with a production target and a published timeline.

The round came from the Transylvania Angels Network, a regional group of angel investors that has increasingly backed deep-tech ventures coming out of Romania's Cluj-Napoca tech corridor. For BraveX, still a small team building fixed-wing and VTOL airframes largely by hand, the investment covered the transition period between "we can build one of these" and "we can build these repeatedly, to spec, on a schedule."

The numbers behind that transition are specific. At the time of the round, BraveX was producing a little over 70 drones a year — respectable for a startup, but far short of what a serious European manufacturer needs to compete on price and delivery time. The figure BraveX put on its own ambition in 2025 was 500 units a year by 2028, a sevenfold increase, backed by a stated goal of becoming one of Europe's leading producers of high-endurance industrial drones by 2030.

Closing a gap that size is not just a manufacturing problem — it's a working-capital problem. Composite airframes, avionics, and flight-test campaigns all have to be paid for months before a customer contract closes. Angel funding at this stage typically isn't meant to fund the scale-up itself; it's meant to fund the proof that the scale-up is worth someone else's larger check. BraveX has treated it that way, using the round toward production tooling and prototype validation rather than headcount growth.

It worked as a bridge. BraveX has since opened a considerably larger funding conversation — a €4 million round tied directly to a new production partnership with Romaero, Romania's state-owned aerospace manufacturer — and the roadmap that partnership actually set out is more modest than the number floated in 2025: a combined 17 aircraft a month today, scaling to 30 a month, or 360 a year, by 2028. The Transylvania Angels money won't be the headline figure in BraveX's funding history, and the 2028 target it was raised against didn't survive contact with a concrete industrial partner. But it's still the round that paid for the credibility the later, more specific rounds needed.`,
      author_id: userIds.admin,
      category: 'company',
      status: 'published',
      featured_image_url: IMG_FLARGO,
      related_drone_id: null,
    },
    {
      key: 'founderOrigin',
      title: 'A Lifelong Obsession With Flight: The Founder Story Behind BraveX Aero',
      slug: 'lifelong-obsession-with-flight-founder-story-bravex-aero',
      body: `Rareș Răcoțean has been fascinated by aeronautics since he was seven years old. By seventeen, he was a licensed pilot. Neither fact, on its own, explains how a person ends up founding an aerospace manufacturer — but together they describe the kind of obsession that usually precedes one.

BraveX Aero's technical work began in earnest in 2020, when Răcoțean — now the company's CTO — started the research that would become its first airframes. The company spent its first three years not selling anything, but building technical expertise, constructing prototypes, and validating them against real missions rather than lab conditions. That's a long runway for a startup with no outside product to show investors, and it's part of why BraveX's public funding history only starts in 2025: the company spent its first three years earning the right to ask for money, not asking for it.

The mission BraveX states publicly is not subtle: contribute to the protection of people, environmental monitoring, and saving lives. In practice, that translates into a specific engineering bet — building where standard multirotor drones fall short. A quadcopter tops out around 90 minutes of flight time and a 20-30 kilometer range; BraveX's fixed-wing and VTOL platforms are built for four-hour endurance and 250 kilometers, numbers that matter enormously to a mountain rescue team searching a ridge line or a border patrol unit covering a stretch of perimeter overnight.

Răcoțean isn't running BraveX alone. Răzvan Costea-Bărluțiu serves as CEO and is also an investor in the company; Iulia Oprea holds the Chief Legal & Regulations Officer role, a function that matters enormously for a company navigating both civilian aviation rules and defense-sector export considerations; and Mircea Vădan works as an investor and business development manager. It's a small, founder-heavy leadership team — the kind typical of a company still closer to its garage-prototype phase than its scaled-manufacturer phase, even as the manufacturing numbers start to look like the latter.

What BraveX doesn't publicize is a conventional founder narrative — no acquisition story, no prior exit, no press-ready origin myth beyond the pilot's license and the childhood fascination. What it has instead is six years of unglamorous technical work between "interested in planes" and "delivering airframes to paying customers," which is arguably the more useful story for anyone evaluating whether the company can execute on its 2028 production targets.`,
      author_id: userIds.editor,
      category: 'company',
      status: 'published',
      featured_image_url: IMG_DELTAQUAD,
      related_drone_id: null,
    },
    {
      key: 'urbanMobilityAccelerator',
      title: "Chosen From 50+ Applicants: BraveX Joins Romania's First Urban Mobility Accelerator",
      slug: 'chosen-from-50-applicants-bravex-urban-mobility-accelerator',
      body: `More than fifty teams from across Europe applied. Fourteen got in. BraveX Aero was one of them — an unusual credential for a company whose core products are built for mountain rescue and border patrol, not city traffic.

The programme is called inVest, and it holds the distinction of being Romania's first accelerator dedicated specifically to urban mobility — rethinking how people and goods move through cities. It's co-funded by EIT Urban Mobility and ADR Vest, and run operationally by Iceberg Plus and Cowork Timișoara. The cohort ran from July to October 2025, structured around more than ten hands-on workshops, one-on-one mentoring, and — the part that mattered most for a hardware company like BraveX — the chance to test a working solution in real urban environments across Romania's Western Region, rather than just pitch a slide deck.

BraveX's angle into an urban mobility programme is logistics, not passenger transport: fixed-wing VTOL drones positioned as an eco-friendly, high-speed alternative for last-mile delivery of critical or time-sensitive cargo. That's not a new capability the company built for the accelerator — it's the same use case already embodied in the HFP-2, the VTOL platform the company already markets for time-critical medical drops. What inVest offered wasn't a new product direction; it was a testing ground and a mentorship network for an application BraveX already believed in, plus validation from a selection committee that had fifty other pitches to choose from instead.

That distinction matters for a company at BraveX's stage. Accelerator selection doesn't come with a check attached the way an angel round does, but it comes with something a young manufacturer needs just as badly: structured exposure to potential municipal and logistics customers, plus the kind of workshop-tested traction data that makes the next funding conversation easier. For a small leadership team juggling production scaling, defense partnerships, and a swarm-coordination collaboration all in the same year, a mentorship-and-testing programme focused specifically on last-mile delivery use cases is a relatively low-cost way to keep the civilian logistics side of the business moving forward.

It's also a reminder that BraveX's platforms were never designed around a single mission profile. The same airframe pitched to a mountain rescue unit as a search tool and to a police aviation unit as a patrol asset is, in this programme, being pitched to city and regional logistics operators as a delivery vehicle. The hardware doesn't change; the story around it does.`,
      author_id: userIds.editor,
      category: 'research',
      status: 'published',
      featured_image_url: IMG_ZIPLINE,
      related_drone_id: droneIds.hfp2,
    },
    {
      key: 'swarmPartnership',
      title: 'Swarm-as-a-Service: What the Uniq Things Partnership Means for Search and Rescue',
      slug: 'swarm-as-a-service-uniq-things-partnership-search-rescue',
      body: `One operator, watching one screen, directing a dozen aircraft at once. That's the pitch behind BraveX's newest partnership — and it's a meaningfully different proposition from "our drones fly longer than a quadcopter," which has been the company's core sales argument until now.

On October 28, 2025, BraveX Aero announced a strategic partnership with Uniq Things UG, a German company that builds autonomous coordination software for drone swarms. The division of labor is straightforward: BraveX supplies the fixed-wing aircraft — the airframes, the four-hour endurance, the aerospace engineering — and Uniq Things supplies the software layer that lets multiple aircraft operate as a coordinated group rather than as separately piloted assets. Uniq Things' technology handles real-time collaboration between drones, automatically allocates tasks across the fleet, and adapts to changing mission conditions with minimal human intervention. Together, the companies are calling the resulting offering "Swarm-as-a-Service."

The applications the two companies have named are exactly the missions BraveX's catalog is already built around, just multiplied. Disaster response — floods, earthquakes, wildfires — is the clearest case: a single operator coordinating several long-endurance aircraft can cover a search area far faster than the same number of aircraft flown one at a time. Border and perimeter surveillance is the second: extended monitoring of a long stretch of terrain, split across coordinated aircraft instead of relying on one platform's loiter time. Critical infrastructure protection and communications relay — using aircraft as an aerial network to extend connectivity into underserved areas — round out the list.

Rareș Racoțean, BraveX's founder, framed the rescue case directly: simultaneous control of multiple drones allows faster coverage, he said, meaningfully increasing the chances of identifying survivors in a large-scale flood or a missing person in mountainous terrain — precisely the VIMANA-LS's home turf. Uniq Things CEO Alexander Weßling described the effect from the software side: the technology significantly increases range and operational efficiency, turning individual fixed-wing drones into coordinated aerial networks and extending both endurance and coverage well beyond what a single aircraft manages alone.

For BraveX, the partnership doesn't require redesigning any airframe — VIMANA-LS, HFP-1, HFP-2, and HFP-3 all qualify as platforms Uniq Things can coordinate. What it requires is proving the software works reliably across real missions, which is exactly the validation phase the partnership is now entering. If it holds up, the pitch to a search-and-rescue unit stops being "buy one long-endurance drone" and starts being "buy a coordinated fleet, run by one person."`,
      author_id: userIds.admin,
      category: 'research',
      status: 'published',
      featured_image_url: IMG_DELTAQUAD,
      related_drone_id: droneIds.vimanaLs,
    },
    {
      key: 'aresiaOzoirPartnership',
      title: 'ARESIA-Ozoir and VIMANA: A French Defense Partnership Takes Shape',
      slug: 'aresia-ozoir-vimana-french-defense-partnership-takes-shape',
      body: `BraveX's fastest airframe wasn't originally built to save anyone. VIMANA started life as a jet-powered target and interceptor platform — and a new partnership signed in Bucharest this year leans directly into that heritage rather than away from it.

At the Black Sea Defense, Aerospace and Security exhibition — BSDA 2026, held in Bucharest May 13-15 — BraveX Aero signed a memorandum of understanding with ARESIA-Ozoir, a French company specializing in military training and defense support systems. The agreement covers next-generation aerial systems for defense testing, evaluation, and military training applications, with an initial focus on the Romanian market and a stated long-term goal of expanding into NATO-wide opportunities.

The technical fit is specific rather than generic. VIMANA is BraveX's jet-powered platform, capable of a 500 km/h top speed and a 250 km/h cruise, and it was originally developed for rapid-interception and target-drone roles before the company began exploring civilian intervention applications for the airframe. That speed profile is exactly what a training-and-evaluation partner needs for realistic high-speed threat simulation — the kind of aerial target that can credibly stand in for something a live-fire exercise or an air-defense calibration run needs to track and intercept. Under the MOU, the companies will explore integrating specialized payloads and systems onto BraveX platforms, alongside broader cooperation on defense testing and evaluation programs.

Both companies framed the agreement as strategically significant rather than transactional. "This partnership represents an important step in BraveX's evolution as a European defense technology company," said BraveX CEO Răzvan Costea-Bărluțiu. ARESIA-Ozoir's general manager, Francois Baldeschi, described the fit in similar terms: "This strategic partnership will allow us to make the most of existing synergies between our two companies." The timing lines up with a broader pattern across European defense spending — governments increasing investment in sovereign, cost-efficient unmanned systems rather than relying solely on imported platforms.

For a Romanian manufacturer, a signed MOU with an established French defense-training specialist is also a credibility marker that's hard to manufacture internally — the kind of validation that matters when the next conversation is with a NATO procurement office rather than an angel investor. What the partnership does not yet include is a disclosed production or revenue commitment; at this stage, it's a framework for collaboration, not a contract. Whether it converts into orders is the next thing to watch.`,
      author_id: userIds.admin,
      category: 'company',
      status: 'draft',
      featured_image_url: IMG_FLARGO,
      related_drone_id: droneIds.vimana,
    },
    {
      key: 'romaeroScaling',
      title: '17 Aircraft a Month: Inside the Romaero Production Partnership',
      slug: '17-aircraft-a-month-inside-romaero-production-partnership',
      body: `Designing a drone that works is one problem. Building seventeen of them a month, on schedule, to spec, is an entirely different one — and it's the problem BraveX just spent a production partnership solving.

Also signed at BSDA 2026, BraveX Aero's memorandum of understanding with Romaero — Romania's state-owned aerospace manufacturer — targets a combined industrial capacity of up to 17 unmanned aircraft a month: 7 a month from BraveX's own line, 10 a month from Romaero's, with Romaero's existing capacity able to be activated within roughly a week for urgent orders. The stated roadmap extends that further, to 30 airframes a month — 360 a year — by 2028: a more concrete, and more modest, figure than the standalone 500-units-a-year target BraveX had publicized a year earlier, before Romaero's capacity entered the plan.

The partnership is backed by a separate €4 million funding round, raised specifically to expand production capacity and industrialize new platforms rather than to fund R&D. The timeline attached to that money is unusually specific for a young manufacturer: BraveX's new production facility — handling composite airframe manufacturing plus mechatronics integration, assembly, and testing — becomes fully operational this August. The Romaero partnership enters its production phase the following month, with the first structure of a new aircraft, internally called BraveX-1, scheduled for completion in September. By the fourth quarter of the year, the two companies plan to begin preparing production of another platform, the BraveX-Delta.

Headcount is scaling alongside the hardware. BraveX expects to grow from 23 employees to 28 by the end of the year, with a target of roughly 50 employees by the end of 2028 — roughly doubling the team over three years to support the production ramp. CEO Răzvan Costea-Bărluțiu framed the logic behind moving early rather than reactively: "In the defense sector, ability to scale production rapidly should not be improvised; it must be designed in advance."

That's the real subject of this partnership — not any single aircraft, but the industrial plumbing underneath all of them. A drone manufacturer that can promise a customer a delivery date and hit it, repeatedly, is a fundamentally different kind of vendor than one that can only promise a working prototype. Romaero's decades of aerospace manufacturing experience is what BraveX is renting, in effect, to get there faster than building that capability alone would allow.`,
      author_id: userIds.admin,
      category: 'research',
      status: 'published',
      featured_image_url: IMG_MITSUBISHI,
      related_drone_id: null,
    },
    {
      key: 'vimanaJetMilestone',
      title: "20 Test Flights, 800 Kilometers: VIMANA's Jet Platform Enters Service",
      slug: '20-test-flights-800-km-vimana-jet-platform-enters-service',
      body: `For most of its development, VIMANA existed mainly on paper and on a test range. That changed this year: the airframe has completed its validation campaign and made its first deliveries to paying customers.

The numbers behind that shift are specific. BraveX's jet-powered VIMANA platform completed more than twenty test flights, covering a combined 800 kilometers, en route to a top speed of 500 km/h and a 250 km/h cruise — figures that put it well outside the performance envelope of the company's other, propeller-driven airframes, which trade speed for endurance. VIMANA's flight duration runs 45 minutes, short by BraveX's usual four-hour standard, but the platform was never built for endurance. It was built for speed.

That distinction traces back to VIMANA's origin as a high-speed target and interceptor platform, developed before BraveX began exploring civilian and time-critical intervention applications for the airframe — the company has been explicit that using VIMANA for AED or blood-unit drops is a forward-looking application rather than an existing delivery program. The defense use case, though, is no longer forward-looking. BraveX delivered VIMANA units under what the company has called its largest project to date, a contract signed in autumn 2025, and that delivery reportedly helped secure additional contracts with both private and government customers in Europe's security sector.

Founder and CTO Rareș Racoțean summarized the milestone plainly: "Flight tests and technical validations have been completed, and the drones have already been delivered to customers." That's a notable claim for any small manufacturer to make about its fastest and most complex airframe, and it sets up VIMANA as the platform most likely to benefit from BraveX's newer partnership with France's ARESIA-Ozoir, which is specifically interested in jet-powered aircraft for high-speed threat simulation and training.

VIMANA was scheduled to be on display at BSDA 2026 in Bucharest alongside the rest of BraveX's lineup. For a platform that started as an interceptor prototype, going from test range to customer deliveries to a trade-show floor in the same year is a fast trajectory — and one that suggests BraveX sees the jet platform less as a side project than as a second core product line alongside its VTOL and fixed-wing endurance aircraft.`,
      author_id: userIds.editor,
      category: 'review',
      status: 'published',
      featured_image_url: IMG_FLARGO,
      related_drone_id: droneIds.vimana,
    },
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
    { title: 'Rapid-Response Concept Flight', description: "VIMANA running a speed trial exploring its potential for time-critical drops.", media_url: IMG_FLARGO, media_type: 'image', category: 'medical', drone_id: droneIds.vimana },
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
  // created_at is backdated across the 30-day window; contacted_at (only for
  // 'contacted'/'closed' rows) is created_at plus a multi-hour gap, always with
  // enough margin that the gap still lands before "now".
  const rows = [
    { user_id: userIds.reader1, drone_id: droneIds.vimanaLs, message: 'What is the maximum wind speed VIMANA-LS is rated for during search operations at altitude?', status: 'new', created_at: daysAgo(22, 10, 0) },
    { user_id: userIds.reader2, drone_id: droneIds.hfp2, message: 'Can the HFP-2 carry a cold-chain container for blood products, and if so what is the maximum duration before temperature becomes a concern?', status: 'contacted', created_at: daysAgo(19, 9, 0), contactedGapHours: 14 },
    { user_id: userIds.reader3, drone_id: droneIds.hfp1, message: "Do you offer a package for a county sheriff's department looking to replace two aging fixed-wing patrol platforms?", status: 'new', created_at: daysAgo(17, 15, 30) },
    { user_id: userIds.reader1, drone_id: droneIds.hfp3, message: 'What is the lead time on the combustion propulsion module for HFP-3?', status: 'new', created_at: daysAgo(16, 8, 45) },
    { user_id: userIds.reader4, drone_id: droneIds.vimana, message: 'Is VIMANA available for evaluation as a rapid-response asset, or is it still defense-only?', status: 'new', created_at: daysAgo(12, 13, 0) },
    { user_id: userIds.reader5, drone_id: droneIds.vimanaLs, message: 'What certifications does VIMANA-LS currently hold for operating in EU alpine airspace?', status: 'contacted', created_at: daysAgo(11, 16, 0), contactedGapHours: 26 },
    { user_id: userIds.reader6, drone_id: droneIds.hfp2, message: 'Can the HFP-2 be configured for both medical and light cargo drops on the same airframe?', status: 'closed', created_at: daysAgo(10, 11, 15), contactedGapHours: 8 },
    { user_id: userIds.reader2, drone_id: null, message: 'We are a regional EMS provider evaluating VTOL delivery generally — could someone walk us through pricing and pilot-training requirements?', status: 'new', created_at: daysAgo(7, 18, 0) },
    { user_id: userIds.reader3, drone_id: droneIds.hfp1, message: 'What is the warranty period on the HFP-1 airframe and sensor payload?', status: 'closed', created_at: daysAgo(6, 9, 30), contactedGapHours: 20 },
    { user_id: userIds.reader6, drone_id: droneIds.hfp3, message: 'Do you have case studies from any police aviation units currently operating HFP-3?', status: 'contacted', created_at: daysAgo(2, 12, 0), contactedGapHours: 9 },
  ];

  for (const i of rows) {
    const contactedAt = i.contactedGapHours != null ? hoursAfter(i.created_at, i.contactedGapHours) : null;
    await pool.query(
      `INSERT INTO inquiries (user_id, drone_id, message, status, created_at, contacted_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [i.user_id, i.drone_id, i.message, i.status, i.created_at, contactedAt]
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
  // subscribed_at is backdated alongside the matching campaign bump in
  // seedActivityEvents so the referral funnel tells one consistent story.
  const rows = [
    { email: 'newsletter3@example.com', referral_source: null, user_id: userIds.reader3, subscribed_at: daysAgo(26, 15, 0) },
    { email: 'newsletter1@example.com', referral_source: 'yt-launch', user_id: userIds.reader1, subscribed_at: daysAgo(23, 20, 0) },
    { email: 'newsletter4@example.com', referral_source: 'fb-demo-day', user_id: null, subscribed_at: daysAgo(14, 10, 30) },
    { email: 'newsletter2@example.com', referral_source: 'ig-teaser', user_id: null, subscribed_at: daysAgo(5, 13, 0) },
    { email: 'newsletter5@example.com', referral_source: 'yt-rescue-deepdive', user_id: null, subscribed_at: daysAgo(4, 18, 0) },
  ];

  for (const n of rows) {
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, referral_source, user_id, subscribed_at)
       VALUES ($1, $2, $3, $4)`,
      [n.email, n.referral_source, n.user_id, n.subscribed_at]
    );
  }
}

// Builds ~30 days of activity: a low, gently rising organic baseline plus three
// 2-3 day bumps tied to the actual campaign_links slugs, so the time series and
// the referral funnel tell the same story instead of everything landing on the
// day the seed script happened to run.
async function seedActivityEvents(userIds, droneIds, articleIds, campaignLinkIds) {
  const droneCycle = [droneIds.vimanaLs, droneIds.hfp2, droneIds.hfp1, droneIds.hfp3, droneIds.vimana];
  const articleCycle = [articleIds.ruralEmergency, articleIds.vimanaLsInside, articleIds.hfp2MedicalFlagship, articleIds.patrolAtRange];
  const userCycle = [userIds.reader1, userIds.reader2, userIds.reader3, userIds.reader4, userIds.reader5, userIds.reader6];

  const rows = [];
  let anonSeq = 1;
  let tick = 0;

  function addEvent(day, eventType, targetType, targetId, referralSource, useAnon) {
    const user_id = useAnon ? null : userCycle[tick % userCycle.length];
    const anon_id = useAnon ? `anon-${String(anonSeq++).padStart(3, '0')}` : null;
    // Spread same-day events across business hours (8:00-21:40) so timestamps within a day are distinct.
    const created_at = daysAgo(day, 8 + (tick % 14), (tick * 17) % 60);
    tick += 1;
    rows.push({ user_id, anon_id, event_type: eventType, target_type: targetType, target_id: targetId, referral_source: referralSource, created_at });
  }

  // --- Baseline organic traffic: 1/day (days 20-29) -> 2/day (10-19) -> 3/day (0-9) ---
  for (let day = 29; day >= 0; day--) {
    const count = day >= 20 ? 1 : day >= 10 ? 2 : 3;
    for (let n = 0; n < count; n++) {
      const isFavorite = (day + n) % 4 === 3;
      if (isFavorite) {
        addEvent(day, 'favorite', 'drone', droneCycle[(day + n) % droneCycle.length], null, false);
      } else {
        const useArticle = (day + n) % 5 === 4;
        const targetType = useArticle ? 'article' : 'drone';
        const targetId = useArticle ? articleCycle[(day + n) % articleCycle.length] : droneCycle[(day + n) % droneCycle.length];
        const useAnon = (day + n) % 3 !== 0;
        addEvent(day, 'view', targetType, targetId, null, useAnon);
      }
    }
  }

  // --- Campaign bumps: peak day mixes campaign_redirect (the /r/:slug shape) with
  // referral-tagged views; shoulder days are the trailing/leading tail of the same push. ---
  const bumps = [
    { day: 25, count: 2, ref: 'yt-launch' },
    { day: 24, count: 9, ref: 'yt-launch', peak: true, campaignKey: 'ytLaunch' },
    { day: 23, count: 4, ref: 'yt-launch' },
    { day: 15, count: 2, ref: 'fb-demo-day' },
    { day: 14, count: 10, ref: 'fb-demo-day', peak: true, campaignKey: 'fbDemoDay' },
    { day: 13, count: 4, ref: 'fb-demo-day' },
    { day: 6, count: 2, ref: 'ig-teaser' },
    { day: 5, count: 8, ref: 'ig-teaser', peak: true, campaignKey: 'igTeaser' },
    { day: 4, count: 8, ref: 'yt-rescue-deepdive', peak: true, campaignKey: 'ytRescueDeepdive' },
    { day: 3, count: 3, ref: 'yt-rescue-deepdive' },
  ];

  for (const bump of bumps) {
    if (bump.peak) {
      const redirectCount = Math.ceil(bump.count * 0.4);
      for (let n = 0; n < redirectCount; n++) {
        addEvent(bump.day, 'campaign_redirect', 'campaign_link', campaignLinkIds[bump.campaignKey], bump.ref, true);
      }
      for (let n = redirectCount; n < bump.count; n++) {
        addEvent(bump.day, 'view', 'drone', droneCycle[n % droneCycle.length], bump.ref, n % 5 !== 0);
      }
    } else {
      for (let n = 0; n < bump.count; n++) {
        addEvent(bump.day, 'view', 'drone', droneCycle[n % droneCycle.length], bump.ref, n % 7 !== 6);
      }
    }
  }

  for (const e of rows) {
    await pool.query(
      `INSERT INTO activity_events (user_id, anon_id, event_type, target_type, target_id, referral_source, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [e.user_id, e.anon_id, e.event_type, e.target_type, e.target_id, e.referral_source, e.created_at]
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
