// Interactive map component with Leaflet integration
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
}

const InteractiveMap: React.FC<MapViewProps> = ({ 
  center = [6.9271, 79.8612], // Default to Sri Lanka
  zoom = 8,
  className = "h-full w-full",
  children 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Wait for map to be fully ready before setting state
    map.whenReady(() => {
      mapInstanceRef.current = map;
      setIsMapReady(true);
      console.log('Map is ready and initialized');
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [center, zoom]);

  // Provide map instance to children through context or props - only when map is ready
  const childrenWithMap = isMapReady && mapInstanceRef.current ? React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        map: mapInstanceRef.current 
      } as any);
    }
    return child;
  }) : null;

  return (
    <div className={className}>
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      {isMapReady && childrenWithMap}
      {!isMapReady && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Initializing map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
