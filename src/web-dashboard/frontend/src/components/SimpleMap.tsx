import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { useMapApi } from '../hooks/useMapApi';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SimpleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  const { reports, resourceAnalysis, loading, error, refetch } = useMapApi();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map with explicit height
    const map = L.map(mapRef.current, {
      center: [7.8731, 80.7718], // Sri Lanka
      zoom: 7,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Create marker layer
    const markers = L.layerGroup().addTo(map);

    // Store references
    mapInstance.current = map;
    markersLayer.current = markers;

    // Force map resize after a short delay
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersLayer.current = null;
      }
    };
  }, []);

  // Add markers when data changes
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    // Clear existing markers
    markersLayer.current.clearLayers();

    // Sri Lanka geographic boundaries for filtering
    const sriLankaBounds = {
      north: 9.8,
      south: 5.9,
      east: 81.9,
      west: 79.6
    };

    // Function to check if coordinates are within Sri Lanka
    const isInSriLanka = (lat: number, lng: number) => {
      return lat >= sriLankaBounds.south && lat <= sriLankaBounds.north &&
             lng >= sriLankaBounds.west && lng <= sriLankaBounds.east;
    };

    // Filter reports to only show Sri Lankan locations
    const sriLankanReports = reports.filter(report => {
      if (!report.location?.lat || !report.location?.lng) return false;
      return isInSriLanka(report.location.lat, report.location.lng);
    });

    // Filter resource analysis to only show Sri Lankan locations
    const sriLankanResources = resourceAnalysis.filter(resource => {
      if (!resource.lat || !resource.lng) return false;
      return isInSriLanka(resource.lat, resource.lng);
    });

    console.log(`Filtered data: ${sriLankanReports.length} reports and ${sriLankanResources.length} resource areas in Sri Lanka`);
    console.log(`Excluded: ${reports.length - sriLankanReports.length} reports and ${resourceAnalysis.length - sriLankanResources.length} resource areas outside Sri Lanka`);
    
    // Log the excluded locations for inspection
    if (reports.length - sriLankanReports.length > 0) {
      console.log('Reports excluded (outside Sri Lanka):');
      reports.filter(report => {
        if (!report.location?.lat || !report.location?.lng) return false;
        return !isInSriLanka(report.location.lat, report.location.lng);
      }).forEach((report, index) => {
        console.log(`  ${index + 1}. Type: ${report.type}, Location: ${report.location.lat}, ${report.location.lng}, Status: ${report.status}`);
      });
    }
    
    if (resourceAnalysis.length - sriLankanResources.length > 0) {
      console.log('Resource areas excluded (outside Sri Lanka):');
      resourceAnalysis.filter(resource => {
        if (!resource.lat || !resource.lng) return false;
        return !isInSriLanka(resource.lat, resource.lng);
      }).forEach((resource, index) => {
        console.log(`  ${index + 1}. Location: ${resource.lat}, ${resource.lng}, Reports: ${resource.totalReports}`);
      });
    }

    // Add report markers (blue) - only Sri Lankan locations
    sriLankanReports.forEach((report, index) => {
      const marker = L.marker([report.location.lat, report.location.lng])
        .bindPopup(`
          <div>
            <h3><strong>Report #${index + 1}</strong></h3>
            <p><strong>Type:</strong> ${report.type || 'N/A'}</p>
            <p><strong>Status:</strong> ${report.status || 'N/A'}</p>
            <p><strong>Priority:</strong> ${report.priority || 'N/A'}</p>
            <p><strong>Affected:</strong> ${report.affected_people || 'N/A'}</p>
            <p><strong>Location:</strong> ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}</p>
            <p><strong>Country:</strong> ${report.location.country || 'Sri Lanka'}</p>
            <hr>
            <p><strong>Resources Needed:</strong></p>
            <p>Food: ${report.resource_requirements?.food || 0}</p>
            <p>Water: ${report.resource_requirements?.water || 0}</p>
          </div>
        `);

      markersLayer.current!.addLayer(marker);
    });

    // Add resource analysis markers (red) - only Sri Lankan locations
    sriLankanResources.forEach((resource, index) => {
      const redIcon = L.divIcon({
        html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: 'custom-red-marker'
      });

      const marker = L.marker([resource.lat, resource.lng], { icon: redIcon })
        .bindPopup(`
          <div>
            <h3 style="color: #dc2626;"><strong>Resource Analysis #${index + 1}</strong></h3>
            <p><strong>Total Reports:</strong> ${resource.totalReports}</p>
            <p><strong>Critical Reports:</strong> ${resource.criticalReports}</p>
            <p><strong>Total Affected:</strong> ${resource.totalAffected}</p>
            <p><strong>Location:</strong> ${resource.lat.toFixed(4)}, ${resource.lng.toFixed(4)}</p>
            <hr>
            <p><strong>Resources Required:</strong></p>
            <p>Food: ${resource.resources?.food || 0}</p>
            <p>Water: ${resource.resources?.water || 0}</p>
          </div>
        `);

      markersLayer.current!.addLayer(marker);
    });

    // Fit map to show all markers if there are any
    const totalMarkers = sriLankanReports.length + sriLankanResources.length;
    if (totalMarkers > 0) {
      const group = L.featureGroup([...markersLayer.current!.getLayers()]);
      mapInstance.current!.fitBounds(group.getBounds().pad(0.1));
    } else {
      // If no markers, center on Sri Lanka
      mapInstance.current!.setView([7.8731, 80.7718], 7);
    }

  }, [reports, resourceAnalysis]);

  if (loading) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #ddd',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }} />
          <p>Loading map...</p>
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
        backgroundColor: '#fef2f2'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <h3>Map Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => refetch.all()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px',
          backgroundColor: '#e6f3ff'
        }} 
      />
      
      {/* Debug Info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>Reports: {reports.length}</div>
        <div>Resources: {resourceAnalysis.length}</div>
        <div>Map: {mapInstance.current ? 'Loaded' : 'Loading'}</div>
      </div>
    </div>
  );
};

export default SimpleMap;
