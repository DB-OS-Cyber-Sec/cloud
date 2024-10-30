"use client";

import * as React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const WeatherMap: React.FC = React.memo(() => {
  const [mapKey, setMapKey] = React.useState(Date.now());

  // Force re-render of the MapContainer on component mount to avoid reinitialization error
  /*
  React.useEffect(() => {
    setMapKey(Date.now());
  }, []);
  */

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
      style={{ height: "500px", width: "100%", borderRadius: "0.75rem" }}
      id="map" // Ensure this ID is unique if used elsewhere in the component
    >
      <TileLayer
        url={`https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/precipitationIntensity/now.png?apikey=H1JQu7ed6iF6AaThQoG2hTOHaUxtFiiW`}
        attribution="&copy; Tomorrow.io"
      />
    </MapContainer>
  );
});

export default WeatherMap;
