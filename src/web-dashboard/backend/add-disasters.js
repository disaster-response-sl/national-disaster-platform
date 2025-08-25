db.disasters.insertMany([
  {
    disaster_code: "NGB-FLD-20250827-01",
    type: "flood",
    severity: "medium",
    description: "Flooding in Negombo due to heavy rains, causing roadblocks in low-lying areas.",
    location: { lat: 7.2008, lng: 79.8737 },
    timestamp: ISODate("2025-08-27T08:30:00Z"),
    status: "active"
  },
  {
    disaster_code: "COL-CYC-20250827-01",
    type: "cyclone",
    severity: "high",
    description: "Cyclone winds in Colombo disrupted electricity and uprooted several trees.",
    location: { lat: 6.9271, lng: 79.8612 },
    timestamp: ISODate("2025-08-27T12:00:00Z"),
    status: "active"
  },
  {
    disaster_code: "MLB-LND-20250827-01",
    type: "landslide",
    severity: "high",
    description: "A landslide in Malabe blocked key roads and damaged nearby houses.",
    location: { lat: 6.9056, lng: 79.9580 },
    timestamp: ISODate("2025-08-27T15:00:00Z"),
    status: "active"
  }
]);
