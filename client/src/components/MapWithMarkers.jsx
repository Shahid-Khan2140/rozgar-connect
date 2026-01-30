import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  blue: createCustomIcon('blue'),
  red: createCustomIcon('red'),
  green: createCustomIcon('green'),
  orange: createCustomIcon('orange'),
  gold: createCustomIcon('gold'),
};

// Coordinate Dictionary for Major Indian Cities (Approximate)
const CITY_COORDS = {
  "delhi": [28.7041, 77.1025],
  "new delhi": [28.6139, 77.2090],
  "mumbai": [19.0760, 72.8777],
  "pune": [18.5204, 73.8567],
  "bangalore": [12.9716, 77.5946],
  "bengaluru": [12.9716, 77.5946],
  "hyderabad": [17.3850, 78.4867],
  "chennai": [13.0827, 80.2707],
  "kolkata": [22.5726, 88.3639],
  "ahmedabad": [23.0225, 72.5714],
  "surat": [21.1702, 72.8311],
  "jaipur": [26.9124, 75.7873],
  "lucknow": [26.8467, 80.9462],
  "kanpur": [26.4499, 80.3319],
  "nagpur": [21.1458, 79.0882],
  "indore": [22.7196, 75.8577],
  "bhopal": [23.2599, 77.4126],
  "patna": [25.5941, 85.1376],
  "vadodara": [22.3072, 73.1812],
  "ghaziabad": [28.6692, 77.4538],
  "ludhiana": [30.9010, 75.8573],
  "agra": [27.1767, 78.0081],
  "nashik": [19.9975, 73.7898],
  "fitter": [22.5726, 88.3639], // Fallback for skill-as-location edge cases
  "plumber": [19.0760, 72.8777],
};

// Helper: Add random jitter to coordinates so items don't overlap perfectly
const jitter = (coord) => {
  return coord + (Math.random() - 0.5) * 0.05; // ~5km range jitter
};

const MapWithMarkers = ({ items, type = "worker", onItemClick }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center of India

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border-2 border-white relative z-0">
       <MapContainer 
          center={defaultCenter} 
          zoom={5} 
          style={{ height: "100%", width: "100%" }}
          className="z-0"
       >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {items.map((item) => {
           // Normalize location string
           const locKey = (item.location || "").toLowerCase().trim();
           let position = CITY_COORDS[locKey];

           // Formatting Info based on type
           let icon = icons.blue;
           let title = item.name || item.title;
           let subtitle = item.skill || item.category;

           if(type === 'job') {
              icon = icons.orange;
              // If location missing for job, default to random major city for demo
              if(!position) {
                 const cities = Object.values(CITY_COORDS);
                 position = cities[Math.floor(Math.random() * cities.length)];
              }
           } else {
              // Workers
              icon = item.availability === 'Available' ? icons.green : icons.red;
              if(!position) {
                  // If worker location unknown, map to Ahmedabad (Default seed) or random
                  position = CITY_COORDS['ahmedabad']; 
              }
           }

           // Apply jitter
           const finalPos = [jitter(position[0]), jitter(position[1])];

           return (
             <Marker 
                key={item._id || item.id} 
                position={finalPos} 
                icon={icon}
                eventHandlers={{
                  click: () => onItemClick && onItemClick(item),
                }}
             >
               <Popup>
                 <div className="p-1 min-w-[150px]">
                    <h3 className="font-bold text-gray-800 m-0">{title}</h3>
                    <p className="text-xs text-gray-500 m-0 mb-2">{subtitle}</p>
                    <p className="text-xs font-semibold flex items-center gap-1">
                       <MapPin size={10}/> {item.location}
                    </p>
                    <button 
                       onClick={() => onItemClick && onItemClick(item)}
                       className="mt-2 text-xs bg-blue-600 text-white w-full py-1 rounded hover:bg-blue-700"
                    >
                       View Details
                    </button>
                 </div>
               </Popup>
             </Marker>
           );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-xs">
         <h4 className="font-bold mb-2 text-gray-700">Legend</h4>
         {type === 'worker' ? (
           <>
             <div className="flex items-center gap-2 mb-1"><img src={icons.green.options.iconUrl} className="w-4"/> Available</div>
             <div className="flex items-center gap-2"><img src={icons.red.options.iconUrl} className="w-4"/> Busy</div>
           </>
         ) : (
           <div className="flex items-center gap-2"><img src={icons.orange.options.iconUrl} className="w-4"/> Job Openings</div>
         )}
      </div>
    </div>
  );
};

export default MapWithMarkers;
