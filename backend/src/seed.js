// backend/src/seed.js
const bcrypt = require('bcryptjs');
const pool = require('./db');

const SEED_PASSWORD = 'TestPass123!'; // dev-only — every seeded user shares this

async function resetTables() {
  await pool.query(`
    TRUNCATE TABLE favorites, drone_reviews, inquiries, gallery_items, articles, drones, users, firms
    RESTART IDENTITY CASCADE
  `);
}

async function seedFirms() {
  const firms = [
    { name: 'AeroFirm Dynamics', slug: 'aerofirm-dynamics', description: 'Manufacturer of fixed-wing VTOL drones for agriculture, mapping, and emergency response.', logo_url: 'https://example.com/logos/aerofirm.png', website_url: 'https://aerofirm.example.com', contact_email: 'contact@aerofirm.example.com', contact_phone: '+40 700 000 000', location: 'Cluj-Napoca, Romania', verified: true },
    { name: 'SkyBridge Robotics', slug: 'skybridge-robotics', description: 'Builds long-range VTOL platforms for delivery and infrastructure inspection.', logo_url: 'https://example.com/logos/skybridge.png', website_url: 'https://skybridge.example.com', contact_email: 'hello@skybridge.example.com', contact_phone: '+40 700 111 111', location: 'Bucharest, Romania', verified: true },
    { name: 'Meridian Aerosystems', slug: 'meridian-aerosystems', description: 'European manufacturer specializing in mapping and surveillance-grade VTOL platforms.', logo_url: 'https://example.com/logos/meridian.png', website_url: 'https://meridianaero.example.com', contact_email: 'info@meridianaero.example.com', contact_phone: '+43 1 000 0000', location: 'Vienna, Austria', verified: true },
    { name: 'Vantage UAV', slug: 'vantage-uav', description: 'Newer entrant focused on affordable inspection and agriculture VTOL drones.', logo_url: 'https://example.com/logos/vantage.png', website_url: 'https://vantageuav.example.com', contact_email: 'team@vantageuav.example.com', contact_phone: '+48 22 000 0000', location: 'Warsaw, Poland', verified: false },
  ];

  const ids = [];
  for (const f of firms) {
    const result = await pool.query(
      `INSERT INTO firms (name, slug, description, logo_url, website_url, contact_email, contact_phone, location, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [f.name, f.slug, f.description, f.logo_url, f.website_url, f.contact_email, f.contact_phone, f.location, f.verified]
    );
    ids.push(result.rows[0].id);
  }
  return ids; // [aerofirm, skybridge, meridian, vantage]
}

async function seedUsers(firmIds) {
  const [aerofirm, skybridge, meridian, vantage] = firmIds;
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const users = [
    { email: 'admin@vtolcampaign.com', name: 'Site Admin', role: 'admin', firm_id: null },
    { email: 'editor@vtolcampaign.com', name: 'Campaign Editor', role: 'editor', firm_id: null },
    { email: 'owner@aerofirm.example.com', name: 'Aerofirm Owner', role: 'firm_owner', firm_id: aerofirm },
    { email: 'owner@skybridge.example.com', name: 'SkyBridge Owner', role: 'firm_owner', firm_id: skybridge },
    { email: 'owner@meridianaero.example.com', name: 'Meridian Owner', role: 'firm_owner', firm_id: meridian },
    { email: 'owner@vantageuav.example.com', name: 'Vantage Owner', role: 'firm_owner', firm_id: vantage },
    { email: 'reader1@example.com', name: 'Elena Popescu', role: 'user', firm_id: null },
    { email: 'reader2@example.com', name: 'Marcus Ionescu', role: 'user', firm_id: null },
    { email: 'reader3@example.com', name: 'Anca Dumitrescu', role: 'user', firm_id: null },
  ];

  const ids = [];
  for (const u of users) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, firm_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [u.email, passwordHash, u.name, u.role, u.firm_id]
    );
    ids.push(result.rows[0].id);
  }
  return ids; // [admin, editor, aerofirmOwner, skybridgeOwner, meridianOwner, vantageOwner, reader1, reader2, reader3]
}

async function seedDrones(firmIds) {
  const [aerofirm, skybridge, meridian, vantage] = firmIds;

  const drones = [
    { firm_id: aerofirm, name: 'Falcon-2', slug: 'falcon-2', category: 'agriculture', description: 'Fixed-wing VTOL built for crop monitoring and multispectral imaging over large fields.', price: 8500.00, wingspan_mm: 2100, weight_kg: 4.5, flight_time_min: 90, range_km: 65.0, max_speed_kmh: 110.0, payload_kg: 1.2, extra_specs: { camera: '4K gimbal', certification: 'BVLOS', battery: 'Li-ion' }, primary_image_url: 'https://example.com/media/falcon-2.jpg' },
    { firm_id: aerofirm, name: 'Falcon-1 Scout', slug: 'falcon-1-scout', category: 'inspection', description: 'Compact VTOL for bridge, powerline, and infrastructure inspection in tight spaces.', price: 5200.00, wingspan_mm: 1500, weight_kg: 2.8, flight_time_min: 60, range_km: 40.0, max_speed_kmh: 90.0, payload_kg: 0.8, extra_specs: { camera: '4K zoom', certification: 'BVLOS' }, primary_image_url: 'https://example.com/media/falcon-1-scout.jpg' },
    { firm_id: skybridge, name: 'SkyBridge Voyager', slug: 'skybridge-voyager', category: 'delivery', description: 'Long-range VTOL platform designed for last-mile medical and parcel delivery.', price: 12500.00, wingspan_mm: 2600, weight_kg: 6.2, flight_time_min: 120, range_km: 110.0, max_speed_kmh: 95.0, payload_kg: 2.5, extra_specs: { camera: '1080p', certification: 'Part 107', battery: 'LiPo' }, primary_image_url: 'https://example.com/media/skybridge-voyager.jpg' },
    { firm_id: skybridge, name: 'SkyBridge Sentinel', slug: 'skybridge-sentinel', category: 'emergency', description: 'Thermal-equipped VTOL built for search-and-rescue operations in low visibility.', price: 15800.00, wingspan_mm: 2800, weight_kg: 7.1, flight_time_min: 105, range_km: 130.0, max_speed_kmh: 120.0, payload_kg: 1.8, extra_specs: { camera: 'thermal + 4K', certification: 'BVLOS', battery: 'Li-ion' }, primary_image_url: 'https://example.com/media/skybridge-sentinel.jpg' },
    { firm_id: meridian, name: 'Meridian MapperOne', slug: 'meridian-mapperone', category: 'mapping', description: 'Survey-grade VTOL with RGB and multispectral sensors for large-area mapping.', price: 10200.00, wingspan_mm: 2300, weight_kg: 5.0, flight_time_min: 100, range_km: 80.0, max_speed_kmh: 100.0, payload_kg: 1.5, extra_specs: { camera: 'RGB + multispectral', certification: 'EASA Open Category' }, primary_image_url: 'https://example.com/media/meridian-mapperone.jpg' },
    { firm_id: meridian, name: 'Meridian Ranger', slug: 'meridian-ranger', category: 'surveillance', description: 'Long-endurance VTOL with a 30x zoom gimbal for wide-area surveillance.', price: 13400.00, wingspan_mm: 2450, weight_kg: 5.8, flight_time_min: 110, range_km: 95.0, max_speed_kmh: 115.0, payload_kg: 1.6, extra_specs: { camera: 'gimbal zoom 30x', certification: 'EASA Specific Category' }, primary_image_url: 'https://example.com/media/meridian-ranger.jpg' },
    { firm_id: vantage, name: 'Vantage Inspector-X', slug: 'vantage-inspector-x', category: 'inspection', description: 'Affordable VTOL with onboard LiDAR for infrastructure inspection.', price: 6100.00, wingspan_mm: 1700, weight_kg: 3.1, flight_time_min: 65, range_km: 45.0, max_speed_kmh: 92.0, payload_kg: 0.9, extra_specs: { camera: '4K + LiDAR', certification: 'pending' }, primary_image_url: 'https://example.com/media/vantage-inspector-x.jpg' },
    { firm_id: vantage, name: 'Vantage Horizon', slug: 'vantage-horizon', category: 'agriculture', description: 'Entry-level agricultural VTOL for small and mid-size farms.', price: 7300.00, wingspan_mm: 1950, weight_kg: 4.0, flight_time_min: 80, range_km: 55.0, max_speed_kmh: 105.0, payload_kg: 1.0, extra_specs: { camera: 'multispectral', certification: 'pending' }, primary_image_url: 'https://example.com/media/vantage-horizon.jpg' },
  ];

  const ids = [];
  for (const d of drones) {
    const result = await pool.query(
      `INSERT INTO drones (firm_id, name, slug, category, description, price, wingspan_mm, weight_kg, flight_time_min, range_km, max_speed_kmh, payload_kg, extra_specs, primary_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [d.firm_id, d.name, d.slug, d.category, d.description, d.price, d.wingspan_mm, d.weight_kg, d.flight_time_min, d.range_km, d.max_speed_kmh, d.payload_kg, JSON.stringify(d.extra_specs), d.primary_image_url]
    );
    ids.push(result.rows[0].id);
  }
  return ids; // [falcon2, falcon1scout, voyager, sentinel, mapperone, ranger, inspectorx, horizon]
}

async function seedArticles(userIds, droneIds, firmIds) {
  const [admin, editor] = userIds;
  const [falcon2, , , sentinel, mapperone] = droneIds;
  const [aerofirm, skybridge, meridian] = firmIds;

  const articles = [
    { title: 'Why Fixed-Wing VTOL Is Changing Rural Emergency Response', slug: 'why-fixed-wing-vtol-changing-rural-emergency-response', body: 'A look at how VTOL drones combine the range of fixed-wing aircraft with the launch flexibility of multirotors to reach remote areas in minutes rather than hours.', author_id: editor, category: 'research', status: 'published', featured_image_url: 'https://example.com/media/article-emergency.jpg', related_drone_id: null, related_firm_id: null, published: true },
    { title: 'Falcon-2 Review: A Season in the Field', slug: 'falcon-2-review-season-in-the-field', body: 'We followed a crop-monitoring team using the Falcon-2 for a full growing season. Here is what held up, and what did not.', author_id: editor, category: 'review', status: 'published', featured_image_url: 'https://example.com/media/article-falcon-review.jpg', related_drone_id: falcon2, related_firm_id: aerofirm, published: true },
    { title: 'Inside SkyBridge Sentinel: Built for Search and Rescue', slug: 'inside-skybridge-sentinel-search-and-rescue', body: "A closer look at the thermal payload and endurance tradeoffs behind SkyBridge's newest rescue-focused platform.", author_id: editor, category: 'review', status: 'published', featured_image_url: 'https://example.com/media/article-sentinel.jpg', related_drone_id: sentinel, related_firm_id: skybridge, published: true },
    { title: 'Mapping at Scale: How MapperOne Cuts Survey Time in Half', slug: 'mapping-at-scale-mapperone-survey-time', body: "Meridian's multispectral payload and flight-planning software are shaving days off large-area survey projects, according to three early customers.", author_id: admin, category: 'research', status: 'published', featured_image_url: 'https://example.com/media/article-mapperone.jpg', related_drone_id: mapperone, related_firm_id: meridian, published: true },
    { title: 'The Economics of Fixed-Wing VTOL: Is It Worth the Premium?', slug: 'economics-of-fixed-wing-vtol-premium', body: 'Fixed-wing VTOL platforms cost more upfront than standard multirotors. We break down total cost of ownership across a three-year operating window.', author_id: editor, category: 'research', status: 'draft', featured_image_url: null, related_drone_id: null, related_firm_id: null, published: false },
  ];

  for (const a of articles) {
    await pool.query(
      `INSERT INTO articles (title, slug, body, author_id, category, status, featured_image_url, related_drone_id, related_firm_id, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [a.title, a.slug, a.body, a.author_id, a.category, a.status, a.featured_image_url, a.related_drone_id, a.related_firm_id, a.published ? new Date() : null]
    );
  }
}

async function seedGalleryItems(droneIds, firmIds) {
  const [falcon2, falcon1scout, voyager, sentinel, mapperone, ranger, inspectorx, horizon] = droneIds;
  const [aerofirm, skybridge, meridian, vantage] = firmIds;

  const items = [
    { title: 'Coastal Search & Rescue Demo', description: 'SkyBridge Sentinel locating a stranded hiker in under 8 minutes.', media_url: 'https://example.com/media/rescue-demo.mp4', media_type: 'video', category: 'emergency', drone_id: sentinel, firm_id: skybridge },
    { title: 'Crop Health Flyover', description: 'Multispectral pass over a 40-hectare wheat field.', media_url: 'https://example.com/media/crop-flyover.jpg', media_type: 'image', category: 'agriculture', drone_id: falcon2, firm_id: aerofirm },
    { title: 'Rural Medical Delivery', description: 'SkyBridge Voyager delivering insulin to a clinic with no road access.', media_url: 'https://example.com/media/medical-delivery.jpg', media_type: 'image', category: 'delivery', drone_id: voyager, firm_id: skybridge },
    { title: 'Bridge Inspection Pass', description: 'Falcon-1 Scout hovering under a bridge deck for close-up structural imaging.', media_url: 'https://example.com/media/bridge-inspection.mp4', media_type: 'video', category: 'inspection', drone_id: falcon1scout, firm_id: aerofirm },
    { title: 'Vineyard Survey Flight', description: 'Vantage Horizon mapping vine health across a hillside vineyard.', media_url: 'https://example.com/media/vineyard-survey.jpg', media_type: 'image', category: 'agriculture', drone_id: horizon, firm_id: vantage },
    { title: 'City Infrastructure Mapping', description: 'MapperOne building a 3D model of a city block for planning review.', media_url: 'https://example.com/media/city-mapping.jpg', media_type: 'image', category: 'mapping', drone_id: mapperone, firm_id: meridian },
    { title: 'Night Surveillance Patrol', description: 'Meridian Ranger on a perimeter patrol using its zoom gimbal at dusk.', media_url: 'https://example.com/media/night-patrol.mp4', media_type: 'video', category: 'surveillance', drone_id: ranger, firm_id: meridian },
    { title: 'Powerline Corridor Inspection', description: 'Vantage Inspector-X scanning a powerline corridor with onboard LiDAR.', media_url: 'https://example.com/media/powerline-inspection.jpg', media_type: 'image', category: 'inspection', drone_id: inspectorx, firm_id: vantage },
    { title: '#SkyWithoutRunways Launch Event', description: 'Community turnout for the campaign launch, watching a live VTOL transition demo.', media_url: 'https://example.com/media/launch-event.jpg', media_type: 'image', category: 'campaign', drone_id: null, firm_id: null },
    { title: 'Community Demo Day — Local Farmers', description: 'Local farmers trying out VTOL flight-planning software during a hands-on demo day.', media_url: 'https://example.com/media/demo-day-farmers.jpg', media_type: 'image', category: 'campaign', drone_id: null, firm_id: null },
  ];

  for (const g of items) {
    await pool.query(
      `INSERT INTO gallery_items (title, description, media_url, media_type, category, drone_id, firm_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [g.title, g.description, g.media_url, g.media_type, g.category, g.drone_id, g.firm_id]
    );
  }
}

async function seedInquiries(userIds, droneIds, firmIds) {
  const [, , , , , , reader1, reader2, reader3] = userIds;
  const [falcon2, , voyager, , mapperone, , inspectorx] = droneIds;
  const [aerofirm, skybridge, meridian, vantage] = firmIds;

  const inquiries = [
    { user_id: reader1, firm_id: aerofirm, drone_id: falcon2, message: 'Interested in the Falcon-2 for a 200-hectare vineyard. Can you send pricing for a fleet of 3?', status: 'new' },
    { user_id: reader2, firm_id: skybridge, drone_id: voyager, message: 'What is the maximum payload for cold-chain medical deliveries?', status: 'contacted' },
    { user_id: reader3, firm_id: meridian, drone_id: mapperone, message: 'Does the MapperOne meet EASA requirements for surveying near populated areas?', status: 'closed' },
    { user_id: reader1, firm_id: vantage, drone_id: inspectorx, message: 'When is BVLOS certification for the Inspector-X expected to be finalized?', status: 'new' },
  ];

  for (const i of inquiries) {
    await pool.query(
      `INSERT INTO inquiries (user_id, firm_id, drone_id, message, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [i.user_id, i.firm_id, i.drone_id, i.message, i.status]
    );
  }
}

async function seedDroneReviews(userIds, droneIds) {
  const [, , , , , , reader1, reader2, reader3] = userIds;
  const [falcon2, , voyager, sentinel, mapperone, , inspectorx] = droneIds;

  const reviews = [
    { drone_id: falcon2, user_id: reader1, rating: 5, body: 'Reliable in high winds and the multispectral data quality is excellent for the price point.' },
    { drone_id: falcon2, user_id: reader2, rating: 4, body: 'Great flight time, but the companion software could use some polish.' },
    { drone_id: voyager, user_id: reader3, rating: 5, body: 'Delivered supplies to our clinic without issue across five flights so far.' },
    { drone_id: sentinel, user_id: reader1, rating: 5, body: 'The thermal camera made the real difference during an actual search operation.' },
    { drone_id: mapperone, user_id: reader2, rating: 3, body: 'Solid mapping accuracy, but initial setup took longer than advertised.' },
    { drone_id: inspectorx, user_id: reader3, rating: 4, body: 'Good value for the price point — the LiDAR data comes out clean.' },
  ];

  for (const r of reviews) {
    await pool.query(
      `INSERT INTO drone_reviews (drone_id, user_id, rating, body)
       VALUES ($1, $2, $3, $4)`,
      [r.drone_id, r.user_id, r.rating, r.body]
    );
  }
}

async function seedFavorites(userIds, droneIds, firmIds) {
  const [, , , , , , reader1, reader2, reader3] = userIds;
  const [falcon2, , voyager, , mapperone] = droneIds;
  const [, skybridge] = firmIds;

  const favorites = [
    { user_id: reader1, item_type: 'drone', item_id: falcon2 },
    { user_id: reader2, item_type: 'drone', item_id: voyager },
    { user_id: reader2, item_type: 'firm', item_id: skybridge },
    { user_id: reader3, item_type: 'drone', item_id: mapperone },
  ];

  for (const f of favorites) {
    await pool.query(
      `INSERT INTO favorites (user_id, item_type, item_id)
       VALUES ($1, $2, $3)`,
      [f.user_id, f.item_type, f.item_id]
    );
  }
}

async function main() {
  try {
    console.log('Resetting tables...');
    await resetTables();

    console.log('Seeding firms...');
    const firmIds = await seedFirms();

    console.log('Seeding users...');
    const userIds = await seedUsers(firmIds);

    console.log('Seeding drones...');
    const droneIds = await seedDrones(firmIds);

    console.log('Seeding articles...');
    await seedArticles(userIds, droneIds, firmIds);

    console.log('Seeding gallery items...');
    await seedGalleryItems(droneIds, firmIds);

    console.log('Seeding inquiries...');
    await seedInquiries(userIds, droneIds, firmIds);

    console.log('Seeding drone reviews...');
    await seedDroneReviews(userIds, droneIds);

    console.log('Seeding favorites...');
    await seedFavorites(userIds, droneIds, firmIds);

    console.log('\nDone: 4 firms, 9 users, 8 drones, 5 articles, 10 gallery items, 4 inquiries, 6 reviews, 4 favorites.');
    console.log(`Every seeded user's password is: ${SEED_PASSWORD}`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();