"use client";

import * as React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const WeatherMap: React.FC = React.memo(() => {
  const [mapKey, setMapKey] = React.useState(Date.now());

  // Cleanup to prevent "already initialized" error
  React.useEffect(() => {
    return () => {
      const mapContainer = document.getElementById("map"); // Ensure this matches your map container ID
      if (mapContainer && (mapContainer as any)._leaflet_id) {
        delete (mapContainer as any)._leaflet_id; // Remove _leaflet_id to avoid re-initialization errors
      }
    };
  }, []);

  return (
    <MapContainer
      key={mapKey} // Unique key to force re-render on refresh or update
      center={[13, 122]} // Centered on the Philippines
      zoom={5}
      style={{ height: "675px", width: "100%", borderRadius: "0.75rem" }}
      id="map" // Ensure this ID is unique if used elsewhere in the component
      scrollWheelZoom={true}   // Enable scroll wheel zoom
      dragging={true}          // Ensure dragging is enabled
      zoomControl={true}       // Enable zoom control
      doubleClickZoom={true}   // Enable double-click zooming
      boxZoom={true}           // Enable box zoom (shift-drag to zoom)
      keyboard={true}          // Enable keyboard navigation
    >
      {/* Base Map Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Tomorrow.io Weather Overlay */}
      <TileLayer
        url={`https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/precipitationIntensity/now.png?apikey=H1JQu7ed6iF6AaThQoG2hTOHaUxtFiiW`}
        attribution="&copy; Tomorrow.io"
      />
    </MapContainer>
  );
});

export default WeatherMap;
