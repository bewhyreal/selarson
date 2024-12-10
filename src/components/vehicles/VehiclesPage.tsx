import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useVehicles } from '../../contexts/VehicleContext';
import { useLocations } from '../../hooks/useLocations';
import { VehicleCard } from './VehicleCard';
import type { Database } from '../../types/supabase';

type Vehicle = Database['public']['Tables']['cars']['Row'];

export function VehiclesPage() {
  const { language } = useLanguage();
  const { vehicles, loading, error } = useVehicles();
  const { locations } = useLocations();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const locationParam = searchParams.get('location');
    return locationParam ? [locationParam] : [];
  });

  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam && !selectedLocations.includes(locationParam)) {
      setSelectedLocations([locationParam]);
    }
  }, [searchParams]);

  const categories = Array.from(
    new Set(vehicles.map((vehicle) => vehicle.description || 'Uncategorized'))
  ).filter(Boolean);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = `${vehicle.brand} ${vehicle.model}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || vehicle.description === selectedCategory;
    const matchesLocation = selectedLocations.length === 0 || 
      selectedLocations.some(loc => vehicle.locations?.includes(loc));
    return matchesSearch && matchesCategory && matchesLocation && vehicle.available && vehicle.active;
  });

  const handleVehicleSelect = (vehicle: Vehicle) => {
    console.log('Selected vehicle:', vehicle);
  };

  const handleLocationChange = (locationName: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationName)
        ? prev.filter(loc => loc !== locationName)
        : [...prev, locationName]
    );
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (selectedLocations.length === 0) {
      newParams.delete('location');
    } else {
      newParams.set('location', locationName);
    }
    setSearchParams(newParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4">
        <div className="container mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type=" text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === 'tr' ? 'Araç ara...' : 'Search vehicles...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="">
                      {language === 'tr' ? 'Tüm Kategoriler' : 'All Categories'}
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-1" />
                {language === 'tr' ? 'Konumlar' : 'Locations'}
              </label>
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationChange(location.name)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedLocations.includes(location.name)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {location.name}
                  </button>
                ))}
                {selectedLocations.length > 0 && (
                  <button
                    onClick={() => setSelectedLocations([])}
                    className="px-3 py-1 rounded-full text-sm text-red-600 hover:bg-red-50"
                  >
                    {language === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {language === 'tr'
                ? 'Araç bulunamadı.'
                : 'No vehicles found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSelect={handleVehicleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}