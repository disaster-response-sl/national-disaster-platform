import type { Report, Disaster, ResourceAnalysis, MapStatistics, HeatmapPoint } from '../types/map';

export const sampleReports: Report[] = [
  {
    _id: '1',
    location: { lat: 6.9271, lng: 79.8612 },
    resource_requirements: { food: 50, water: 100, shelter: 20, medical: 15, rescue: 8 },
    type: 'flood',
    status: 'active',
    priority: 3,
    affected_people: 150,
    description: 'Flash flood in Colombo downtown area affecting multiple buildings.',
    createdAt: '2025-08-23T08:30:00Z',
    updatedAt: '2025-08-23T09:15:00Z',
  },
  {
    _id: '2',
    location: { lat: 7.2906, lng: 80.6337 },
    resource_requirements: { food: 30, water: 60, shelter: 10, medical: 8, rescue: 12 },
    type: 'landslide',
    status: 'resolved',
    priority: 2,
    affected_people: 75,
    description: 'Minor landslide cleared from Kandy-Mahiyangana road.',
    createdAt: '2025-08-22T14:20:00Z',
    updatedAt: '2025-08-23T07:00:00Z',
  },
  {
    _id: '3',
    location: { lat: 6.0329, lng: 80.2168 },
    resource_requirements: { food: 200, water: 400, shelter: 80, medical: 25, rescue: 15 },
    type: 'earthquake',
    status: 'monitoring',
    priority: 1,
    affected_people: 500,
    description: 'Earthquake monitoring in Galle district. No major damage reported.',
    createdAt: '2025-08-23T06:45:00Z',
    updatedAt: '2025-08-23T10:30:00Z',
  },
  {
    _id: '4',
    location: { lat: 7.8731, lng: 80.7718 },
    resource_requirements: { food: 10, water: 25, shelter: 5, medical: 5, rescue: 10 },
    type: 'fire',
    status: 'active',
    priority: 3,
    affected_people: 25,
    description: 'Forest fire in Anuradhapura district being contained.',
    createdAt: '2025-08-23T11:00:00Z',
    updatedAt: '2025-08-23T11:45:00Z',
  },
];

export const sampleDisasters: Disaster[] = [
  {
    _id: 'disaster-1',
    location: { lat: 6.9271, lng: 79.8612 },
    name: 'Colombo Flash Floods 2025',
    type: 'flood',
    status: 'active',
    priority: 3,
    affectedAreas: ['Colombo Central', 'Fort', 'Pettah', 'Maradana'],
    estimatedAffected: 2500,
    description: 'Major flooding event in Colombo metropolitan area due to heavy monsoon rains.',
    createdAt: '2025-08-22T18:00:00Z',
    updatedAt: '2025-08-23T12:00:00Z',
  },
  {
    _id: 'disaster-2',
    location: { lat: 7.2906, lng: 80.6337 },
    name: 'Kandy Landslide Series',
    type: 'landslide',
    status: 'monitoring',
    priority: 2,
    affectedAreas: ['Kandy Central', 'Peradeniya', 'Gampola'],
    estimatedAffected: 800,
    description: 'Series of landslides in the hill country affecting rural communities.',
    createdAt: '2025-08-21T09:30:00Z',
    updatedAt: '2025-08-23T08:15:00Z',
  },
];

export const sampleHeatmapData: HeatmapPoint[] = [
  { 
    lat: 6.9271, 
    lng: 79.8612, 
    intensity: 0.8,
    count: 3,
    totalAffected: 150,
    avgPriority: 2.5,
    types: ['flood'],
    statuses: ['active']
  },
  { 
    lat: 6.9200, 
    lng: 79.8500, 
    intensity: 0.6,
    count: 2,
    totalAffected: 80,
    avgPriority: 2.0,
    types: ['flood'],
    statuses: ['monitoring']
  },
  { 
    lat: 7.2906, 
    lng: 80.6337, 
    intensity: 0.9,
    count: 4,
    totalAffected: 200,
    avgPriority: 3.0,
    types: ['landslide'],
    statuses: ['active']
  },
];

export const sampleResourceAnalysis: ResourceAnalysis[] = [
  {
    lat: 6.9271,
    lng: 79.8612,
    totalReports: 3,
    totalAffected: 150,
    criticalReports: 1,
    resources: {
      medical: 15,
      rescue: 8,
      shelter: 20,
      food: 50,
      water: 100,
    },
  },
  {
    lat: 7.2906,
    lng: 80.6337,
    totalReports: 2,
    totalAffected: 75,
    criticalReports: 0,
    resources: {
      medical: 8,
      rescue: 12,
      shelter: 10,
      food: 30,
      water: 60,
    },
  },
];

export const sampleStatistics: MapStatistics = {
  byType: [
    { _id: 'flood', count: 1 },
    { _id: 'landslide', count: 1 },
    { _id: 'earthquake', count: 1 },
    { _id: 'fire', count: 1 },
  ],
  byStatus: [
    { _id: 'active', count: 2 },
    { _id: 'resolved', count: 1 },
    { _id: 'monitoring', count: 1 },
  ],
  byPriority: [
    { _id: '1', count: 1 },
    { _id: '2', count: 1 },
    { _id: '3', count: 2 },
  ],
  totalReports: 4,
  totalAffected: 750,
};
