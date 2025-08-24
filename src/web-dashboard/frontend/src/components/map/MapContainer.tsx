import React, { useRef, useEffect, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import type { MapContainerProps, MapBounds } from '../../types/map';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/mapHelpers';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Component to handle map events
const MapEventHandler: React.FC<{ onBoundsChange?: (bounds: MapBounds) => void }> = ({ 
  onBoundsChange 
}) => {
  const map = useMap();

  useEffect(() => {
    if (!onBoundsChange) return;

    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const mapBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };
      onBoundsChange(mapBounds);
    };

    map.on('moveend', handleMoveEnd);
    
    // Call initially
    handleMoveEnd();

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
};

const MapContainer: React.FC<MapContainerProps & { children?: React.ReactNode }> = ({
  className = '',
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  onBoundsChange,
  children,
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        ref={mapRef}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapReady && (
          <>
            <MapEventHandler onBoundsChange={onBoundsChange} />
            {children}
          </>
        )}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
