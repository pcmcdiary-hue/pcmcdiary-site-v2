// scripts/xlsx-to-json.mjs
// Convert PCMC Diary Excel → JSON files matching existing site format.
// Usage: node scripts/xlsx-to-json.mjs "PCMC Diary — Master Data v2 (1).xlsx"

import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

const INPUT = process.argv[2] || 'PCMC Diary — Master Data v2 (1).xlsx';
const OUT_DIR = process.argv[3] || 'src/data';

// ---------- helpers ----------
const str = (v) => {
  if (v === undefined || v === null || v === '') return '';
  return String(v).trim();
};

const dash = (v) => {
  const s = str(v);
  if (!s) return '-';
  return s;
};

// Preserve uppercase TRUE/FALSE strings (matches existing JSON)
const boolStr = (v) => {
  const s = str(v).toLowerCase();
  return (s === 'true' || s === 'yes' || s === '1') ? 'TRUE' : 'FALSE';
};

// Numbers become strings, integer-looking floats drop the .0
const numStr = (v, fallback = '') => {
  const s = str(v);
  if (!s) return fallback;
  const n = Number(s);
  if (!isFinite(n)) return fallback;
  return Number.isInteger(n) ? String(n) : String(n);
};

// Remove trailing ".0" from pincode-like values (Excel float artifacts)
const cleanPincode = (v) => {
  const s = str(v).replace(/\.0+$/, '');
  return s || '';
};

// Replicates the existing (broken but stable) format: "411057411062.0" → "411,057,411,062"
const servicePincodes = (v) => {
  const s = str(v).replace(/\.0+$/, '').replace(/[^0-9]/g, '');
  if (!s) return '';
  // insert commas every 3 digits (matches existing output)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Strip time from date strings: "2026-09-30 00:00:00" → "2026-09-30"
const dateOnly = (v) => {
  const s = str(v);
  if (!s) return '-';
  return s.split(' ')[0] || '-';
};

// Convert socialLinks string → leave as-is (existing JSON keeps it as raw string)
const socialLinks = (v) => str(v);

// ---------- main ----------
async function main() {
  console.log(`Reading: ${INPUT}`);
  const wb = XLSX.readFile(INPUT);
  await fs.mkdir(path.join(OUT_DIR, 'clients'), { recursive: true });

  // --- categories.json ---
  const catRows = XLSX.utils.sheet_to_json(wb.Sheets['categories'], { defval: '' });
  const categories = catRows
    .filter(r => str(r.categoryId))
    .map(r => ({
      categoryId: str(r.categoryId),
      categoryName: str(r.categoryName),
      icon: str(r.icon),
      file: str(r.file),
      subCategories: str(r.subCategories),
      sortOrder: numStr(r.sortOrder, '0'),
      status: str(r.status) || 'Active'
    }));

  await fs.writeFile(
    path.join(OUT_DIR, 'categories.json'),
    JSON.stringify({ categories }, null, 2)
  );
  console.log(`✓ categories.json  (${categories.length} categories)`);

  // --- locations.json ---
  const locRows = XLSX.utils.sheet_to_json(wb.Sheets['locations'], { defval: '' });
  const locations = locRows
    .filter(r => str(r.locationId))
    .map(r => ({
      locationId: str(r.locationId),
      locationName: str(r.locationName),
      zone: str(r.zone),
      pincode: cleanPincode(r.pincode),
      lat: numStr(r.lat, '0'),
      lng: numStr(r.lng, '0'),
      sortOrder: numStr(r.sortOrder, '0')
    }));

  await fs.writeFile(
    path.join(OUT_DIR, 'locations.json'),
    JSON.stringify({ locations }, null, 2)
  );
  console.log(`✓ locations.json   (${locations.length} locations)`);

  // --- clients/{category}.json ---
  const businessSheets = wb.SheetNames.filter(
    n => n !== 'categories' && n !== 'locations'
  );

  let totalBiz = 0;

  for (const sheetName of businessSheets) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

    const businesses = rows
      .filter(r => str(r.businessId) && str(r.businessName))  // skip empty rows
      .map(r => ({
        businessId: str(r.businessId),
        businessName: str(r.businessName),
        subCategory: str(r.subCategory),
        location: str(r.location),
        pincode: cleanPincode(r.pincode),
        address: str(r.address),
        phone: str(r.phone).replace(/\.0+$/, ''),
        email: dash(r.email),
        website: dash(r.website),
        googleMap: dash(r.googleMap),
        latitude: numStr(r.latitude, '0'),
        longitude: numStr(r.longitude, '0'),
        serviceArea: str(r.serviceArea),
        servicePincodes: servicePincodes(r.servicePincodes),
        locationCount: str(r.locationCount),
        description: str(r.description),
        tier: str(r.tier) || 'free',
        socialLinks: socialLinks(r.socialLinks),
        timing: str(r.timing),
        featured: boolStr(r.featured),
        premium: boolStr(r.premium),
        verified: boolStr(r.verified),
        unclaimed: boolStr(r.unclaimed),
        tags: str(r.tags),
        rating: numStr(r.rating, ''),
        reviews: numStr(r.reviews, ''),
        deals: dash(r.deals),
        dealCode: dash(r.dealCode),
        dealExpiry: dateOnly(r.dealExpiry)
      }));

    await fs.writeFile(
      path.join(OUT_DIR, 'clients', sheetName + '.json'),
      JSON.stringify(businesses, null, 2)
    );

    totalBiz += businesses.length;
    console.log(`✓ clients/${sheetName}.json  (${businesses.length})`);
  }

  console.log(`\nDone. ${categories.length} categories, ${locations.length} locations, ${totalBiz} businesses.`);
}

main().catch(e => { console.error(e); process.exit(1); });
