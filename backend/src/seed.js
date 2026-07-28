const bcrypt = require('bcryptjs');
const pool = require('./db');

const SEED_PASSWORD = 'TestPass123!';

const IMG_DELTAQUAD = 'https://commons.wikimedia.org/wiki/Special:FilePath/DeltaQuad_VTOL_surveillance_UAV.jpg?width=800';
const IMG_MITSUBISHI = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mitsubishi_Fixed-wing_VTOL_UAV_front_view_at_JASDF_Gifu_Air_Base_November_17,_2024.jpg?width=800';
const IMG_DJI_AGRI = 'https://commons.wikimedia.org/wiki/Special:FilePath/DJI_Agriculture,_Agritechnica_2023,_Hanover_(P1160331).jpg?width=800';
const IMG_CROP_FERTILIZER = 'https://commons.wikimedia.org/wiki/Special:FilePath/Drone_crop_fertilizer.jpg?width=800';
const IMG_ZIPLINE = 'https://commons.wikimedia.org/wiki/Special:FilePath/Zipline_Drone_Launch.jpg?width=800';
const IMG_FLARGO = 'https://commons.wikimedia.org/wiki/Special:FilePath/Flargo_Heavy-Lift_Drone_(quarry).jpg?width=800';

function logoUrl(seed) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`;
}

async function resetTables() {
  await pool.query(`TRUNCATE TABLE favorites, drone_reviews, inquiries, gallery_items, articles, drones, users, firms RESTART IDENTITY CASCADE`);
}

async function seedFirms() {
  const rows = [
    { key: 'aerofirm', name: 'AeroFirm Dynamics', slug: 'aerofirm-dynamics', description: 'Manufacturer of fixed-wing VTOL drones for agriculture, mapping, and emergency response.', website_url: 'https://aerofirm.example.com', contact_email: 'contact@aerofirm.example.com', contact_phone: '+40 700 000 000', location: 'Cluj-Napoca, Romania', verified: true },
    { key: 'skybridge', name: 'SkyBridge Robotics', slug: 'skybridge-robotics', description: 'Builds long-range VTOL platforms for delivery and infrastructure inspection.', website_url: 'https://skybridge.example.com', contact_email: 'hello@skybridge.example.com', contact_phone: '+40 700 111 111', location: 'Bucharest, Romania', verified: true },
    { key: 'meridian', name: 'Meridian Aerosystems', slug: 'meridian-aerosystems', description: 'European manufacturer specializing in mapping and surveillance-grade VTOL platforms.', website_url: 'https://meridianaero.example.com', contact_email: 'info@meridianaero.example.com', contact_phone: '+43 1 000 0000', location: 'Vienna, Austria', verified: true },
    { key: 'vantage', name: 'Vantage UAV', slug: 'vantage-uav', description: 'Newer entrant focused on affordable inspection and agriculture VTOL drones.', website_url: 'https://vantageuav.example.com', contact_email: 'team@vantageuav.example.com', contact_phone: '+48 22 000 0000', location: 'Warsaw, Poland', verified: false },
  ];

  const ids = {};
  for (const f of rows) {
    const result = await pool.query(
      `INSERT INTO firms (name, slug, description, logo_url, website_url, contact_email, contact_phone, location, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [f.name, f.slug, f.description, logoUrl(f.slug), f.website_url, f.contact_email, f.contact_phone, f.location, f.verified]
    );
    ids[f.key] = result.rows[0].id;
  }
  return ids;
}

async function seedUsers(firmIds) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const rows = [
    { key: 'admin', email: 'admin@vtolcampaign.com', name: 'Site Admin', role: 'admin', firm_id: null },
    { key: 'editor', email: 'editor@vtolcampaign.com', name: 'Campaign Editor', role: 'editor', firm_id: null },
    { key: 'aerofirmOwner', email: 'owner@aerofirm.example.com', name: 'Aerofirm Owner', role: 'firm_owner', firm_id: firmIds.aerofirm },
    { key: 'skybridgeOwner', email: 'owner@skybridge.example.com', name: 'SkyBridge Owner', role: 'firm_owner', firm_id: firmIds.skybridge },
    { key: 'meridianOwner', email: 'owner@meridianaero.example.com', name: 'Meridian Owner', role: 'firm_owner', firm_id: firmIds.meridian },
    { key: 'vantageOwner', email: 'owner@vantageuav.example.com', name: 'Vantage Owner', role: 'firm_owner', firm_id: firmIds.vantage },
    { key: 'reader1', email: 'reader1@example.com', name: 'Elena Popescu', role: 'user', firm_id: null },
    { key: 'reader2', email: 'reader2@example.com', name: 'Marcus Ionescu', role: 'user', firm_id: null },
    { key: 'reader3', email: 'reader3@example.com', name: 'Anca Dumitrescu', role: 'user', firm_id: null },
    { key: 'reader4', email: 'reader4@example.com', name: 'Tudor Radu', role: 'user', firm_id: null },
    { key: 'reader5', email: 'reader5@example.com', name: 'Ioana Marin', role: 'user', firm_id: null },
    { key: 'reader6', email: 'reader6@example.com', name: 'Bogdan Stanciu', role: 'user', firm_id: null },
  ];

  const ids = {};
  for (const u of rows) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, firm_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [u.email, passwordHash, u.name, u.role, u.firm_id]
    );
    ids[u.key] = result.rows[0].id;
  }
  return ids;
}

async function seedDrones(firmIds) {
  const rows = [
    { key: 'falcon2', firm_id: firmIds.aerofirm, name: 'Falcon-2', slug: 'falcon-2', category: 'agriculture', description: 'Fixed-wing VTOL built for crop monitoring and multispectral imaging over large fields.', price: 8500.00, wingspan_mm: 2100, weight_kg: 4.5, flight_time_min: 90, range_km: 65.0, max_speed_kmh: 110.0, payload_kg: 1.2, extra_specs: { camera: '4K gimbal', certification: 'BVLOS', battery: 'Li-ion' }, primary_image_url: IMG_DJI_AGRI },
    { key: 'falcon1Scout', firm_id: firmIds.aerofirm, name: 'Falcon-1 Scout', slug: 'falcon-1-scout', category: 'inspection', description: 'Compact VTOL for bridge, powerline, and infrastructure inspection in tight spaces.', price: 5200.00, wingspan_mm: 1500, weight_kg: 2.8, flight_time_min: 60, range_km: 40.0, max_speed_kmh: 90.0, payload_kg: 0.8, extra_specs: { camera: '4K zoom', certification: 'BVLOS' }, primary_image_url: IMG_FLARGO },
    { key: 'voyager', firm_id: firmIds.skybridge, name: 'SkyBridge Voyager', slug: 'skybridge-voyager', category: 'delivery', description: 'Long-range VTOL platform designed for last-mile medical and parcel delivery.', price: 12500.00, wingspan_mm: 2600, weight_kg: 6.2, flight_time_min: 120, range_km: 110.0, max_speed_kmh: 95.0, payload_kg: 2.5, extra_specs: { camera: '1080p', certification: 'Part 107', battery: 'LiPo' }, primary_image_url: IMG_ZIPLINE },
    { key: 'sentinel', firm_id: firmIds.skybridge, name: 'SkyBridge Sentinel', slug: 'skybridge-sentinel', category: 'emergency', description: 'Thermal-equipped VTOL built for search-and-rescue operations in low visibility.', price: 15800.00, wingspan_mm: 2800, weight_kg: 7.1, flight_time_min: 105, range_km: 130.0, max_speed_kmh: 120.0, payload_kg: 1.8, extra_specs: { camera: 'thermal + 4K', certification: 'BVLOS', battery: 'Li-ion' }, primary_image_url: IMG_DELTAQUAD },
    { key: 'mapperOne', firm_id: firmIds.meridian, name: 'Meridian MapperOne', slug: 'meridian-mapperone', category: 'mapping', description: 'Survey-grade VTOL with RGB and multispectral sensors for large-area mapping.', price: 10200.00, wingspan_mm: 2300, weight_kg: 5.0, flight_time_min: 100, range_km: 80.0, max_speed_kmh: 100.0, payload_kg: 1.5, extra_specs: { camera: 'RGB + multispectral', certification: 'EASA Open Category' }, primary_image_url: IMG_MITSUBISHI },
    { key: 'ranger', firm_id: firmIds.meridian, name: 'Meridian Ranger', slug: 'meridian-ranger', category: 'surveillance', description: 'Long-endurance VTOL with a 30x zoom gimbal for wide-area surveillance.', price: 13400.00, wingspan_mm: 2450, weight_kg: 5.8, flight_time_min: 110, range_km: 95.0, max_speed_kmh: 115.0, payload_kg: 1.6, extra_specs: { camera: 'gimbal zoom 30x', certification: 'EASA Specific Category' }, primary_image_url: IMG_MITSUBISHI },
    { key: 'inspectorX', firm_id: firmIds.vantage, name: 'Vantage Inspector-X', slug: 'vantage-inspector-x', category: 'inspection', description: 'Affordable VTOL with onboard LiDAR for infrastructure inspection.', price: 6100.00, wingspan_mm: 1700, weight_kg: 3.1, flight_time_min: 65, range_km: 45.0, max_speed_kmh: 92.0, payload_kg: 0.9, extra_specs: { camera: '4K + LiDAR', certification: 'pending' }, primary_image_url: IMG_FLARGO },
    { key: 'horizon', firm_id: firmIds.vantage, name: 'Vantage Horizon', slug: 'vantage-horizon', category: 'agriculture', description: 'Entry-level agricultural VTOL for small and mid-size farms.', price: 7300.00, wingspan_mm: 1950, weight_kg: 4.0, flight_time_min: 80, range_km: 55.0, max_speed_kmh: 105.0, payload_kg: 1.0, extra_specs: { camera: 'multispectral', certification: 'pending' }, primary_image_url: IMG_CROP_FERTILIZER },
  ];

  const ids = {};
  for (const d of rows) {
    const result = await pool.query(
      `INSERT INTO drones (firm_id, name, slug, category, description, price, wingspan_mm, weight_kg, flight_time_min, range_km, max_speed_kmh, payload_kg, extra_specs, primary_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [d.firm_id, d.name, d.slug, d.category, d.description, d.price, d.wingspan_mm, d.weight_kg, d.flight_time_min, d.range_km, d.max_speed_kmh, d.payload_kg, JSON.stringify(d.extra_specs), d.primary_image_url]
    );
    ids[d.key] = result.rows[0].id;
  }
  return ids;
}

async function seedArticles(userIds, droneIds, firmIds) {
  const rows = [
    { key: 'emergencyResponse', title: 'Why Fixed-Wing VTOL Is Changing Rural Emergency Response', slug: 'why-fixed-wing-vtol-changing-rural-emergency-response', body: 'A look at how VTOL drones combine the range of fixed-wing aircraft with the launch flexibility of multirotors to reach remote areas in minutes rather than hours.', author_id: userIds.editor, category: 'research', status: 'published', featured_image_url: IMG_DELTAQUAD, related_drone_id: null, related_firm_id: null },
    { key: 'falcon2Review', title: 'Falcon-2 Review: A Season in the Field', slug: 'falcon-2-review-season-in-the-field', body: 'We followed a crop-monitoring team using the Falcon-2 for a full growing season. Here is what held up, and what did not.', author_id: userIds.editor, category: 'review', status: 'published', featured_image_url: IMG_DJI_AGRI, related_drone_id: droneIds.falcon2, related_firm_id: firmIds.aerofirm },
    { key: 'sentinelInside', title: 'Inside SkyBridge Sentinel: Built for Search and Rescue', slug: 'inside-skybridge-sentinel-search-and-rescue', body: "A closer look at the thermal payload and endurance tradeoffs behind SkyBridge's newest rescue-focused platform.", author_id: userIds.editor, category: 'review', status: 'published', featured_image_url: IMG_DELTAQUAD, related_drone_id: droneIds.sentinel, related_firm_id: firmIds.skybridge },
    { key: 'mapperOneScale', title: 'Mapping at Scale: How MapperOne Cuts Survey Time in Half', slug: 'mapping-at-scale-mapperone-survey-time', body: "Meridian's multispectral payload and flight-planning software are shaving days off large-area survey projects, according to three early customers.", author_id: userIds.admin, category: 'research', status: 'published', featured_image_url: IMG_MITSUBISHI, related_drone_id: droneIds.mapperOne, related_firm_id: firmIds.meridian },
    { key: 'economics', title: 'The Economics of Fixed-Wing VTOL: Is It Worth the Premium?', slug: 'economics-of-fixed-wing-vtol-premium', body: 'Fixed-wing VTOL platforms cost more upfront than standard multirotors. We break down total cost of ownership across a three-year operating window.', author_id: userIds.editor, category: 'research', status: 'draft', featured_image_url: IMG_FLARGO, related_drone_id: null, related_firm_id: null },
  ];

  const ids = {};
  for (const a of rows) {
    const result = await pool.query(
      `INSERT INTO articles (title, slug, body, author_id, category, status, featured_image_url, related_drone_id, related_firm_id, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [a.title, a.slug, a.body, a.author_id, a.category, a.status, a.featured_image_url, a.related_drone_id, a.related_firm_id, a.status === 'published' ? new Date() : null]
    );
    ids[a.key] = result.rows[0].id;
  }
  return ids;
}

async function seedGalleryItems(droneIds, firmIds) {
  const rows = [
    { title: 'Coastal Search & Rescue Demo', description: 'SkyBridge Sentinel locating a stranded hiker in under 8 minutes.', media_url: IMG_DELTAQUAD, media_type: 'image', category: 'emergency', drone_id: droneIds.sentinel, firm_id: firmIds.skybridge },
    { title: 'Crop Health Flyover', description: 'Multispectral pass over a 40-hectare wheat field.', media_url: IMG_DJI_AGRI, media_type: 'image', category: 'agriculture', drone_id: droneIds.falcon2, firm_id: firmIds.aerofirm },
    { title: 'Rural Medical Delivery', description: 'SkyBridge Voyager delivering insulin to a clinic with no road access.', media_url: IMG_ZIPLINE, media_type: 'image', category: 'delivery', drone_id: droneIds.voyager, firm_id: firmIds.skybridge },
    { title: 'Bridge Inspection Pass', description: 'Falcon-1 Scout hovering under a bridge deck for close-up structural imaging.', media_url: IMG_FLARGO, media_type: 'image', category: 'inspection', drone_id: droneIds.falcon1Scout, firm_id: firmIds.aerofirm },
    { title: 'Vineyard Survey Flight', description: 'Vantage Horizon mapping vine health across a hillside vineyard.', media_url: IMG_CROP_FERTILIZER, media_type: 'image', category: 'agriculture', drone_id: droneIds.horizon, firm_id: firmIds.vantage },
    { title: 'City Infrastructure Mapping', description: 'MapperOne building a 3D model of a city block for planning review.', media_url: IMG_MITSUBISHI, media_type: 'image', category: 'mapping', drone_id: droneIds.mapperOne, firm_id: firmIds.meridian },
    { title: 'Night Surveillance Patrol', description: 'Meridian Ranger on a perimeter patrol using its zoom gimbal at dusk.', media_url: IMG_DELTAQUAD, media_type: 'image', category: 'surveillance', drone_id: droneIds.ranger, firm_id: firmIds.meridian },
    { title: 'Powerline Corridor Inspection', description: 'Vantage Inspector-X scanning a powerline corridor with onboard LiDAR.', media_url: IMG_FLARGO, media_type: 'image', category: 'inspection', drone_id: droneIds.inspectorX, firm_id: firmIds.vantage },
    { title: '#SkyWithoutRunways Launch Event', description: 'Community turnout for the campaign launch, watching a live VTOL transition demo.', media_url: IMG_MITSUBISHI, media_type: 'image', category: 'campaign', drone_id: null, firm_id: null },
    { title: 'Community Demo Day — Local Farmers', description: 'Local farmers trying out VTOL flight-planning software during a hands-on demo day.', media_url: IMG_DJI_AGRI, media_type: 'image', category: 'campaign', drone_id: null, firm_id: null },
  ];

  for (const g of rows) {
    await pool.query(
      `INSERT INTO gallery_items (title, description, media_url, media_type, category, drone_id, firm_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [g.title, g.description, g.media_url, g.media_type, g.category, g.drone_id, g.firm_id]
    );
  }
}

async function seedInquiries(userIds, droneIds, firmIds) {
  const rows = [
    { user_id: userIds.reader1, firm_id: firmIds.aerofirm, drone_id: droneIds.falcon2, message: 'Interested in the Falcon-2 for a 200-hectare vineyard. Can you send pricing for a fleet of 3?', status: 'new' },
    { user_id: userIds.reader2, firm_id: firmIds.skybridge, drone_id: droneIds.voyager, message: 'What is the maximum payload for cold-chain medical deliveries?', status: 'contacted' },
    { user_id: userIds.reader3, firm_id: firmIds.meridian, drone_id: droneIds.mapperOne, message: 'Does the MapperOne meet EASA requirements for surveying near populated areas?', status: 'closed' },
    { user_id: userIds.reader1, firm_id: firmIds.vantage, drone_id: droneIds.inspectorX, message: 'When is BVLOS certification for the Inspector-X expected to be finalized?', status: 'new' },
    { user_id: userIds.reader4, firm_id: firmIds.aerofirm, drone_id: droneIds.falcon1Scout, message: 'Do you offer bulk pricing for 10 units for a utility company?', status: 'new' },
    { user_id: userIds.reader5, firm_id: firmIds.skybridge, drone_id: droneIds.sentinel, message: 'What is the resolution on the thermal camera?', status: 'contacted' },
    { user_id: userIds.reader6, firm_id: firmIds.meridian, drone_id: droneIds.ranger, message: 'What is the effective zoom range on the gimbal, in kilometers?', status: 'new' },
    { user_id: userIds.reader2, firm_id: firmIds.vantage, drone_id: droneIds.horizon, message: 'Do you offer financing options for small farm operators?', status: 'new' },
    { user_id: userIds.reader3, firm_id: firmIds.aerofirm, drone_id: droneIds.falcon2, message: 'What is the warranty period and what does support include?', status: 'closed' },
    { user_id: userIds.reader6, firm_id: firmIds.skybridge, drone_id: droneIds.voyager, message: 'What are the cargo bay dimensions for standard parcels?', status: 'contacted' },
  ];

  for (const i of rows) {
    await pool.query(
      `INSERT INTO inquiries (user_id, firm_id, drone_id, message, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [i.user_id, i.firm_id, i.drone_id, i.message, i.status]
    );
  }
}

async function seedDroneReviews(userIds, droneIds) {
  const rows = [
    { drone_id: droneIds.falcon2, user_id: userIds.reader1, rating: 5, body: 'Reliable in high winds and the multispectral data quality is excellent for the price point.' },
    { drone_id: droneIds.falcon2, user_id: userIds.reader2, rating: 4, body: 'Great flight time, but the companion software could use some polish.' },
    { drone_id: droneIds.falcon1Scout, user_id: userIds.reader3, rating: 4, body: 'Compact enough to launch from tight sites, holds up well in gusty conditions near structures.' },
    { drone_id: droneIds.falcon1Scout, user_id: userIds.reader4, rating: 5, body: 'The zoom camera catches hairline cracks we would have missed from the ground.' },
    { drone_id: droneIds.voyager, user_id: userIds.reader5, rating: 5, body: 'Delivered supplies to our clinic without issue across five flights so far.' },
    { drone_id: droneIds.voyager, user_id: userIds.reader1, rating: 4, body: 'Solid range, though the cargo bay is smaller than I expected for the price.' },
    { drone_id: droneIds.sentinel, user_id: userIds.reader2, rating: 5, body: 'The thermal camera made the real difference during an actual search operation.' },
    { drone_id: droneIds.sentinel, user_id: userIds.reader6, rating: 4, body: 'Excellent low-light performance, battery life could be a bit longer for extended searches.' },
    { drone_id: droneIds.mapperOne, user_id: userIds.reader3, rating: 3, body: 'Solid mapping accuracy, but initial setup took longer than advertised.' },
    { drone_id: droneIds.mapperOne, user_id: userIds.reader5, rating: 4, body: 'Multispectral data has been genuinely useful for early-season stress detection.' },
    { drone_id: droneIds.ranger, user_id: userIds.reader4, rating: 5, body: 'The 30x zoom is genuinely impressive at range, very stable gimbal.' },
    { drone_id: droneIds.ranger, user_id: userIds.reader6, rating: 4, body: 'Long endurance is the standout feature, worth the higher price for our patrol routes.' },
    { drone_id: droneIds.inspectorX, user_id: userIds.reader1, rating: 4, body: 'Good value for the price point — the LiDAR data comes out clean.' },
    { drone_id: droneIds.inspectorX, user_id: userIds.reader3, rating: 5, body: 'Surprised by how much this outperforms its price bracket on inspection detail.' },
    { drone_id: droneIds.horizon, user_id: userIds.reader2, rating: 4, body: 'A good entry point for a smaller farm, easy to fly out of the box.' },
    { drone_id: droneIds.horizon, user_id: userIds.reader5, rating: 5, body: 'Exactly what we needed to start mapping without a big upfront investment.' },
  ];

  for (const r of rows) {
    await pool.query(
      `INSERT INTO drone_reviews (drone_id, user_id, rating, body)
       VALUES ($1, $2, $3, $4)`,
      [r.drone_id, r.user_id, r.rating, r.body]
    );
  }
}

async function seedFavorites(userIds, droneIds, firmIds, articleIds) {
  const rows = [
    { user_id: userIds.reader1, item_type: 'drone', item_id: droneIds.falcon2 },
    { user_id: userIds.reader1, item_type: 'drone', item_id: droneIds.voyager },
    { user_id: userIds.reader1, item_type: 'firm', item_id: firmIds.aerofirm },
    { user_id: userIds.reader2, item_type: 'drone', item_id: droneIds.sentinel },
    { user_id: userIds.reader2, item_type: 'article', item_id: articleIds.emergencyResponse },
    { user_id: userIds.reader3, item_type: 'drone', item_id: droneIds.mapperOne },
    { user_id: userIds.reader3, item_type: 'firm', item_id: firmIds.meridian },
    { user_id: userIds.reader4, item_type: 'drone', item_id: droneIds.ranger },
    { user_id: userIds.reader5, item_type: 'drone', item_id: droneIds.horizon },
    { user_id: userIds.reader5, item_type: 'drone', item_id: droneIds.falcon1Scout },
    { user_id: userIds.reader6, item_type: 'firm', item_id: firmIds.skybridge },
  ];

  for (const f of rows) {
    await pool.query(
      `INSERT INTO favorites (user_id, item_type, item_id)
       VALUES ($1, $2, $3)`,
      [f.user_id, f.item_type, f.item_id]
    );
  }
}

async function main() {
  try {
    await resetTables();
    const firmIds = await seedFirms();
    const userIds = await seedUsers(firmIds);
    const droneIds = await seedDrones(firmIds);
    const articleIds = await seedArticles(userIds, droneIds, firmIds);
    await seedGalleryItems(droneIds, firmIds);
    await seedInquiries(userIds, droneIds, firmIds);
    await seedDroneReviews(userIds, droneIds);
    await seedFavorites(userIds, droneIds, firmIds, articleIds);
    console.log(`Every seeded user's password is: ${SEED_PASSWORD}`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();