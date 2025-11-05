import React, { useState } from "react";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function TripPlanner() {
  const [prefs, setPrefs] = useState({
    budget: "medium",
    interests: "culture",
    travelMode: "driving",
    totalDays: 3,
  });
  const [result, setResult] = useState(null);

  const generate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/trips/generate", {
        preferences: prefs,
      });
      setResult(data.trip || { itinerary: data.trip?.itinerary || [] });
    } catch (err) {
      console.error(err);
      alert("Error generating");
    }
  };

  return (
    <div>
      <h2>Trip Planner</h2>
      <form onSubmit={generate} className="planner-form">
        <label>Interests</label>
        <input
          value={prefs.interests}
          onChange={(e) =>
            setPrefs((prev) => ({ ...prev, interests: e.target.value }))
          }
        />
        <label>Budget</label>
        <select
          value={prefs.budget}
          onChange={(e) =>
            setPrefs((prev) => ({ ...prev, budget: e.target.value }))
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label>Days</label>
        <input
          type="number"
          value={prefs.totalDays}
          onChange={(e) =>
            setPrefs((prev) => ({ ...prev, totalDays: Number(e.target.value) }))
          }
        />
        <button type="submit">Generate Itinerary</button>
      </form>

      {result?.itinerary && (
        <div className="itinerary">
          <h3>Itinerary</h3>
          <ul>
            {result.itinerary.map((item, i) => (
              <li key={i}>
                <strong>{item.title}</strong> - {item.description}
                <br /> coords: {item.coordinates?.lat},{item.coordinates?.lng}
              </li>
            ))}
          </ul>

          <div style={{ height: 400 }}>
            <MapContainer
              center={[
                result.itinerary[0]?.coordinates?.lat || 40.7128,
                result.itinerary[0]?.coordinates?.lng || -74.006,
              ]}
              zoom={13}
              style={{ height: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {result.itinerary.map((it, idx) => (
                <Marker
                  key={idx}
                  position={[it.coordinates.lat, it.coordinates.lng]}
                >
                  <Popup>{it.title}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
