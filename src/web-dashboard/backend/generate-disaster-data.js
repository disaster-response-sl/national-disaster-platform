const mongoose = require('mongoose');

// Simple disaster schema for direct MongoDB insertion
const simpleDisasterData = [
  {
    "_id": new mongoose.Types.ObjectId(),
    "type": "flood",
    "severity": "high",
    "description": "Severe flooding in Ratnapura district after continuous rainfall",
    "location": {
      "lat": 6.6847,
      "lng": 80.4025
    },
    "timestamp": new Date("2025-08-20T14:30:00.000Z"),
    "status": "active"
  },
  {
    "_id": new mongoose.Types.ObjectId(),
    "type": "landslide",
    "severity": "high",
    "description": "Landslide disaster in Nuwara Eliya district threatening residential areas",
    "location": {
      "lat": 6.9497,
      "lng": 80.7718
    },
    "timestamp": new Date("2025-08-21T08:15:00.000Z"),
    "status": "active"
  },
  {
    "_id": new mongoose.Types.ObjectId(),
    "type": "cyclone",
    "severity": "medium",
    "description": "Tropical cyclone approaching the southern coast with strong winds expected",
    "location": {
      "lat": 5.9485,
      "lng": 80.5353
    },
    "timestamp": new Date("2025-08-22T12:00:00.000Z"),
    "status": "active"
  },
  {
    "_id": new mongoose.Types.ObjectId(),
    "type": "flood",
    "severity": "medium",
    "description": "Urban flooding in Colombo due to heavy monsoon rains affecting main roads",
    "location": {
      "lat": 6.9271,
      "lng": 79.8612
    },
    "timestamp": new Date("2025-08-19T18:45:00.000Z"),
    "status": "resolved"
  }
];

// MongoDB shell commands to insert data
console.log("// MongoDB Shell Commands to Insert Disaster Data");
console.log("// Copy and paste these commands into MongoDB Compass or mongo shell");
console.log("// ================================================================");
console.log("");
console.log("// 1. Connect to your database");
console.log("use disaster_platform");
console.log("");
console.log("// 2. Clear existing disasters (optional)");
console.log("db.disasters.deleteMany({});");
console.log("");
console.log("// 3. Insert disaster documents");
console.log("db.disasters.insertMany([");

simpleDisasterData.forEach((disaster, index) => {
  console.log("  {");
  console.log(`    "_id": ObjectId("${disaster._id}"),`);
  console.log(`    "type": "${disaster.type}",`);
  console.log(`    "severity": "${disaster.severity}",`);
  console.log(`    "description": "${disaster.description}",`);
  console.log("    \"location\": {");
  console.log(`      "lat": ${disaster.location.lat},`);
  console.log(`      "lng": ${disaster.location.lng}`);
  console.log("    },");
  console.log(`    "timestamp": ISODate("${disaster.timestamp.toISOString()}"),`);
  console.log(`    "status": "${disaster.status}"`);
  console.log("  }" + (index < simpleDisasterData.length - 1 ? "," : ""));
});

console.log("]);");
console.log("");
console.log("// 4. Verify the data was inserted");
console.log("db.disasters.find().pretty();");
console.log("");
console.log("// 5. Check count");
console.log("db.disasters.countDocuments();");

// Also export as JSON for easy import
const fs = require('fs');
const jsonOutput = {
  "collection": "disasters",
  "database": "disaster_platform",
  "data": simpleDisasterData.map(disaster => ({
    ...disaster,
    _id: { "$oid": disaster._id.toString() },
    timestamp: { "$date": disaster.timestamp.toISOString() }
  }))
};

fs.writeFileSync('disasters-import.json', JSON.stringify(jsonOutput, null, 2));
console.log("");
console.log("✅ Also created 'disasters-import.json' for MongoDB import tools");
