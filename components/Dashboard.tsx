
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { UserProfile, LocationPoint } from '../types';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const [location, setLocation] = useState<LocationPoint | null>(null);
  const [tracking, setTracking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(leafletMap.current);

    // Custom UI for zoom controls to keep it minimal
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    let watchId: number;

    if (tracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setLocation({ lat, lng, timestamp: pos.timestamp });
          setError(null);

          if (leafletMap.current) {
            const coords = [lat, lng];
            if (!marker.current) {
              marker.current = L.circleMarker(coords, {
                radius: 8,
                fillColor: "#000",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 1
              }).addTo(leafletMap.current);
              leafletMap.current.setView(coords, 15);
            } else {
              marker.current.setLatLng(coords);
            }
          }
        },
        (err) => {
          setError('Location access denied or unavailable.');
          console.error(err);
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking]);

  const handleCenter = () => {
    if (location && leafletMap.current) {
      leafletMap.current.setView([location.lat, location.lng], 15);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0 bg-zinc-100" />

      {/* Overlay UI */}
      <div className="relative z-10 p-4 pointer-events-none flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="bg-white border border-black p-3 pointer-events-auto max-w-[200px]">
            <p className="text-[10px] uppercase font-bold opacity-40">User Profile</p>
            <p className="text-sm font-bold truncate">{user.username}</p>
            <div className="mt-2 pt-2 border-t border-black/10">
              <p className="text-[10px] uppercase font-bold opacity-40">Status</p>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${tracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-[10px] uppercase">{tracking ? 'Tracking Active' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setTracking(!tracking)}
            className="bg-white border border-black px-4 py-2 pointer-events-auto text-[10px] uppercase font-bold hover:bg-black hover:text-white transition-colors"
          >
            {tracking ? 'Stop Track' : 'Start Track'}
          </button>
        </div>

        <div className="flex flex-col space-y-2 items-end">
          {error && (
            <div className="bg-white border border-red-600 text-red-600 p-2 text-[10px] uppercase pointer-events-auto">
              {error}
            </div>
          )}
          
          <div className="bg-white border border-black p-4 pointer-events-auto w-full md:w-auto md:min-w-[240px]">
             <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] uppercase font-bold opacity-40">Telemetry</p>
                <button 
                  onClick={handleCenter}
                  className="text-[10px] underline uppercase"
                >
                  Recenter
                </button>
             </div>
             {location ? (
               <div className="space-y-1">
                 <div className="flex justify-between font-mono text-xs">
                    <span>LAT</span>
                    <span>{location.lat.toFixed(6)}</span>
                 </div>
                 <div className="flex justify-between font-mono text-xs">
                    <span>LNG</span>
                    <span>{location.lng.toFixed(6)}</span>
                 </div>
                 <div className="text-[9px] opacity-40 mt-2 text-right">
                    {new Date(location.timestamp).toLocaleTimeString()}
                 </div>
               </div>
             ) : (
               <div className="text-xs italic opacity-40">Waiting for coordinates...</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
