// seeders/resource-seeder.js
// Sample data seeder for resource management

const mongoose = require('mongoose');
const Resource = require('../models/Resource');

class ResourceSeeder {
  static async seedSampleResources() {
    try {
      // Clear existing resources (optional - comment out in production)
      // await Resource.deleteMany({});

      const sampleResources = [
        // Medical supplies
        {
          name: 'Emergency Medical Kit',
          type: 'medical_supplies',
          category: 'medical',
          quantity: {
            current: 100,
            allocated: 15,
            reserved: 5,
            unit: 'pieces'
          },
          status: 'available',
          priority: 'high',
          location: {
            lat: 6.9271,
            lng: 79.8612,
            address: 'Colombo General Hospital',
            city: 'Colombo'
          },
          supplier: {
            name: 'MedSupply Lanka',
            contact: '+94112345678'
          },
          supply_chain: {
            procurement_status: 'approved',
            vendor_id: 'MED001'
          },
          specifications: {
            description: 'First aid kit with essential medical supplies',
            expiry_date: new Date('2026-12-31')
          },
          created_by: 'admin_user',
          updated_by: 'admin_user'
        },
        
        // Food supplies
        {
          name: 'Emergency Food Packets',
          type: 'food',
          category: 'basic_needs',
          quantity: {
            current: 200,
            allocated: 50,
            reserved: 20,
            unit: 'boxes'
          },
          status: 'available',
          priority: 'medium',
          location: {
            lat: 6.8485,
            lng: 79.9284,
            address: 'Maharagama Food Center',
            city: 'Maharagama'
          },
          supplier: {
            name: 'Lanka Food Corp'
          },
          deployment_history: [
            {
              deployed_to: {
                disaster_id: 'DIS001',
                location: {
                  lat: 6.6847,
                  lng: 80.4025,
                  address: 'Ratnapura Flood Area'
                }
              },
              quantity_deployed: 30,
              deployed_at: new Date('2025-08-07T10:00:00Z'),
              deployed_by: 'responder_001',
              status: 'completed'
            }
          ],
          supply_chain: {
            procurement_status: 'received',
            vendor_id: 'FOOD001'
          },
          specifications: {
            description: 'Ready-to-eat meals for emergency distribution',
            expiry_date: new Date('2025-12-31')
          },
          created_by: 'admin_user'
        },
        // Water supplies
        {
          name: 'Bottled Water',
          type: 'water',
          category: 'basic_needs',
          quantity: {
            current: 500,
            allocated: 100,
            reserved: 50,
            unit: 'liters'
          },
          status: 'available',
          priority: 'high',
          location: {
            lat: 7.2944,
            lng: 80.6350,
            address: 'Kandy Distribution Hub',
            city: 'Kandy'
          },
          supplier: {
            name: 'Pure Water Lanka'
          },
          supply_chain: {
            procurement_status: 'received',
            vendor_id: 'WATER001'
          },
          specifications: {
            description: 'Purified drinking water',
            expiry_date: new Date('2026-08-01')
          },
          created_by: 'admin_user'
        },

        // Shelter materials
        {
          name: 'Emergency Tents',
          type: 'shelter',
          category: 'basic_needs',
          quantity: {
            current: 50,
            allocated: 15,
            reserved: 10,
            unit: 'pieces'
          },
          status: 'available',
          priority: 'medium',
          location: {
            lat: 6.0367,
            lng: 80.2170,
            address: 'Galle Emergency Center',
            city: 'Galle'
          },
          supplier: {
            name: 'Shelter Solutions Lanka'
          },
          specifications: {
            description: 'Waterproof emergency tents for 4-6 people'
          },
          created_by: 'admin_user'
        },

        // Personnel (Emergency Response Team)
        {
          name: 'Emergency Response Team',
          type: 'personnel',
          category: 'emergency',
          quantity: {
            current: 20,
            allocated: 8,
            reserved: 2,
            unit: 'people'
          },
          status: 'available',
          priority: 'critical',
          location: {
            lat: 6.9271,
            lng: 79.8612,
            address: 'National Emergency Operations Center',
            city: 'Colombo'
          },
          supplier: {
            name: 'National Emergency Service'
          },
          deployment_history: [
            {
              deployed_to: {
                disaster_id: 'DIS002',
                location: {
                  lat: 6.9497,
                  lng: 80.7718,
                  address: 'Nuwara Eliya Landslide Site'
                }
              },
              quantity_deployed: 5,
              deployed_at: new Date('2025-08-08T06:00:00Z'),
              deployed_by: 'ops_commander_001',
              status: 'deployed'
            }
          ],
          specifications: {
            description: 'Trained emergency response personnel'
          },
          created_by: 'admin_user'
        },

        // Transportation
        {
          name: 'Emergency Vehicles',
          type: 'transportation',
          category: 'logistics',
          quantity: {
            current: 10,
            allocated: 3,
            reserved: 2,
            unit: 'vehicles'
          },
          status: 'available',
          priority: 'high',
          location: {
            lat: 6.9271,
            lng: 79.8612,
            address: 'Central Transport Hub',
            city: 'Colombo'
          },
          supplier: {
            name: 'Lanka Emergency Transport'
          },
          specifications: {
            description: 'All-terrain vehicles for emergency response'
          },
          created_by: 'admin_user'
        },

        // Low stock item for testing alerts
        {
          name: 'Emergency Blankets',
          type: 'shelter',
          category: 'basic_needs',
          quantity: {
            current: 8,
            allocated: 5,
            reserved: 2,
            unit: 'pieces'
          },
          status: 'available',
          priority: 'medium',
          location: {
            lat: 8.5874,
            lng: 81.2152,
            address: 'Trincomalee Relief Center',
            city: 'Trincomalee'
          },
          supplier: {
            name: 'Comfort Supplies Lanka'
          },
          supply_chain: {
            procurement_status: 'ordered',
            expected_delivery: new Date('2025-08-20'),
            vendor_id: 'BLANKET001'
          },
          specifications: {
            description: 'Thermal emergency blankets for disaster victims'
          },
          created_by: 'admin_user'
        }
      ];

      const savedResources = await Resource.insertMany(sampleResources);
      
      console.log(`✅ Successfully seeded ${savedResources.length} sample resources`);
      return savedResources;
    } catch (error) {
      console.error('❌ Error seeding resources:', error);
      throw error;
    }
  }

  static async clearResources() {
    try {
      const result = await Resource.deleteMany({});
      console.log(`🗑️ Cleared ${result.deletedCount} existing resources`);
      return result;
    } catch (error) {
      console.error('❌ Error clearing resources:', error);
      throw error;
    }
  }
}

module.exports = ResourceSeeder;

// Run seeder if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-platform')
    .then(() => {
      console.log('📡 Connected to MongoDB');
      return ResourceSeeder.seedSampleResources();
    })
    .then(() => {
      console.log('🎉 Resource seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
