
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Set your Mapbox token - in a real app this would be in .env
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2xiejRia3R5MDI5eDN1bnduZWRzcXhpbiJ9.d3yOsXs3Z18lL8pCcLhvvQ';

interface Professional {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  location?: {
    id: string;
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
  };
}

interface MapDisplayProps {
  className?: string;
}

const MapDisplay = ({ className }: MapDisplayProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const navigate = useNavigate();

  // Fetch professional profiles with their locations
  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      
      // First, get all professional profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('role', 'professional');
        
      if (profilesError) {
        console.error('Error fetching professionals:', profilesError);
        toast.error('Failed to load professional caregivers');
        return;
      }
      
      // Then, get all professional locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('professional_locations')
        .select('*');
        
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        toast.error('Failed to load caregiver locations');
        return;
      }
      
      // Combine the data
      const professionalsWithLocations = profilesData.map(profile => {
        const location = locationsData.find(loc => loc.user_id === profile.id);
        return {
          ...profile,
          location: location || undefined
        };
      }).filter(p => p.location); // Only keep professionals with location data
      
      setProfessionals(professionalsWithLocations);
    } catch (err) {
      console.error('Error in fetchProfessionals:', err);
      toast.error('Failed to load professional caregivers');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfessionals();
  }, []);
  
  // Initialize map once data is loaded
  useEffect(() => {
    if (loading || !mapContainer.current) return;
    
    if (map.current) return; // Initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-61.2225, 10.6918], // Trinidad and Tobago coordinates
      zoom: 9
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add markers when map loads
    map.current.on('load', () => {
      addMarkers();
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loading]);
  
  const addMarkers = () => {
    if (!map.current) return;
    
    professionals.forEach(professional => {
      if (!professional.location) return;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'caregiver-marker';
      el.innerHTML = `<div class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      </div>`;
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${professional.full_name}</h3>
            <p class="text-sm">${professional.location.city || 'Trinidad and Tobago'}</p>
            <button 
              class="mt-2 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 view-profile-btn" 
              data-id="${professional.id}"
            >
              View Profile
            </button>
          </div>
        `);
      
      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([professional.location.longitude, professional.location.latitude])
        .setPopup(popup)
        .addTo(map.current);
        
      // Add click event for view profile button
      popup.on('open', () => {
        setTimeout(() => {
          const button = document.querySelector(`.view-profile-btn[data-id="${professional.id}"]`);
          if (button) {
            button.addEventListener('click', () => {
              navigate(`/professional/profile/${professional.id}`);
            });
          }
        }, 0);
      });
    });
  };
  
  const viewAllProfessionals = () => {
    toast.info('This feature is coming soon!');
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div 
              ref={mapContainer} 
              className="h-[400px] w-full"
            />
            <div className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Professional Caregivers Near You</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={viewAllProfessionals}
                >
                  View All
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {professionals.length} caregivers available in Trinidad and Tobago
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MapDisplay;
