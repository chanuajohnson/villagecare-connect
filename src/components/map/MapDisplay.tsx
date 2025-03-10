
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1haS10YWF2IiwiYSI6ImNscXh2dDl5NzVja24yaW1wczIwNncyc24ifQ.p9TbO5mMEJZCtKLYmROkBg';

interface Professional {
  id: string;
  full_name: string;
  professional_type?: string;
  avatar_url?: string;
  latitude: number;
  longitude: number;
  location_id: string;
  years_of_experience?: string;
  care_services?: string[];
}

const MapDisplay = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const navigate = useNavigate();

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professional_locations')
        .select(`
          id as location_id,
          latitude,
          longitude,
          user_id,
          profiles:user_id (
            id,
            full_name,
            professional_type,
            avatar_url,
            years_of_experience,
            care_services
          )
        `)
        .eq('country', 'Trinidad and Tobago');

      if (error) {
        console.error('Error fetching professionals:', error);
        toast.error('Failed to load professional caregivers');
        return;
      }

      const formattedData = data.map(item => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name || 'Professional Caregiver',
        professional_type: item.profiles.professional_type,
        avatar_url: item.profiles.avatar_url,
        latitude: item.latitude,
        longitude: item.longitude,
        location_id: item.location_id,
        years_of_experience: item.profiles.years_of_experience,
        care_services: item.profiles.care_services
      }));

      setProfessionals(formattedData);
      console.log('Loaded professionals:', formattedData.length);
    } catch (err) {
      console.error('Error in fetchProfessionals:', err);
      toast.error('Failed to load professional caregivers');
    } finally {
      setLoading(false);
    }
  };

  const addMarkers = () => {
    if (!map.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    professionals.forEach(prof => {
      // Skip if no valid coordinates
      if (!prof.latitude || !prof.longitude) return;

      // Create a custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${prof.full_name}</h3>
          <p class="text-sm text-gray-600">${prof.professional_type || 'Caregiver'}</p>
          ${prof.years_of_experience ? `<p class="text-xs mt-1">Experience: ${prof.years_of_experience}</p>` : ''}
          <button class="view-profile-btn mt-2 px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary-600" data-id="${prof.id}">
            View Profile
          </button>
        </div>
      `);

      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([prof.longitude, prof.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);

      // Add click event to the "View Profile" button in the popup
      popup.on('open', () => {
        const btn = document.querySelector(`.view-profile-btn[data-id="${prof.id}"]`);
        if (btn) {
          btn.addEventListener('click', () => {
            navigate(`/professional/profile/${prof.id}`);
          });
        }
      });
    });
  };

  const initializeMap = () => {
    if (mapInitialized) return;
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-61.2225, 10.6918], // Trinidad and Tobago coordinates
        zoom: 9
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapInitialized(true);
        addMarkers();
      });
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    initializeMap();
  }, [mapContainer.current]);

  useEffect(() => {
    if (mapInitialized && !loading) {
      addMarkers();
    }
  }, [professionals, mapInitialized, loading]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Find Professional Caregivers</h2>
        <p className="text-gray-600 text-sm mt-1">
          Browse professional caregivers across Trinidad and Tobago
        </p>
      </div>
      <div className="p-2 border-b bg-gray-50 flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-white">
          {loading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <span>{professionals.length} professionals found</span>
          )}
        </Badge>
        <Badge variant="outline" className="bg-white">
          Trinidad and Tobago
        </Badge>
      </div>
      <div ref={mapContainer} className="h-[500px] w-full" />
      <div className="p-4 bg-gray-50 border-t">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => window.open('https://www.mapbox.com/about/maps/', '_blank')}
          className="text-xs"
        >
          © Mapbox © OpenStreetMap
        </Button>
      </div>
    </div>
  );
};

export default MapDisplay;
