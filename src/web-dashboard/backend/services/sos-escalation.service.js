const SosSignal = require('../models/SosSignal');
const Disaster = require('../models/Disaster');

class SosEscalationService {
  constructor() {
    // Configuration for auto-escalation timing (in minutes)
    this.ESCALATION_RULES = {
      FIRST_ESCALATION: 15,   // 15 minutes without acknowledgment
      SECOND_ESCALATION: 30,  // 30 minutes without response
      CRITICAL_ESCALATION: 45 // 45 minutes - auto-create disaster
    };
  }

  /**
   * Auto-escalate SOS signals based on time and response
   */
  async processAutoEscalation() {
    try {
      console.log('[SOS ESCALATION] Starting auto-escalation process...');
      
      const now = new Date();
      let escalatedCount = 0;
      
      // Find signals that need escalation
      const signalsToEscalate = await SosSignal.find({
        status: { $in: ['pending', 'acknowledged'] },
        escalation_level: { $lt: 2 }, // Not already at max escalation
        created_at: {
          $lt: new Date(now.getTime() - (this.ESCALATION_RULES.FIRST_ESCALATION * 60 * 1000))
        }
      });

      for (const signal of signalsToEscalate) {
        const timeSinceCreated = (now - signal.created_at) / (1000 * 60); // minutes
        let escalationNeeded = false;
        let newEscalationLevel = signal.escalation_level;
        let escalationReason = '';

        // Determine escalation level needed
        if (timeSinceCreated >= this.ESCALATION_RULES.CRITICAL_ESCALATION && signal.escalation_level < 2) {
          newEscalationLevel = 2;
          escalationReason = `Critical escalation: No resolution after ${Math.round(timeSinceCreated)} minutes`;
          escalationNeeded = true;
        } else if (timeSinceCreated >= this.ESCALATION_RULES.SECOND_ESCALATION && signal.escalation_level < 1) {
          newEscalationLevel = 1;
          escalationReason = `Second escalation: No response after ${Math.round(timeSinceCreated)} minutes`;
          escalationNeeded = true;
        } else if (timeSinceCreated >= this.ESCALATION_RULES.FIRST_ESCALATION && signal.escalation_level < 1) {
          newEscalationLevel = 1;
          escalationReason = `First escalation: No acknowledgment after ${Math.round(timeSinceCreated)} minutes`;
          escalationNeeded = true;
        }

        if (escalationNeeded) {
          // Update signal
          signal.escalation_level = newEscalationLevel;
          signal.auto_escalated_at = now;
          
          // Upgrade priority based on escalation level
          if (newEscalationLevel === 2 && signal.priority !== 'critical') {
            signal.priority = 'critical';
          } else if (newEscalationLevel === 1 && ['low', 'medium'].includes(signal.priority)) {
            signal.priority = 'high';
          }

          // Add escalation note
          signal.notes.push({
            responder_id: 'system',
            note: `AUTO-ESCALATED: ${escalationReason}`,
            timestamp: now
          });

          await signal.save();
          escalatedCount++;

          console.log(`[SOS ESCALATION] Signal ${signal._id} escalated to level ${newEscalationLevel}`);

          // If critical escalation, check if we should auto-create disaster
          if (newEscalationLevel === 2) {
            await this.checkAndCreateDisaster(signal);
          }
        }
      }

      console.log(`[SOS ESCALATION] Process completed. Escalated ${escalatedCount} signals.`);
      return { success: true, escalatedCount };

    } catch (error) {
      console.error('[SOS ESCALATION ERROR]', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if a critical SOS should auto-create a disaster entry
   */
  async checkAndCreateDisaster(sosSignal) {
    try {
      // Check if there are multiple critical SOS signals in the area (2km radius)
      const nearbySignals = await SosSignal.find({
        _id: { $ne: sosSignal._id },
        priority: { $in: ['high', 'critical'] },
        status: { $in: ['pending', 'acknowledged', 'responding'] },
        'location.lat': {
          $gte: sosSignal.location.lat - 0.018, // ~2km latitude
          $lte: sosSignal.location.lat + 0.018
        },
        'location.lng': {
          $gte: sosSignal.location.lng - 0.018, // ~2km longitude
          $lte: sosSignal.location.lng + 0.018
        },
        created_at: {
          $gte: new Date(Date.now() - (2 * 60 * 60 * 1000)) // Last 2 hours
        }
      });

      // If 3 or more high/critical signals in area, create disaster
      if (nearbySignals.length >= 2) { // 2 + current signal = 3 total
        const disasterType = this.determinDisasterType(sosSignal, nearbySignals);
        const severity = nearbySignals.length >= 5 ? 'high' : 'medium';

        const disaster = new Disaster({
          type: disasterType,
          severity: severity,
          description: `Auto-generated from ${nearbySignals.length + 1} SOS signals in vicinity. Initial report: ${sosSignal.message}`,
          location: {
            lat: sosSignal.location.lat,
            lng: sosSignal.location.lng
          },
          status: 'active'
        });

        await disaster.save();

        // Link SOS signals to disaster
        await SosSignal.updateMany(
          { _id: { $in: [sosSignal._id, ...nearbySignals.map(s => s._id)] } },
          { 
            $push: {
              notes: {
                responder_id: 'system',
                note: `Auto-linked to disaster event: ${disaster._id}`,
                timestamp: new Date()
              }
            }
          }
        );

        console.log(`[SOS ESCALATION] Auto-created disaster ${disaster._id} from ${nearbySignals.length + 1} SOS signals`);
      }

    } catch (error) {
      console.error('[AUTO-DISASTER CREATION ERROR]', error);
    }
  }

  /**
   * Determine disaster type based on SOS messages and patterns
   */
  determinDisasterType(primarySignal, nearbySignals) {
    const allMessages = [primarySignal.message, ...nearbySignals.map(s => s.message)].join(' ').toLowerCase();
    
    // Simple keyword matching - can be enhanced with ML
    if (allMessages.includes('flood') || allMessages.includes('water') || allMessages.includes('rain')) {
      return 'flood';
    } else if (allMessages.includes('landslide') || allMessages.includes('slide') || allMessages.includes('mud')) {
      return 'landslide';
    } else if (allMessages.includes('cyclone') || allMessages.includes('storm') || allMessages.includes('wind')) {
      return 'cyclone';
    }
    
    // Default to flood as it's most common
    return 'flood';
  }

  /**
   * Get escalation statistics
   */
  async getEscalationStats(timeRange = '24h') {
    try {
      const now = new Date();
      let timeFilter = new Date();
      
      switch (timeRange) {
        case '1h':
          timeFilter.setHours(now.getHours() - 1);
          break;
        case '6h':
          timeFilter.setHours(now.getHours() - 6);
          break;
        case '24h':
          timeFilter.setDate(now.getDate() - 1);
          break;
        case '7d':
          timeFilter.setDate(now.getDate() - 7);
          break;
        default:
          timeFilter = new Date(0);
      }

      const stats = await SosSignal.aggregate([
        { $match: { auto_escalated_at: { $gte: timeFilter } } },
        {
          $group: {
            _id: '$escalation_level',
            count: { $sum: 1 },
            avgEscalationTime: {
              $avg: {
                $divide: [
                  { $subtract: ['$auto_escalated_at', '$created_at'] },
                  1000 * 60 // Convert to minutes
                ]
              }
            }
          }
        }
      ]);

      return {
        success: true,
        data: stats.reduce((acc, stat) => {
          acc[`level_${stat._id}`] = {
            count: stat.count,
            avgEscalationTime: Math.round(stat.avgEscalationTime || 0)
          };
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('[ESCALATION STATS ERROR]', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start the auto-escalation scheduler
   */
  startScheduler(intervalMinutes = 5) {
    console.log(`[SOS ESCALATION] Starting scheduler with ${intervalMinutes} minute intervals`);
    
    // Run immediately
    this.processAutoEscalation();
    
    // Then run every interval
    setInterval(() => {
      this.processAutoEscalation();
    }, intervalMinutes * 60 * 1000);
  }
}

module.exports = SosEscalationService;
