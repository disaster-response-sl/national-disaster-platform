// services/ai-resource-optimizer.js
// AI-powered resource allocation and optimization service

const Resource = require('../models/Resource');
const Report = require('../models/Report');
const Disaster = require('../models/Disaster');
const SosSignal = require('../models/SosSignal');

class AIResourceOptimizer {
  constructor() {
    this.optimizationWeights = {
      priority: 0.3,
      distance: 0.25,
      quantity_needed: 0.2,
      resource_availability: 0.15,
      deployment_speed: 0.1
    };
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Analyze demand based on disasters, reports, and SOS signals
  async analyzeDemand(location, radius = 100) {
    try {
      const [disasters, reports, sosSignals] = await Promise.all([
        Disaster.find({
          status: 'active',
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
              $maxDistance: radius * 1000
            }
          }
        }),
        Report.find({
          status: { $in: ['pending', 'in_progress'] },
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
              $maxDistance: radius * 1000
            }
          }
        }),
        SosSignal.find({
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
              $maxDistance: radius * 1000
            }
          }
        })
      ]);

      // Calculate demand scores
      const demandAnalysis = {
        total_disasters: disasters.length,
        total_reports: reports.length,
        total_sos_signals: sosSignals.length,
        severity_score: this.calculateSeverityScore(disasters, reports, sosSignals),
        resource_requirements: this.calculateResourceRequirements(reports),
        urgency_level: this.calculateUrgencyLevel(disasters, sosSignals),
        affected_population: this.estimateAffectedPopulation(reports)
      };

      return demandAnalysis;
    } catch (error) {
      console.error('Error analyzing demand:', error);
      throw error;
    }
  }

  calculateSeverityScore(disasters, reports, sosSignals) {
    let score = 0;
    
    // Disaster severity
    disasters.forEach(disaster => {
      const severityWeight = { low: 1, medium: 3, high: 5 };
      score += severityWeight[disaster.severity] || 2;
    });

    // Report priority
    reports.forEach(report => {
      const priorityWeight = { low: 1, medium: 2, high: 4, critical: 6 };
      score += priorityWeight[report.priority] || 2;
    });

    // SOS signals (high urgency)
    score += sosSignals.length * 4;

    return Math.min(score, 100); // Cap at 100
  }

  calculateResourceRequirements(reports) {
    const requirements = {
      food: 0,
      water: 0,
      medical_supplies: 0,
      shelter: 0,
      transportation: 0,
      personnel: 0
    };

    reports.forEach(report => {
      if (report.resource_requirements) {
        Object.keys(requirements).forEach(key => {
          requirements[key] += report.resource_requirements[key] || 0;
        });
      }
      
      // Estimate based on affected people and report type
      const multiplier = this.getResourceMultiplier(report.type);
      const affected = report.affected_people || 1;
      
      requirements[report.type] += affected * multiplier;
    });

    return requirements;
  }

  getResourceMultiplier(reportType) {
    const multipliers = {
      food: 3,
      water: 5,
      medical: 2,
      shelter: 1,
      transportation: 0.5,
      communication: 0.2
    };
    return multipliers[reportType] || 1;
  }

  calculateUrgencyLevel(disasters, sosSignals) {
    const recentSOS = sosSignals.filter(signal => 
      signal.timestamp > new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
    ).length;

    const criticalDisasters = disasters.filter(disaster => 
      disaster.severity === 'high'
    ).length;

    if (recentSOS > 5 || criticalDisasters > 2) return 'critical';
    if (recentSOS > 2 || criticalDisasters > 0) return 'high';
    if (recentSOS > 0 || disasters.length > 0) return 'medium';
    return 'low';
  }

  estimateAffectedPopulation(reports) {
    return reports.reduce((total, report) => total + (report.affected_people || 1), 0);
  }

  // Generate optimal resource allocation recommendations
  async generateOptimalAllocation(targetLocation, demandAnalysis) {
    try {
      // Get available resources
      const availableResources = await Resource.find({
        status: { $in: ['available', 'dispatched'] },
        'quantity.current': { $gt: 0 }
      });

      // Calculate allocation scores for each resource
      const allocationRecommendations = [];

      for (const resource of availableResources) {
        const distance = this.calculateDistance(
          resource.location.lat,
          resource.location.lng,
          targetLocation.lat,
          targetLocation.lng
        );

        const availableQuantity = resource.quantity.current - 
                                resource.quantity.allocated - 
                                resource.quantity.reserved;

        const allocationScore = this.calculateAllocationScore({
          resource,
          distance,
          availableQuantity,
          demandAnalysis,
          targetLocation
        });

        const recommendation = {
          resource_id: resource._id,
          resource_name: resource.name,
          resource_type: resource.type,
          current_location: resource.location,
          distance_km: Math.round(distance * 10) / 10,
          available_quantity: availableQuantity,
          allocation_score: allocationScore.total_score,
          score_breakdown: allocationScore.breakdown,
          recommended_quantity: this.calculateRecommendedQuantity(
            resource,
            demandAnalysis,
            allocationScore.total_score
          ),
          estimated_deployment_time: this.estimateDeploymentTime(distance, resource.type),
          deployment_priority: this.calculateDeploymentPriority(allocationScore.total_score, demandAnalysis)
        };

        allocationRecommendations.push(recommendation);
      }

      // Sort by allocation score
      allocationRecommendations.sort((a, b) => b.allocation_score - a.allocation_score);

      return {
        recommendations: allocationRecommendations,
        optimization_summary: {
          total_resources_analyzed: availableResources.length,
          high_priority_recommendations: allocationRecommendations.filter(r => r.deployment_priority >= 80).length,
          average_deployment_time: this.calculateAverageDeploymentTime(allocationRecommendations),
          resource_coverage: this.calculateResourceCoverage(allocationRecommendations, demandAnalysis)
        },
        generated_at: new Date()
      };
    } catch (error) {
      console.error('Error generating optimal allocation:', error);
      throw error;
    }
  }

  calculateAllocationScore({ resource, distance, availableQuantity, demandAnalysis, targetLocation }) {
    const weights = this.optimizationWeights;
    
    // Priority score (0-100)
    const priorityScore = this.getPriorityScore(resource.priority);
    
    // Distance score (closer is better, 0-100)
    const distanceScore = Math.max(0, 100 - (distance / 10)); // Penalty increases with distance
    
    // Quantity needed score (0-100)
    const quantityScore = this.getQuantityScore(resource.type, demandAnalysis, availableQuantity);
    
    // Availability score (0-100)
    const availabilityScore = Math.min(100, (availableQuantity / 100) * 100);
    
    // Deployment speed score (0-100)
    const deploymentScore = this.getDeploymentSpeedScore(resource.type);

    const totalScore = 
      (priorityScore * weights.priority) +
      (distanceScore * weights.distance) +
      (quantityScore * weights.quantity_needed) +
      (availabilityScore * weights.resource_availability) +
      (deploymentScore * weights.deployment_speed);

    return {
      total_score: Math.round(totalScore * 10) / 10,
      breakdown: {
        priority: priorityScore,
        distance: distanceScore,
        quantity_needed: quantityScore,
        availability: availabilityScore,
        deployment_speed: deploymentScore
      }
    };
  }

  getPriorityScore(priority) {
    const scores = { critical: 100, high: 80, medium: 60, low: 40 };
    return scores[priority] || 50;
  }

  getQuantityScore(resourceType, demandAnalysis, availableQuantity) {
    const demandForType = demandAnalysis.resource_requirements[resourceType] || 0;
    if (demandForType === 0) return 50; // Neutral score if no specific demand
    
    const fulfillmentRatio = Math.min(1, availableQuantity / demandForType);
    return fulfillmentRatio * 100;
  }

  getDeploymentSpeedScore(resourceType) {
    // Different resource types have different deployment speeds
    const speedScores = {
      personnel: 90,
      transportation: 85,
      medical_supplies: 80,
      water: 75,
      food: 70,
      communication: 85,
      equipment: 60,
      shelter: 50
    };
    return speedScores[resourceType] || 65;
  }

  calculateRecommendedQuantity(resource, demandAnalysis, allocationScore) {
    const demandForType = demandAnalysis.resource_requirements[resource.type] || 0;
    const availableQuantity = resource.quantity.current - 
                            resource.quantity.allocated - 
                            resource.quantity.reserved;

    // Base recommendation on demand and allocation score
    let recommendedQuantity = Math.min(availableQuantity, demandForType);

    // Adjust based on allocation score
    if (allocationScore > 80) {
      recommendedQuantity = Math.min(availableQuantity, demandForType * 1.2); // 20% more for high-scoring resources
    } else if (allocationScore < 40) {
      recommendedQuantity = Math.min(availableQuantity, demandForType * 0.5); // 50% for low-scoring resources
    }

    return Math.max(0, Math.floor(recommendedQuantity));
  }

  estimateDeploymentTime(distance, resourceType) {
    // Base speed in km/h for different resource types
    const baseSpeeds = {
      personnel: 60,
      transportation: 80,
      medical_supplies: 70,
      water: 50,
      food: 50,
      equipment: 40,
      shelter: 30
    };

    const speed = baseSpeeds[resourceType] || 50;
    const timeInHours = distance / speed;
    
    // Add preparation time
    const prepTime = { 
      personnel: 0.5, 
      medical_supplies: 1, 
      equipment: 2, 
      shelter: 4 
    };
    
    const totalTime = timeInHours + (prepTime[resourceType] || 1);
    
    if (totalTime < 1) return `${Math.round(totalTime * 60)} minutes`;
    return `${Math.round(totalTime * 10) / 10} hours`;
  }

  calculateDeploymentPriority(allocationScore, demandAnalysis) {
    let priority = allocationScore;
    
    // Boost priority based on urgency
    if (demandAnalysis.urgency_level === 'critical') priority += 20;
    else if (demandAnalysis.urgency_level === 'high') priority += 10;
    
    // Boost based on affected population
    if (demandAnalysis.affected_population > 1000) priority += 15;
    else if (demandAnalysis.affected_population > 500) priority += 10;
    else if (demandAnalysis.affected_population > 100) priority += 5;

    return Math.min(100, Math.round(priority));
  }

  calculateAverageDeploymentTime(recommendations) {
    if (recommendations.length === 0) return 'N/A';
    
    const totalMinutes = recommendations.reduce((sum, rec) => {
      const timeStr = rec.estimated_deployment_time;
      if (timeStr.includes('hours')) {
        return sum + parseFloat(timeStr) * 60;
      } else {
        return sum + parseFloat(timeStr);
      }
    }, 0);

    const avgMinutes = totalMinutes / recommendations.length;
    if (avgMinutes < 60) return `${Math.round(avgMinutes)} minutes`;
    return `${Math.round(avgMinutes / 60 * 10) / 10} hours`;
  }

  calculateResourceCoverage(recommendations, demandAnalysis) {
    const coverage = {};
    const requirements = demandAnalysis.resource_requirements;
    
    Object.keys(requirements).forEach(resourceType => {
      const demanded = requirements[resourceType] || 0;
      const recommended = recommendations
        .filter(r => r.resource_type === resourceType)
        .reduce((sum, r) => sum + r.recommended_quantity, 0);
      
      coverage[resourceType] = demanded > 0 ? Math.round((recommended / demanded) * 100) : 100;
    });

    return coverage;
  }

  // Supply chain optimization
  async optimizeSupplyChain(timeframe = 30) {
    try {
      const cutoffDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
      
      // Analyze resource consumption patterns
      const consumptionPatterns = await Resource.aggregate([
        { $unwind: '$deployment_history' },
        { $match: { 'deployment_history.deployed_at': { $gte: cutoffDate } } },
        {
          $group: {
            _id: '$type',
            total_deployed: { $sum: '$deployment_history.quantity_deployed' },
            deployment_count: { $sum: 1 },
            avg_deployment: { $avg: '$deployment_history.quantity_deployed' },
            resource_ids: { $addToSet: '$_id' }
          }
        },
        { $sort: { total_deployed: -1 } }
      ]);

      // Identify low stock resources
      const lowStockResources = await Resource.find({
        $expr: {
          $lt: [
            { $subtract: ['$quantity.current', { $add: ['$quantity.allocated', '$quantity.reserved'] }] },
            50 // Threshold for low stock
          ]
        }
      });

      // Generate reorder recommendations
      const reorderRecommendations = this.generateReorderRecommendations(
        consumptionPatterns,
        lowStockResources
      );

      return {
        consumption_analysis: consumptionPatterns,
        low_stock_alerts: lowStockResources,
        reorder_recommendations: reorderRecommendations,
        optimization_suggestions: this.generateOptimizationSuggestions(consumptionPatterns),
        analysis_period: `${timeframe} days`,
        generated_at: new Date()
      };
    } catch (error) {
      console.error('Error optimizing supply chain:', error);
      throw error;
    }
  }

  generateReorderRecommendations(consumptionPatterns, lowStockResources) {
    const recommendations = [];

    lowStockResources.forEach(resource => {
      const consumption = consumptionPatterns.find(p => p._id === resource.type);
      const avgWeeklyConsumption = consumption ? consumption.total_deployed / 4 : 0;
      
      const currentAvailable = resource.quantity.current - 
                             resource.quantity.allocated - 
                             resource.quantity.reserved;

      const recommendedReorder = Math.max(
        avgWeeklyConsumption * 8, // 8 weeks supply
        100 // Minimum reorder quantity
      );

      recommendations.push({
        resource_id: resource._id,
        resource_name: resource.name,
        resource_type: resource.type,
        current_available: currentAvailable,
        avg_weekly_consumption: Math.round(avgWeeklyConsumption),
        recommended_reorder_quantity: Math.round(recommendedReorder),
        urgency: currentAvailable < avgWeeklyConsumption ? 'high' : 'medium',
        estimated_stockout_date: this.estimateStockoutDate(currentAvailable, avgWeeklyConsumption)
      });
    });

    return recommendations.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  estimateStockoutDate(currentStock, weeklyConsumption) {
    if (weeklyConsumption <= 0) return 'No consumption data';
    
    const weeksRemaining = currentStock / weeklyConsumption;
    const stockoutDate = new Date(Date.now() + weeksRemaining * 7 * 24 * 60 * 60 * 1000);
    
    if (weeksRemaining < 1) return 'Within 1 week';
    if (weeksRemaining < 4) return `${Math.round(weeksRemaining)} weeks`;
    
    return stockoutDate.toDateString();
  }

  generateOptimizationSuggestions(consumptionPatterns) {
    const suggestions = [];

    // High consumption items
    const highConsumptionItems = consumptionPatterns.filter(p => p.total_deployed > 1000);
    if (highConsumptionItems.length > 0) {
      suggestions.push({
        type: 'high_consumption',
        message: 'Consider establishing regional stockpiles for high-consumption items',
        items: highConsumptionItems.map(item => item._id)
      });
    }

    // Distribution efficiency
    suggestions.push({
      type: 'distribution_optimization',
      message: 'Implement predictive stocking based on seasonal disaster patterns',
      priority: 'medium'
    });

    // Automation opportunities
    suggestions.push({
      type: 'automation',
      message: 'Consider automated reordering for critical supplies',
      priority: 'high'
    });

    return suggestions;
  }
}

module.exports = AIResourceOptimizer;
