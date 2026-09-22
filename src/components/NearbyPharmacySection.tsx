import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  MessageSquare, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Copy, 
  Building2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShoppingBag,
  Home
} from 'lucide-react';
import { Medication, NearbyPharmacy } from '../types';
import { 
  fetchNearbyPharmacies, 
  getWhatsAppPharmacyUrl, 
  getSmsPharmacyUrl, 
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  generateRefillMessage 
} from '../utils/pharmacyService';

interface Props {
  medications: Medication[];
  patientName: string;
  defaultOpen?: boolean;
}

// Preset Indian Cities for quick fallback if GPS is blocked in iframe/browser
const PRESET_LOCATIONS = [
  { name: 'Bengaluru (Koramangala/Indiranagar)', lat: 12.9352, lng: 77.6245 },
  { name: 'Mumbai (Bandra/Andheri)', lat: 19.0596, lng: 72.8295 },
  { name: 'Delhi NCR (Connaught Place)', lat: 28.6304, lng: 77.2177 },
  { name: 'Chennai (T. Nagar/Anna Nagar)', lat: 13.0418, lng: 80.2341 },
  { name: 'Hyderabad (Banjara Hills)', lat: 17.4156, lng: 78.4347 },
  { name: 'Kolkata (Park Street)', lat: 22.5516, lng: 88.3524 },
  { name: 'Pune (Shivaji Nagar)', lat: 18.5314, lng: 73.8446 }
];

export const NearbyPharmacySection: React.FC<Props> = ({
  medications,
  patientName,
  defaultOpen = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultOpen);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pharmacies, setPharmacies] = useState<NearbyPharmacy[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'preset' | 'manual' | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPharmacyForMap, setSelectedPharmacyForMap] = useState<NearbyPharmacy | null>(null);
  const [showMapRoute, setShowMapRoute] = useState<boolean>(true);

  // Identify low-stock medications (inventory <= 5 or marked active)
  const lowStockMeds = medications.filter(
    (m) => m.isActive && (m.inventoryCount !== undefined ? m.inventoryCount <= 5 : false)
  );

  // If no explicit low-stock items exist, allow refilling all active medications
  const medsToRefill = lowStockMeds.length > 0 ? lowStockMeds : medications.filter((m) => m.isActive);

  // Request high-accuracy GPS coordinates
  const requestLocation = useCallback(() => {
    setIsLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Using city presets.');
      const defaultLoc = PRESET_LOCATIONS[0];
      setUserCoords({ lat: defaultLoc.lat, lng: defaultLoc.lng });
      setLocationSource('preset');
      loadPharmaciesForCoords(defaultLoc.lat, defaultLoc.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationSource('gps');
        loadPharmaciesForCoords(latitude, longitude);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocationError('Could not obtain live GPS. Showing nearby pharmacies from preset cities below.');
        // Fallback to Bengaluru default
        const defaultLoc = PRESET_LOCATIONS[0];
        setUserCoords({ lat: defaultLoc.lat, lng: defaultLoc.lng });
        setLocationSource('preset');
        loadPharmaciesForCoords(defaultLoc.lat, defaultLoc.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  const loadPharmaciesForCoords = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const list = await fetchNearbyPharmacies(lat, lng, 5000);
      setPharmacies(list);
      if (list.length > 0) {
        setSelectedPharmacyForMap((prev) => (prev ? list.find((p) => p.id === prev.id) || list[0] : list[0]));
      }
    } catch (err) {
      console.error('Failed to load pharmacies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load when expanded for the first time
  useEffect(() => {
    if (isExpanded && pharmacies.length === 0 && !isLoading) {
      requestLocation();
    }
  }, [isExpanded, pharmacies.length, isLoading, requestLocation]);

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setUserCoords({ lat: preset.lat, lng: preset.lng });
    setLocationSource('preset');
    setLocationError(null);
    loadPharmaciesForCoords(preset.lat, preset.lng);
  };

  const handleCopyRefillText = (pharmacyId?: string) => {
    const text = generateRefillMessage(medsToRefill, patientName);
    navigator.clipboard.writeText(text);
    setCopiedId(pharmacyId || 'general');
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div 
      id="section-nearby-pharmacy-refill"
      className="bg-white rounded-3xl border border-emerald-200/90 shadow-sm overflow-hidden transition-all"
    >
      {/* Header Bar: Click to Expand / Collapse */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-white cursor-pointer hover:bg-emerald-50/50 transition-colors flex items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Find Nearby Pharmacy &amp; Quick Refill
              </h3>
              {lowStockMeds.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {lowStockMeds.length} Low Stock
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Locate 24/7 chemists near you to refill prescription tablets and low-stock medicines
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? 'Collapse nearby pharmacies' : 'Expand nearby pharmacies'}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 flex items-center justify-center text-slate-700 shadow-2xs shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-5 sm:p-6 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
          {/* Low Stock Medication Status Callout */}
          {lowStockMeds.length > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Low Stock Medicines Detected ({lowStockMeds.length})
                  </div>
                  <div className="text-xs text-amber-800 font-medium mt-0.5">
                    {lowStockMeds.map((m) => `${m.name} (${m.inventoryCount ?? 'Few'} left)`).join(', ')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyRefillText('banner');
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                {copiedId === 'banner' ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied Refill Text!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Refill List</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All active medications are tracked. You can refill any prescription below.</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopyRefillText('all')}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                {copiedId === 'all' ? '✓ Copied!' : 'Copy Full Prescription'}
              </button>
            </div>
          )}

          {/* Location Bar & Refresh GPS */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs font-bold text-slate-800 truncate">
                {locationSource === 'gps' && userCoords
                  ? `Live GPS: Lat ${userCoords.lat.toFixed(4)}, Lng ${userCoords.lng.toFixed(4)}`
                  : locationSource === 'preset'
                  ? 'Showing pharmacies for selected city area'
                  : 'Locating nearby medical stores...'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-refresh-gps-pharmacies"
                type="button"
                onClick={requestLocation}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Scanning...' : 'Refresh GPS'}</span>
              </button>
            </div>
          </div>

          {/* If location has warning or user wants to switch cities */}
          {locationError && (
            <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200/80">
              {locationError}
            </div>
          )}

          {/* Quick City Presets */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              Or pick location area:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {preset.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Pharmacies List */}
          {isLoading && pharmacies.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Finding nearest pharmacies &amp; 24/7 chemists...</p>
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No pharmacies detected nearby</p>
              <button
                type="button"
                onClick={requestLocation}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
              >
                Retry Location Scan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* INTERACTIVE GOOGLE MAP ROUTE: House Location (Origin) to Destination Pharmacy */}
              {userCoords && selectedPharmacyForMap && showMapRoute && (
                <div 
                  id="google-map-route-container" 
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-3.5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-blue-700">
                            <Home className="w-4 h-4 text-blue-600" /> House (You)
                          </span>
                          <span className="text-emerald-600 font-extrabold">➔</span>
                          <span className="text-emerald-800">{selectedPharmacyForMap.name}</span>
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Live Google Map routing between your house location and destination pharmacy
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black whitespace-nowrap">
                        {selectedPharmacyForMap.distanceFormatted}
                      </span>
                      <a
                        href={getGoogleMapsDirectionsUrl(
                          userCoords.lat,
                          userCoords.lng,
                          selectedPharmacyForMap.lat,
                          selectedPharmacyForMap.lng,
                          selectedPharmacyForMap.name
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all whitespace-nowrap"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Embedded Google Map Route */}
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-300 shadow-inner bg-slate-100">
                    <iframe
                      title={`Google Map Route from House to ${selectedPharmacyForMap.name}`}
                      src={getGoogleMapsEmbedUrl(
                        userCoords.lat,
                        userCoords.lng,
                        selectedPharmacyForMap.lat,
                        selectedPharmacyForMap.lng
                      )}
                      className="w-full h-64 sm:h-72 border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  {/* Visual Route Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 shadow-2xs">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Point A: Your House Location</div>
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {locationSource === 'gps' ? 'Live GPS Location' : 'Selected City House Location'} ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 shadow-2xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Point B: Destination Pharmacy</div>
                        <div className="font-bold text-slate-800 text-xs truncate">{selectedPharmacyForMap.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{selectedPharmacyForMap.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider pt-1">
                <span>{pharmacies.length} Pharmacies Found Near You</span>
                <span>Sorted by distance</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pharmacies.map((pharmacy) => {
                  const isSelected = selectedPharmacyForMap?.id === pharmacy.id;
                  const directionsUrl = userCoords 
                    ? getGoogleMapsDirectionsUrl(
                        userCoords.lat,
                        userCoords.lng,
                        pharmacy.lat,
                        pharmacy.lng,
                        pharmacy.name
                      )
                    : `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`;

                  const whatsappUrl = getWhatsAppPharmacyUrl(
                    pharmacy.phone,
                    medsToRefill,
                    patientName
                  );

                  return (
                    <div
                      key={pharmacy.id}
                      id={`pharmacy-card-${pharmacy.id}`}
                      className={`p-4 rounded-2xl bg-white border transition-all space-y-3 flex flex-col justify-between ${
                        isSelected 
                          ? 'border-emerald-500 ring-2 ring-emerald-400/30 shadow-md' 
                          : 'border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-black text-slate-900 leading-snug">
                            {pharmacy.name}
                          </h4>
                          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black whitespace-nowrap">
                            {pharmacy.distanceFormatted}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {pharmacy.is24Hours ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px]">
                              24/7 Open
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                              {pharmacy.openingHours || 'Open Now'}
                            </span>
                          )}

                          {pharmacy.hasDelivery && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                              Home Delivery
                            </span>
                          )}

                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[11px]">
                              Active on Map Route
                            </span>
                          )}
                        </div>

                        {/* Small, neat address */}
                        <p 
                          className="text-[11px] text-slate-500 font-medium line-clamp-1 leading-snug"
                          title={pharmacy.address}
                        >
                          {pharmacy.address}
                        </p>

                        {/* Exact Phone Number with direct click to call */}
                        {pharmacy.phone && (
                          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pt-0.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <a 
                              href={`tel:${pharmacy.phone.replace(/[^0-9+]/g, '')}`}
                              className="hover:text-emerald-700 hover:underline"
                            >
                              {pharmacy.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Call, Map Route, Directions, WhatsApp Refill */}
                      <div className="pt-2.5 border-t border-slate-100 grid grid-cols-4 gap-1.5">
                        {/* 1. Direct Phone Call */}
                        {pharmacy.phone ? (
                          <a
                            href={`tel:${pharmacy.phone.replace(/[^0-9+]/g, '')}`}
                            className="min-h-[40px] px-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex flex-col items-center justify-center text-center transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                            <span>Call</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="min-h-[40px] px-1 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-[11px] flex flex-col items-center justify-center text-center opacity-60"
                          >
                            <Phone className="w-3.5 h-3.5 mb-0.5" />
                            <span>No Tel</span>
                          </button>
                        )}

                        {/* 2. Show Map Route between House & Pharmacy */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPharmacyForMap(pharmacy);
                            setShowMapRoute(true);
                            const mapEl = document.getElementById('google-map-route-container');
                            if (mapEl) {
                              mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                          }}
                          className={`min-h-[40px] px-1 py-1.5 rounded-xl font-extrabold text-[11px] flex flex-col items-center justify-center text-center transition-colors ${
                            isSelected 
                              ? 'bg-emerald-600 text-white shadow-2xs' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          <Navigation className="w-3.5 h-3.5 mb-0.5" />
                          <span>Map Route</span>
                        </button>

                        {/* 3. Google Maps Navigation */}
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] px-1 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold text-[11px] flex flex-col items-center justify-center text-center transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
                          <span>Google Map</span>
                        </a>

                        {/* 4. WhatsApp Quick Refill */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] px-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex flex-col items-center justify-center text-center transition-all shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-100 mb-0.5" />
                          <span>Refill</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
