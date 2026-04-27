"use client";

import React, { useState, useMemo, useCallback } from "react";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { List } from "react-window";


import { Card, Button, cn, MotionCard } from "@/components/ui";
import { MapPin, Navigation, Clock, Search, ChevronLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { PollingStation } from "@/types";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#242f3e" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#746855" }],
    },
  ],
};

const mockStations: PollingStation[] = [
  { 
    id: "1", 
    name: "City Hall Community Center", 
    location: { lat: 34.0522, lng: -118.2437 }, 
    address: "200 N Spring St, Los Angeles, CA", 
    hours: "7 AM - 8 PM", 
    accessibility: ["Wheelchair", "ASL"] 
  },
  { 
    id: "2", 
    name: "Westside Library", 
    location: { lat: 34.045, lng: -118.25 }, 
    address: "555 W 5th St, Los Angeles, CA", 
    hours: "7 AM - 8 PM", 
    accessibility: ["Wheelchair"] 
  },
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `mock-${i}`,
    name: `Poll Station ${i + 3}`,
    location: { lat: 34.05 + (i * 0.001), lng: -118.25 + (i * 0.001) }, // Stable location
    address: `${100 + i} Main St, Los Angeles, CA`,
    hours: "7 AM - 8 PM",
    accessibility: ["Wheelchair"]
  }))
];

/**
 * Optimized row component for the virtualized station list.
 * Memoized to prevent re-renders when map state changes.
 */
const StationRow = React.memo(({ index, style, ...data }: any) => {
  const { filteredStations, selectedStation, setSelectedStation } = data;
  const station = filteredStations[index];
  const isSelected = selectedStation?.id === station.id;

  return (
    <div style={style} className="px-4 pb-2">
      <div 
        onClick={() => setSelectedStation(station)}
        className={cn(
          "p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-1",
          isSelected 
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' 
          : 'border-slate-100 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-slate-900/50'
        )}
      >
        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
          {station.name}
        </h3>
        <p className="text-[10px] text-slate-500 truncate">{station.address}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
            <Clock size={10} /> Open
          </span>
        </div>
      </div>
    </div>
  );
});

StationRow.displayName = 'StationRow';

export default function PollingMapPage() {
  const { profile } = useAuth();
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  });

  const stations = mockStations;

  const filteredStations = useMemo(() => 
    stations.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [stations, searchTerm]
  );


  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-[10] shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500" aria-label="Back">
              <ChevronLeft size={20} />
            </Link>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <MapPin size={18} />
            </div>
            <h1 className="text-xl font-black tracking-tight">Polling Places</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or zip..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 min-h-0 py-4">
        <div className="flex-1 min-h-0 py-4">
          <List
            rowCount={filteredStations.length}
            rowHeight={100}
            rowComponent={StationRow as any}
            rowProps={{
              filteredStations,
              selectedStation,
              setSelectedStation
            }}
          />
        </div>

        </div>

      </aside>

      {/* Map Area */}
      <main className="flex-1 relative z-0">
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse">
            <p className="text-sm font-bold text-slate-400">Loading Secure Maps...</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedStation ? selectedStation.location : { lat: 34.0522, lng: -118.2437 }}
            zoom={13}
            options={mapOptions as google.maps.MapOptions}
          >
            {filteredStations.map((station) => (
              <Marker
                key={station.id}
                position={station.location}
                onClick={() => setSelectedStation(station)}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                }}
              />
            ))}

            {selectedStation && (
              <InfoWindow
                position={selectedStation.location}
                onCloseClick={() => setSelectedStation(null)}
              >
                <div className="p-2 min-w-[200px] text-slate-900">
                  <h3 className="font-bold text-sm">{selectedStation.name}</h3>
                  <p className="text-[10px] text-slate-500 mb-2">{selectedStation.address}</p>
                  <Button className="w-full py-1 text-[10px] bg-blue-600 text-white">Get Directions</Button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {/* Floating Detail Card (UX Polish) */}
        {selectedStation && (
          <div className="absolute bottom-8 left-8 right-8 md:right-auto md:w-96 z-[1001]">
            <MotionCard className="border-2 border-blue-600 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight leading-tight">{selectedStation.name}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Station</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-bold text-green-600">Open until 8 PM</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wait Time</p>
                  <p className="text-xs font-bold text-blue-600">&lt; 15 mins</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30">Start Navigation</Button>
                <Button 
                  onClick={() => setSelectedStation(null)}
                  className="px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Close
                </Button>
              </div>
            </MotionCard>
          </div>
        )}
      </main>
    </div>
  );
}
