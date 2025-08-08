import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export interface LeafletDisasterPoint {
  id: string;
  latitude: number;
  longitude: number;
  type: string; // flood | landslide | cyclone
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

interface LeafletMapProps {
  points: LeafletDisasterPoint[];
  userLocation?: { latitude: number; longitude: number } | null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ points, userLocation }) => {
  const webRef = useRef<WebView>(null);
  const [webReady, setWebReady] = useState(false);

  const html = useMemo(() => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      .marker-label { font-size: 12px; font-weight: bold; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
      const COLORS = { high: '#ff4444', medium: '#ffaa00', low: '#44ff44' };
      let map = L.map('map', { zoomControl: true });
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });
      osm.addTo(map);

      let markersLayer = L.layerGroup().addTo(map);

      function isFiniteNum(n) { return typeof n === 'number' && isFinite(n); }

      window.updateMapData = function(payload) {
        try {
          const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
          const { points = [], userLocation = null, fit = true } = data || {};

          markersLayer.clearLayers();
          const latlngs = [];

          if (Array.isArray(points)) {
            points.forEach(p => {
              if (!p) return;
              const lat = Number(p.latitude);
              const lng = Number(p.longitude);
              if (!isFiniteNum(lat) || !isFiniteNum(lng)) return;
              const color = COLORS[p.severity] || '#666666';
              const marker = L.circleMarker([lat, lng], { radius: 8, color, weight: 2, fillColor: color, fillOpacity: 0.6 });
              const title = (p.type || 'Disaster').toString();
              const time = new Date(p.timestamp || Date.now()).toLocaleString();
              const desc = (p.description || '').toString();
              marker.bindPopup('<b>' + title + '</b> (' + p.severity + ')<br/>' + time + '<br/>' + desc);
              marker.addTo(markersLayer);
              latlngs.push([lat, lng]);
            });
          }

          // Optional user location highlight
          if (userLocation && isFiniteNum(userLocation.latitude) && isFiniteNum(userLocation.longitude)) {
            const u = L.circle([userLocation.latitude, userLocation.longitude], { radius: 200, color: 'rgba(0,122,255,0.5)', fillColor: 'rgba(0,122,255,0.15)', fillOpacity: 0.3, weight: 2 });
            u.addTo(markersLayer);
            latlngs.push([userLocation.latitude, userLocation.longitude]);
          }

          if (fit && latlngs.length > 0) {
            const bounds = L.latLngBounds(latlngs);
            map.fitBounds(bounds.pad(0.2));
          } else if (!map._loaded) {
            // Initial fallback
            map.setView([20, 78], 4);
          }
        } catch (e) {
          // eslint-disable-next-line
          console.error('updateMapData error', e);
        }
      }

      window.fitToMarkers = function() {
        try {
          const bounds = markersLayer.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds.pad(0.2));
          }
        } catch (e) {}
      }

      // Initial view
      map.whenReady(function() {
        map.setView([20, 78], 4);
      });
    </script>
  </body>
  </html>`;
  }, []);

  const payload = useMemo(() => ({
    points,
    userLocation: userLocation || null,
    fit: true,
  }), [points, userLocation]);

  useEffect(() => {
    if (!webReady || !webRef.current) return;
    const js = `window.updateMapData(${JSON.stringify(payload)}); true;`;
    webRef.current.injectJavaScript(js);
  }, [payload, webReady]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        onLoadEnd={() => setWebReady(true)}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        allowsInlineMediaPlayback
        setSupportMultipleWindows={false}
        cacheEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LeafletMap;


