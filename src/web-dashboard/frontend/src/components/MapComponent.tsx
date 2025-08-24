import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapApi } from '../hooks/useMapApi';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  const { reports, heatmapData, resourceAnalysis, loading, error, refetch } = useMapApi();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    try {
      // Create map instance
      const map = L.map(mapRef.current, {
        center: [7.8731, 80.7718], // Sri Lanka center
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Create markers layer
      const markers = L.layerGroup().addTo(map);

      // Store references
      mapInstance.current = map;
      markersLayer.current = markers;

      console.log('Map initialized successfully');
    } catch (err) {
      console.error('Error initializing map:', err);
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersLayer.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    try {
      // Clear existing markers
      markersLayer.current.clearLayers();
      console.log('Updating markers with data:', { reports: reports.length, resourceAnalysis: resourceAnalysis.length });

      // Add report markers
      reports.forEach((report, index) => {
        if (!report.location?.lat || !report.location?.lng) return;

        const marker = L.marker([report.location.lat, report.location.lng]);
        
        const popupContent = `
          <div style="max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; font-weight: bold;">Report #${index + 1}</h3>
            <p><strong>Type:</strong> ${report.type || 'N/A'}</p>
            <p><strong>Status:</strong> ${report.status || 'N/A'}</p>
            <p><strong>Priority:</strong> ${report.priority || 'N/A'}</p>
            <p><strong>Affected People:</strong> ${report.affected_people || 'N/A'}</p>
            <p><strong>Location:</strong> ${report.location.country || 'Unknown'}</p>
            <div style="margin-top: 10px;">
              <strong>Resources Needed:</strong><br>
              Food: ${report.resource_requirements?.food || 0}<br>
              Water: ${report.resource_requirements?.water || 0}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        if (markersLayer.current) {
          markersLayer.current.addLayer(marker);
        }
      });

      // Add resource analysis markers
      resourceAnalysis.forEach((resource, index) => {
        if (!resource.lat || !resource.lng) return;

        const icon = L.divIcon({
          html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
          className: 'custom-resource-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([resource.lat, resource.lng], { icon });
        
        const popupContent = `
          <div style="max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; font-weight: bold; color: #dc2626;">Resource Analysis #${index + 1}</h3>
            <p><strong>Total Reports:</strong> ${resource.totalReports}</p>
            <p><strong>Critical Reports:</strong> ${resource.criticalReports}</p>
            <p><strong>Total Affected:</strong> ${resource.totalAffected}</p>
            <div style="margin-top: 10px;">
              <strong>Required Resources:</strong><br>
              Food: ${resource.resources?.food || 0}<br>
              Water: ${resource.resources?.water || 0}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        if (markersLayer.current) {
          markersLayer.current.addLayer(marker);
        }
      });

      console.log('Markers updated successfully');
    } catch (err) {
      console.error('Error updating markers:', err);
    }
  }, [reports, resourceAnalysis]);

  if (loading) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#dc2626', fontSize: '20px', marginBottom: '16px' }}>Map Error</div>
          <p style={{ marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={() => refetch.all()}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Loading Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Controls Panel */}
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '320px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '18px' }}>Map Controls</h3>
        
        {/* Statistics */}
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
          <p style={{ margin: '2px 0' }}>Reports: {reports.length}</p>
          <p style={{ margin: '2px 0' }}>Heatmap Points: {heatmapData.length}</p>
          <p style={{ margin: '2px 0' }}>Resource Areas: {resourceAnalysis.length}</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => refetch.all()}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Legend */}
      <div style={{ 
        position: 'absolute', 
        bottom: '16px', 
        left: '16px', 
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>Legend</h4>
        <div style={{ fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px', marginRight: '8px' }} />
            Reports
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '50%', marginRight: '8px' }} />
            Resource Analysis
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#f3f4f6'
        }} 
      />
    </div>
  );
}

export default MapComponent;
