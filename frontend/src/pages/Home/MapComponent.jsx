import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 20,
  lng: 0
};

const mapOptions = {
  styles: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#00A3E1' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }]
    }
  ],
  disableDefaultUI: false,
  zoomControl: true,
};

export default function MapComponent({ selectedLocation }) {
  const [mapError, setMapError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Use a placeholder API key for development - you'll need to replace this
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'DEVELOPMENT_MODE';

  // Destination details for info window
  const destinationDetails = {
    'Santorini, Greece': { climate: 'Mediterranean', bestTime: 'Apr-Oct', attractions: 'White buildings, Blue domes, Sunset views' },
    'Bali, Indonesia': { climate: 'Tropical', bestTime: 'Apr-Oct', attractions: 'Temples, Beaches, Rice terraces' },
    'Kerala, India': { climate: 'Tropical', bestTime: 'Sep-Mar', attractions: 'Backwaters, Houseboats, Tea gardens' },
    'Maldives': { climate: 'Tropical', bestTime: 'Nov-Apr', attractions: 'Beaches, Diving, Resorts' },
    'Thailand': { climate: 'Tropical', bestTime: 'Nov-Feb', attractions: 'Temples, Markets, Islands' },
    'Machu Picchu, Peru': { climate: 'Mountain', bestTime: 'Apr-Oct', attractions: 'Ruins, Andes, History' },
    'Petra, Jordan': { climate: 'Desert', bestTime: 'Mar-May', attractions: 'Treasury, Ancient city, Desert' },
    'Capri, Italy': { climate: 'Mediterranean', bestTime: 'May-Sep', attractions: 'Blue Grotto, Cliffs, Beaches' },
    'Bora Bora, Polynesia': { climate: 'Tropical', bestTime: 'May-Oct', attractions: 'Lagoon, Overwater villas, Diving' }
  };

  const getDestinationName = (location) => {
    if (!location) return null;
    return Object.keys(destinationDetails).find(key => {
      const coords = {
        'Santorini, Greece': { lat: 36.3932, lng: 25.4615 },
        'Bali, Indonesia': { lat: -8.3405, lng: 115.0920 },
        'Kerala, India': { lat: 10.8505, lng: 76.2711 },
        'Maldives': { lat: 3.2028, lng: 73.2207 },
        'Thailand': { lat: 13.7563, lng: 100.5018 },
        'Machu Picchu, Peru': { lat: -13.1631, lng: -72.5450 },
        'Petra, Jordan': { lat: 30.3285, lng: 35.4444 },
        'Capri, Italy': { lat: 40.5508, lng: 14.2417 },
        'Bora Bora, Polynesia': { lat: -16.5004, lng: -151.7415 }
      };
      return coords[key].lat === location.lat && coords[key].lng === location.lng;
    });
  };

  const currentDestination = getDestinationName(selectedLocation);
  const details = currentDestination ? destinationDetails[currentDestination] : null;

  // If no API key or map error, show a fallback static map
  if (API_KEY === 'DEVELOPMENT_MODE' || mapError) {
    return (
      <div className="w-full h-full relative bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          {selectedLocation ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Your Selected Destination</h3>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <p className="text-lg font-semibold text-teal-600 mb-2">📍 Location Coordinates</p>
                <p className="text-gray-700">Latitude: {selectedLocation.lat.toFixed(4)}</p>
                <p className="text-gray-700">Longitude: {selectedLocation.lng.toFixed(4)}</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Interactive map will load with valid Google Maps API key
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">Map Preview</h3>
              <p className="text-gray-600">Select a destination to view location details</p>
              <div className="mt-6 text-sm text-gray-500">
                <p>To enable interactive maps:</p>
                <ol className="mt-2 text-left max-w-md mx-auto space-y-1">
                  <li>1. Get a Google Maps API key</li>
                  <li>2. Create a .env file in your project root</li>
                  <li>3. Add: VITE_GOOGLE_MAPS_API_KEY=your_key_here</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={API_KEY}
      onError={() => setMapError(true)}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedLocation || defaultCenter}
        zoom={selectedLocation ? 10 : 2}
        options={mapOptions}
      >
        {selectedLocation && (
          <>
            <Marker
              position={selectedLocation}
              onMouseOver={() => setShowInfo(true)}
              onMouseOut={() => setShowInfo(false)}
              onClick={() => setShowInfo(!showInfo)}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 12,
                fillColor: '#00C9A7',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3
              }}
            />
            
            {showInfo && details && (
              <InfoWindow
                position={selectedLocation}
                onCloseClick={() => setShowInfo(false)}
              >
                <div className="p-4 max-w-xs">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-teal-500 pb-2">
                    {currentDestination}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-teal-600 font-semibold text-sm">🌤️ Climate:</span>
                      <span className="text-gray-700 text-sm">{details.climate}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-teal-600 font-semibold text-sm">📅 Best Time:</span>
                      <span className="text-gray-700 text-sm">{details.bestTime}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-teal-600 font-semibold text-sm">✨ Attractions:</span>
                      <span className="text-gray-700 text-sm">{details.attractions}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
