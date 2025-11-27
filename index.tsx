import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Filter, Heart, MapPin, Star, ChevronLeft, Coffee, Wifi, Zap, Users, Plus, Home, User, List, Map as MapIcon, Clock, CheckCircle, Navigation, X } from 'lucide-react';

// --- Types ---

type Crowdedness = 'Quiet' | 'Moderate' | 'Busy';

interface StudyPlace {
  id: string;
  name: string;
  image: string; 
  rating: number;
  distance: string;
  crowdedness: Crowdedness;
  amenities: string[];
  description: string;
  reviews: number;
  coordinates: { x: number, y: number }; // For Map View simulation
}

// --- Mock Data (High Fidelity Content) ---

const INITIAL_PLACES: StudyPlace[] = [
  {
    id: '1',
    name: 'Thode Library 1st Floor',
    image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    distance: '0.2 km',
    crowdedness: 'Busy',
    amenities: ['Wifi', 'Power', 'Tables'],
    description: 'A popular spot for engineering students known for its collaborative atmosphere. Can get loud during the day, but great for group projects.',
    reviews: 128,
    coordinates: { x: 40, y: 30 }
  },
  {
    id: '2',
    name: 'Mills Library Quiet Zone',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    distance: '0.5 km',
    crowdedness: 'Quiet',
    amenities: ['Wifi', 'Silence'],
    description: 'Strictly quiet study area located on the 6th floor. Perfect for focused reading and thesis writing. No food allowed.',
    reviews: 85,
    coordinates: { x: 70, y: 60 }
  },
  {
    id: '3',
    name: 'Student Center Atrium',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    rating: 3.9,
    distance: '0.1 km',
    crowdedness: 'Moderate',
    amenities: ['Food', 'Wifi', 'Groups'],
    description: 'Open space with lots of natural light and proximity to coffee shops. Good for casual studying or group work, though power outlets are scarce.',
    reviews: 210,
    coordinates: { x: 20, y: 80 }
  },
  {
    id: '4',
    name: 'MDCL Lounge',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    rating: 4.2,
    distance: '0.8 km',
    crowdedness: 'Quiet',
    amenities: ['Power', 'Comfy Chairs'],
    description: 'Hidden gem near the hospital. Usually plenty of seats and very comfortable armchairs. Great for napping... or studying.',
    reviews: 45,
    coordinates: { x: 80, y: 20 }
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status: Crowdedness }) => {
  let colorClass = '';
  let dotColor = '';
  
  if (status === 'Quiet') {
    colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  }
  if (status === 'Moderate') {
    colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  }
  if (status === 'Busy') {
    colorClass = 'bg-rose-100 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${colorClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}></div>
      {status.toUpperCase()}
    </span>
  );
};

// --- Main App Component ---

const App = () => {
  // -- State --
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'review' | 'saved'>('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<StudyPlace[]>(INITIAL_PLACES);
  
  // User Data State
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1'])); 
  const [visitedHistory, setVisitedHistory] = useState<Set<string>>(new Set(['3'])); 
  
  // UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [savedTab, setSavedTab] = useState<'favorites' | 'history'>('favorites');
  
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuiet, setFilterQuiet] = useState(false);
  const [filterPower, setFilterPower] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // -- Actions --

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) {
      newFavs.delete(id);
      showToast("Removed from Favorites");
    } else {
      newFavs.add(id);
      showToast("Added to Favorites");
    }
    setFavorites(newFavs);
  };

  const toggleVisited = (id: string) => {
    const newHistory = new Set(visitedHistory);
    if (newHistory.has(id)) {
        showToast("Already in History");
    } else {
        newHistory.add(id);
        setVisitedHistory(newHistory);
        showToast("Checked In! Added to History.");
    }
  }

  const handlePlaceClick = (id: string) => {
    setSelectedPlaceId(id);
    setCurrentScreen('detail');
  };

  const handleSubmitReview = (rating: number, text: string, status: Crowdedness) => {
    if (selectedPlaceId) {
      // 1. Update Place Data (Simulated Backend)
      setPlaces(prev => prev.map(p => {
        if (p.id === selectedPlaceId) {
          return { ...p, reviews: p.reviews + 1, crowdedness: status };
        }
        return p;
      }));
      
      // 2. Update User History (Review implies visit)
      const newHistory = new Set(visitedHistory);
      newHistory.add(selectedPlaceId);
      setVisitedHistory(newHistory);

      showToast("Review Submitted! +10 Points");
      setCurrentScreen('detail');
    }
  };

  // -- Filtering Logic (Updated to include Search) --
  const filteredPlaces = places.filter(p => {
    // Search Query Match
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
    }
    // Filter Chips
    if (filterQuiet && p.crowdedness === 'Busy') return false;
    if (filterPower && !p.amenities.includes('Power')) return false;
    return true;
  });

  // --- Render Helpers ---

  const renderHeader = () => (
    <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100 flex-shrink-0">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                <MapPin className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">StudySpot</h1>
        </div>
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
          <User size={16} className="text-slate-600"/>
        </div>
      </div>
      
      {/* Search & Controls */}
      <div className="px-4 pb-4 pt-2 flex gap-3">
        <div className="flex-1 bg-slate-100 rounded-xl flex items-center px-3 h-11 border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all relative group">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places..." 
            className="bg-transparent w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 p-1 text-slate-400 hover:text-slate-600">
                  <X size={14} />
              </button>
          )}
        </div>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-colors relative ${filterQuiet || filterPower ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-600 bg-white'}`}
        >
          <Filter size={20} />
          {(filterQuiet || filterPower) && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border border-white ring-1 ring-white"></div>}
        </button>
        <button 
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 bg-white active:bg-slate-50 transition-colors"
        >
          {viewMode === 'list' ? <MapIcon size={20} /> : <List size={20} />}
        </button>
      </div>
    </div>
  );

  const renderPlaceCard = (place: StudyPlace) => (
    <div 
      key={place.id} 
      onClick={() => handlePlaceClick(place.id)}
      className="bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden group flex-shrink-0"
    >
      {/* Image Section */}
      <div className="h-36 w-full relative">
        <img 
          src={place.image} 
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80"></div>
        
        <button 
          onClick={(e) => toggleFavorite(e, place.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm active:scale-90 transition-transform z-10"
        >
          <Heart 
            size={16} 
            className={favorites.has(place.id) ? "fill-rose-500 text-rose-500" : "text-slate-400"} 
          />
        </button>
        
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
           <StatusBadge status={place.crowdedness} />
           <div className="flex items-center gap-1 text-white text-xs font-bold bg-black/30 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
             <Navigation size={10} className="fill-white"/>
             {place.distance}
           </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-800 text-base leading-tight">{place.name}</h3>
          <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
            <Star size={10} className="fill-current mr-1"/>
            {place.rating}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {place.amenities.map(amenity => (
            <span key={amenity} className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMapView = () => (
    <div className="relative flex-1 bg-slate-100 overflow-hidden">
        {/* Simulated Map Background Grid */}
        <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.5
        }}></div>
        
        {/* Simulated Streets */}
        <div className="absolute top-1/3 left-0 right-0 h-4 bg-white border-y border-slate-300 transform -rotate-6"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-6 bg-white border-x border-slate-300"></div>
        
        {/* Map Pins */}
        {filteredPlaces.map(place => (
             <button
                key={place.id}
                onClick={() => handlePlaceClick(place.id)}
                className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center group z-10 hover:z-20 transition-all duration-200 hover:scale-110"
                style={{ top: `${place.coordinates?.y}%`, left: `${place.coordinates?.x}%` }}
             >
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-bold mb-1 text-slate-800 border border-slate-100 whitespace-nowrap">
                    {place.name}
                    <div className="text-[9px] text-slate-500 font-normal">{place.rating} ★</div>
                </div>
                <MapPin size={36} className={`${favorites.has(place.id) ? 'text-rose-500 fill-rose-500' : 'text-indigo-600 fill-indigo-600'} drop-shadow-xl`} />
                <div className="w-2 h-1 bg-black/20 rounded-full blur-[1px] mt-[-2px]"></div>
             </button>
        ))}
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-xs font-medium text-slate-600 border border-slate-200 flex items-center gap-2">
                <MapIcon size={12}/> Map View
            </div>
        </div>
    </div>
  );

  const renderFilterModal = () => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center backdrop-blur-sm transition-opacity animate-in fade-in duration-200" onClick={() => setIsFilterOpen(false)}>
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">Filters</h2>
          <button onClick={() => setIsFilterOpen(false)} className="text-slate-500 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Atmosphere</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setFilterQuiet(!filterQuiet)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${filterQuiet ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
            >
              Quiet Only 🤫
            </button>
            <button 
              onClick={() => setFilterPower(!filterPower)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${filterPower ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
            >
              Has Power ⚡
            </button>
          </div>
        </div>

        <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sort By</h3>
            <div className="bg-slate-100 p-1 rounded-xl flex">
                <button className="flex-1 py-2 rounded-lg bg-white shadow-sm text-xs font-bold text-slate-800 border border-slate-200">Distance</button>
                <button className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700">Rating</button>
                <button className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700">Crowd</button>
            </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => {setFilterQuiet(false); setFilterPower(false);}}
            className="flex-1 bg-slate-50 text-slate-600 py-3.5 rounded-xl font-bold active:scale-95 transition-transform border border-slate-200"
          >
            Reset
          </button>
          <button 
            onClick={() => setIsFilterOpen(false)}
            className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
          >
            Show {filteredPlaces.length} Places
          </button>
        </div>
      </div>
    </div>
  );

  const renderSavedScreen = () => {
    const displayIds = savedTab === 'favorites' ? favorites : visitedHistory;
    const items = places.filter(p => displayIds.has(p.id));

    return (
        <div className="flex flex-col flex-1 bg-slate-50 overflow-hidden">
             <div className="p-4 bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm flex-shrink-0">
                 <h1 className="text-xl font-bold text-slate-900 mb-4">My Library</h1>
                 <div className="flex p-1 bg-slate-100 rounded-xl">
                     <button 
                        onClick={() => setSavedTab('favorites')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${savedTab === 'favorites' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        Favorites
                     </button>
                     <button 
                        onClick={() => setSavedTab('history')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${savedTab === 'history' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        Visited History
                     </button>
                 </div>
             </div>
             <div className="flex-1 p-4 overflow-y-auto">
                 {items.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full pb-20 text-slate-400 animate-in fade-in duration-500">
                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            {savedTab === 'favorites' ? <Heart size={24} /> : <Clock size={24} />}
                         </div>
                         <p className="font-medium">No {savedTab === 'favorites' ? 'favorites' : 'history'} yet.</p>
                         <p className="text-xs mt-2 text-slate-400">Go explore some places!</p>
                     </div>
                 ) : (
                     <div className="animate-in slide-in-from-bottom-4 duration-300">
                        {items.map(renderPlaceCard)}
                     </div>
                 )}
             </div>
        </div>
    )
  };

  const renderReviewScreen = () => {
    const [tempRating, setTempRating] = useState(0);
    const [tempStatus, setTempStatus] = useState<Crowdedness | null>(null);

    return (
      <div className="bg-white h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b flex items-center bg-white sticky top-0 z-10 flex-shrink-0">
          <button onClick={() => setCurrentScreen('detail')} className="p-2 -ml-2 mr-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="text-slate-900" />
          </button>
          <h1 className="font-bold text-lg">Write Review</h1>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8 text-center">
            <label className="block text-sm font-bold text-slate-700 mb-3">Rate your experience</label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(num => (
                <button key={num} onClick={() => setTempRating(num)} className="active:scale-110 transition-transform">
                  <Star 
                    size={36} 
                    className={`${num <= tempRating ? "text-amber-400 fill-amber-400" : "text-slate-200"} transition-colors duration-300`} 
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {/* Live Crowdedness Input - addressing the "Additional Feature" requirement */}
            <label className="block text-sm font-bold text-slate-900 mb-1">How busy is it right now?</label>
            <p className="text-xs text-slate-500 mb-4">Help others save time by updating the live status!</p>
            <div className="grid grid-cols-3 gap-3">
              {['Quiet', 'Moderate', 'Busy'].map((status) => (
                <button
                  key={status}
                  onClick={() => setTempStatus(status as Crowdedness)}
                  className={`py-3 border rounded-xl text-xs font-bold transition-all ${tempStatus === status ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm font-bold text-slate-700 mb-2">Comments (Optional)</label>
          <textarea 
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 h-32 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
            placeholder="Share details about noise, outlets, or atmosphere..."
          ></textarea>
        </div>

        <div className="p-6 border-t bg-white safe-area-bottom flex-shrink-0">
          <button 
            disabled={tempRating === 0 || !tempStatus}
            onClick={() => handleSubmitReview(tempRating, "Great!", tempStatus!)}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-98"
          >
            Submit Review
          </button>
        </div>
      </div>
    );
  };

  const renderDetailScreen = () => {
    const place = places.find(p => p.id === selectedPlaceId);
    if (!place) return null;

    return (
      <div className="bg-white h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto">
            <div className="relative h-72 w-full">
            <img src={place.image} className="w-full h-full object-cover" alt={place.name} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
            <button onClick={() => setCurrentScreen('home')} className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full z-10 hover:bg-white/30 transition-colors">
                <ChevronLeft size={24} />
            </button>
            </div>

            <div className="px-6 py-6 -mt-10 rounded-t-3xl bg-white relative z-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-start mb-3">
                <h1 className="text-2xl font-bold text-slate-900 w-3/4 leading-tight">{place.name}</h1>
                <div className="flex gap-3">
                    {/* Explicit Check-In Button for Visited History requirement - PILL SHAPE */}
                    <button 
                        onClick={() => toggleVisited(place.id)}
                        className={`px-4 py-2 rounded-full transition-all border flex items-center gap-2 shadow-sm active:scale-95 ${visitedHistory.has(place.id) ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'}`}
                    >
                        <CheckCircle size={18} className={visitedHistory.has(place.id) ? 'fill-emerald-600 text-white' : ''}/>
                        <span className="text-sm font-bold">{visitedHistory.has(place.id) ? 'Visited' : 'Check In'}</span>
                    </button>
                    
                    <button onClick={(e) => toggleFavorite(e, place.id)} className="p-3 bg-white rounded-full hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm active:scale-95">
                        <Heart size={20} className={favorites.has(place.id) ? "fill-rose-500 text-rose-500" : "text-slate-400"} />
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-3 mb-8">
                <StatusBadge status={place.crowdedness} />
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span className="text-slate-600 text-sm flex items-center font-medium">
                <Star size={16} className="fill-amber-400 text-amber-400 mr-1.5"/> 
                {place.rating} 
                <span className="text-slate-400 font-normal ml-1">({place.reviews} reviews)</span>
                </span>
            </div>

            <div className="flex gap-3 overflow-x-auto mb-8 pb-2 -mx-6 px-6 scrollbar-hide">
                <div className="bg-slate-50 px-4 py-3 rounded-2xl flex flex-col items-center min-w-[80px] border border-slate-100">
                <Wifi size={20} className="text-indigo-600 mb-2"/>
                <span className="text-[10px] font-bold text-slate-700">Free Wifi</span>
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-2xl flex flex-col items-center min-w-[80px] border border-slate-100">
                <Zap size={20} className="text-indigo-600 mb-2"/>
                <span className="text-[10px] font-bold text-slate-700">Power</span>
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-2xl flex flex-col items-center min-w-[80px] border border-slate-100">
                <Coffee size={20} className="text-indigo-600 mb-2"/>
                <span className="text-[10px] font-bold text-slate-700">Cafe</span>
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-2xl flex flex-col items-center min-w-[80px] border border-slate-100">
                <Users size={20} className="text-indigo-600 mb-2"/>
                <span className="text-[10px] font-bold text-slate-700">Groups</span>
                </div>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mb-3">About</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
                {place.description}
            </p>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-900">Recent Reviews</h3>
                <button className="text-indigo-600 text-sm font-bold">View All</button>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
                <div className="flex justify-between mb-2 items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-700 border border-indigo-50">SM</div>
                    <span className="font-bold text-sm text-slate-800">Sarah M.</span>
                </div>
                <span className="text-xs text-slate-400">2 hrs ago</span>
                </div>
                <div className="flex text-amber-400 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-current"/>)}
                </div>
                <p className="text-sm text-slate-600 leading-snug">"Usually quiet, but pretty busy right now because of midterms. Hard to find a plug."</p>
            </div>
            </div>
        </div>

        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex-shrink-0">
          <button 
            onClick={() => setCurrentScreen('review')}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Plus size={20} strokeWidth={3} />
            Write a Review
          </button>
        </div>
      </div>
    );
  };

  // --- Navigation Logic ---

  const renderContent = () => {
      if (currentScreen === 'saved') return renderSavedScreen();
      if (currentScreen === 'home') {
          return viewMode === 'list' 
            ? <div className="flex-1 p-5 overflow-y-auto">
                <div className="flex justify-between items-end mb-5">
                    <h2 className="font-bold text-2xl text-slate-900">Nearby Spots</h2>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-full border shadow-sm">{filteredPlaces.length} RESULTS</span>
                </div>
                {filteredPlaces.length === 0 ? (
                    <div className="text-center py-20 px-10 text-slate-400 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search size={24} className="text-slate-300"/>
                        </div>
                        <p className="font-medium">No places found matching your criteria.</p>
                        {searchQuery && <p className="text-sm mt-1">Try checking your spelling or using different keywords.</p>}
                        <button onClick={() => {setFilterQuiet(false); setFilterPower(false); setSearchQuery("")}} className="text-indigo-600 text-sm font-bold mt-4 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">Clear All Filters</button>
                    </div>
                ) : (
                    filteredPlaces.map(renderPlaceCard)
                )}
              </div>
            : renderMapView();
      }
      return null;
  };

  if (currentScreen === 'detail') return renderDetailScreen();
  if (currentScreen === 'review') return renderReviewScreen();

  return (
    <div className="bg-slate-50 h-screen overflow-hidden flex flex-col font-sans max-w-md mx-auto border-x border-slate-200 shadow-2xl relative">
      
      {currentScreen === 'home' && renderHeader()}

      {renderContent()}

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-100 flex justify-around py-2 pb-4 sticky bottom-0 z-20 flex-shrink-0">
        <button 
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors w-16 ${currentScreen === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home size={24} strokeWidth={currentScreen === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('saved')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors w-16 ${currentScreen === 'saved' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Heart size={24} strokeWidth={currentScreen === 'saved' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">Saved</span>
        </button>
        <button 
          className="flex flex-col items-center p-2 rounded-xl transition-colors w-16 text-slate-400 hover:text-slate-600"
        >
          <User size={24} strokeWidth={2} />
          <span className="text-[10px] font-bold mt-1">Profile</span>
        </button>
      </div>

      {isFilterOpen && renderFilterModal()}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-5 py-3 rounded-full shadow-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-8 z-50 whitespace-nowrap">
          <CheckCircle size={16} className="text-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}