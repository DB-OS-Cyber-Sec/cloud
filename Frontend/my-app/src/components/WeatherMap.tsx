"use client";
import * as React from "react";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// api key 1: H1JQu7ed6iF6AaThQoG2hTOHaUxtFiiW
// api key 2: hwHYdmMG7hvF0P1lYEBJJTXzP48mRDC5

const WeatherMap: React.FC = React.memo(() => {
  const [mapKey, setMapKey] = React.useState(Date.now());

  // Cleanup to prevent "already initialized" error
  React.useEffect(() => {
    return () => {
      const mapContainer = document.getElementById("map");
      if (mapContainer && (mapContainer as any)._leaflet_id) {
        delete (mapContainer as any)._leaflet_id;
      }
    };
  }, []);

  return (
    <MapContainer
      key={mapKey}
      center={[13, 122]} // Centered on the Philippines
      zoom={5}
      style={{ height: "650px", width: "100%", borderRadius: "0.75rem" }}
      id="map"
      scrollWheelZoom={true}
      dragging={true}
      zoomControl={true}
      doubleClickZoom={true}
      boxZoom={true}
      keyboard={true}
      minZoom={5} // Set minimum zoom to control how far out users can zoom
      maxZoom={12} // Set maximum zoom to control how close users can zoom in
    >
      <LayersControl position="topright">
        {/* Base Map Layer */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        </LayersControl.BaseLayer>

        {/* Weather Layers from Tomorrow.io */}
        <LayersControl.Overlay checked name="Wind Direction">
          <TileLayer
            url={`https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/windDirection/now.png?apikey=hwHYdmMG7hvF0P1lYEBJJTXzP48mRDC5`}
            attribution="&copy; Tomorrow.io"
            minZoom={5} // Set minimum zoom to control how far out users can zoom
            maxZoom={12} // Set maximum zoom to control how close users can zoom in
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Wind Speed">
          <TileLayer
            url={`https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/windSpeed/now.png?apikey=hwHYdmMG7hvF0P1lYEBJJTXzP48mRDC5`}
            attribution="&copy; Tomorrow.io"
            minZoom={5} // Set minimum zoom to control how far out users can zoom
            maxZoom={12} // Set maximum zoom to control how close users can zoom in
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Precipitation Intensity">
          <TileLayer
            url={`https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/precipitationIntensity/now.png?apikey=hwHYdmMG7hvF0P1lYEBJJTXzP48mRDC5`}
            attribution="&copy; Tomorrow.io"
            minZoom={5} // Set minimum zoom to control how far out users can zoom
            maxZoom={12} // Set maximum zoom to control how close users can zoom in
          />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
});

export default WeatherMap;
