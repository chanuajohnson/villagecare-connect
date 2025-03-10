
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// This should be replaced with an environment variable in production
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGFrZXNhdmlsbGFnZSIsImEiOiJjbHk3bGRieWgwaHI0MmxwNmtjYnNzanBiIn0.oYMx2_lYJHDX8H7Nls9DOQ';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export const MapDisplay = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Profile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'professional')
          .not('address', 'is', null);
        
        if (error) {
          console.error('Error fetching professionals:', error);
          toast.error('Failed to load caregivers');
          setLoading(false);
          return;
        }
        
        console.log('Fetched professionals:', data);
        setProfessionals(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Failed to load caregivers');
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Trinidad and Tobago
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-61.2546, 10.6918], // Trinidad and Tobago coordinates
      zoom: 9
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers when map is loaded
    map.current.on('load', () => {
      if (professionals.length > 0) {
        addMarkers();
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when professionals data is loaded
  useEffect(() => {
    if (map.current && map.current.loaded() && professionals.length > 0) {
      addMarkers();
    }
  }, [professionals]);

  const addMarkers = () => {
    if (!map.current) return;

    professionals.forEach(professional => {
      // Skip if no address
      if (!professional.address) return;

      // For demo purposes, we'll generate random coordinates near Trinidad
      // In a real app, you would geocode the address
      const randomOffset = () => (Math.random() - 0.5) * 0.2;
      const lngLat: [number, number] = [-61.2546 + randomOffset(), 10.6918 + randomOffset()];

      // Create a marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
      el.style.cursor = 'pointer';
      
      // Add an icon inside the marker
      const icon = document.createElement('div');
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`;
      el.appendChild(icon);

      // Create a popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 0.5rem;">
            <strong>${professional.full_name || 'Professional Caregiver'}</strong><br/>
            <span>${professional.professional_type || 'Caregiver'}</span><br/>
            <button 
              style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background-color: #0ea5e9; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
              onclick="window.location.href='/professional/profile/${professional.id}'"
            >
              View Profile
            </button>
          </div>
        `);

      // Create the marker and add to map
      new mapboxgl.Marker(el)
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler to the marker
      el.addEventListener('click', () => {
        navigate(`/professional/profile/${professional.id}`);
      });
    });
  };

  return (
    <Card className="w-full h-[400px] md:h-[600px] overflow-hidden p-1 shadow-md">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading caregivers...</span>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md">
            <div className="text-sm font-semibold">Professional Caregivers in Trinidad and Tobago</div>
            <div className="text-xs text-gray-500 mt-1">Click on a marker to view profile</div>
          </div>
        </>
      )}
    </Card>
  );
};
