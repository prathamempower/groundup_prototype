import { NextRequest, NextResponse } from "next/server";

// GroundUp AI: Real-Time Location Autocomplete API
// Provides clean address suggestions across US locations with fast fallback.
// Adheres to Zero Em Dash and strict Apple-grade minimalism.

interface FormattedLocation {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const BENCHMARK_PROJECT_ADDRESSES: FormattedLocation[] = [
  {
    label: "73 Broadway, Jersey City, NJ 07306",
    street: "73 Broadway",
    city: "Jersey City",
    state: "NJ",
    zip: "07306",
  },
  {
    label: "392 1st Street, Jersey City, NJ 07302",
    street: "392 1st Street",
    city: "Jersey City",
    state: "NJ",
    zip: "07302",
  },
  {
    label: "161 Woodlawn Avenue, Jersey City, NJ 07305",
    street: "161 Woodlawn Avenue",
    city: "Jersey City",
    state: "NJ",
    zip: "07305",
  },
  {
    label: "100 Grand Street, Jersey City, NJ 07302",
    street: "100 Grand Street",
    city: "Jersey City",
    state: "NJ",
    zip: "07302",
  },
  {
    label: "250 Washington Street, Jersey City, NJ 07302",
    street: "250 Washington Street",
    city: "Jersey City",
    state: "NJ",
    zip: "07302",
  },
  {
    label: "450 7th Avenue, New York, NY 10123",
    street: "450 7th Avenue",
    city: "New York",
    state: "NY",
    zip: "10123",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const queryLower = query.toLowerCase();
  const results: FormattedLocation[] = [];
  const seenLabels = new Set<string>();

  // 1. Fast match on benchmark addresses
  for (const b of BENCHMARK_PROJECT_ADDRESSES) {
    if (b.label.toLowerCase().includes(queryLower) || b.street.toLowerCase().includes(queryLower)) {
      results.push(b);
      seenLabels.add(b.label.toLowerCase());
    }
  }

  // 2. Query OpenStreetMap Nominatim for live US addresses
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=6&countrycodes=us`;

    const nominatimRes = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "GroundUpRealEstateEngine/1.0 (construction-draws)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (nominatimRes.ok) {
      const data = await nominatimRes.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const addr = item.address || {};
          const houseNumber = addr.house_number || "";
          const road = addr.road || addr.street || addr.pedestrian || addr.suburb || "";
          const city =
            addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || addr.county || "";
          const state = addr["ISO3166-2-lvl4"] ? addr["ISO3166-2-lvl4"].replace("US-", "") : (addr.state || "");
          const zip = addr.postcode || "";

          let street = road;
          if (houseNumber && road) {
            street = `${houseNumber} ${road}`;
          }

          if (street && city) {
            const formattedLabel = `${street}, ${city}, ${state} ${zip}`.trim().replace(/\s+,/g, ",");
            const lowerKey = formattedLabel.toLowerCase();
            if (!seenLabels.has(lowerKey)) {
              seenLabels.add(lowerKey);
              results.push({
                label: formattedLabel,
                street,
                city,
                state,
                zip,
              });
            }
          }
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  // 3. Photon autocomplete if needed
  if (results.length < 5) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
      const photonRes = await fetch(photonUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });

      if (photonRes.ok) {
        const pdata = await photonRes.json();
        if (pdata?.features && Array.isArray(pdata.features)) {
          for (const feat of pdata.features) {
            const p = feat.properties || {};
            const streetName = p.street || p.name || "";
            const houseNumber = p.housenumber || "";
            const city = p.city || p.district || p.county || "";
            const state = p.state || "";
            const zip = p.postcode || "";

            let street = streetName;
            if (houseNumber && streetName && !streetName.startsWith(houseNumber)) {
              street = `${houseNumber} ${streetName}`;
            }

            if (street && city) {
              const formattedLabel = `${street}, ${city}, ${state} ${zip}`.trim().replace(/\s+,/g, ",");
              const lowerKey = formattedLabel.toLowerCase();
              if (!seenLabels.has(lowerKey)) {
                seenLabels.add(lowerKey);
                results.push({
                  label: formattedLabel,
                  street,
                  city,
                  state,
                  zip,
                });
              }
            }
          }
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  return NextResponse.json({
    results: results.slice(0, 5),
  });
}
