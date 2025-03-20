
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoryCard } from "./StoryCard";
import { StoryDetailModal } from "./StoryDetailModal";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Story {
  id: string;
  fullName: string;
  birthYear: string;
  personalityTraits: string[];
  careerFields: string[];
  hobbiesInterests: string[];
  lifeStory: string;
  joyfulThings?: string;
  uniqueFacts?: string;
  challenges?: string[];
}

interface StoryListProps {
  className?: string;
}

export function StoryList({ className }: StoryListProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [careerFilter, setCareerFilter] = useState<string>("");
  const [personalityFilter, setPersonalityFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;
  
  // Available filter options (extracted from data)
  const [availableCareers, setAvailableCareers] = useState<string[]>([]);
  const [availablePersonalityTraits, setAvailablePersonalityTraits] = useState<string[]>([]);

  // Fetch stories from Supabase
  useEffect(() => {
    async function fetchStories() {
      setLoading(true);
      
      try {
        // Calculate pagination offset
        const fromIndex = (currentPage - 1) * pageSize;
        const toIndex = fromIndex + pageSize - 1;
        
        // Base query
        let query = supabase
          .from('care_recipient_profiles')
          .select('id, full_name, birth_year, personality_traits, career_fields, hobbies_interests, life_story, joyful_things, unique_facts, challenges')
          .range(fromIndex, toIndex);
        
        // Add filters if set
        if (searchQuery) {
          query = query.textSearch('life_story', searchQuery, {
            type: 'websearch',
            config: 'english'
          });
        }
        
        if (careerFilter) {
          query = query.contains('career_fields', [careerFilter]);
        }
        
        if (personalityFilter) {
          query = query.contains('personality_traits', [personalityFilter]);
        }
        
        // Add sorting
        switch (sortBy) {
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'birthYear':
            query = query.order('birth_year', { ascending: true });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Transform data to match our interface
        const formattedStories = data.map(item => ({
          id: item.id,
          fullName: item.full_name || '',
          birthYear: item.birth_year || '',
          personalityTraits: item.personality_traits || [],
          careerFields: item.career_fields || [],
          hobbiesInterests: item.hobbies_interests || [],
          lifeStory: item.life_story || '',
          joyfulThings: item.joyful_things,
          uniqueFacts: item.unique_facts,
          challenges: item.challenges
        }));
        
        setStories(formattedStories);
        
        // Calculate total pages if count is available
        if (count !== null) {
          setTotalPages(Math.ceil(count / pageSize));
        }
        
        // Fetch filter options if it's the first page
        if (currentPage === 1 && !availableCareers.length) {
          fetchFilterOptions();
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        setError('Failed to load stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStories();
  }, [currentPage, searchQuery, careerFilter, personalityFilter, sortBy]);
  
  // Fetch unique values for filter options
  async function fetchFilterOptions() {
    try {
      // Fetch unique career fields
      const { data: careerData } = await supabase
        .from('care_recipient_profiles')
        .select('career_fields');
      
      // Fetch unique personality traits
      const { data: personalityData } = await supabase
        .from('care_recipient_profiles')
        .select('personality_traits');
      
      // Extract unique values
      const careers = new Set<string>();
      const traits = new Set<string>();
      
      careerData?.forEach(item => {
        if (item.career_fields) {
          item.career_fields.forEach((career: string) => careers.add(career));
        }
      });
      
      personalityData?.forEach(item => {
        if (item.personality_traits) {
          item.personality_traits.forEach((trait: string) => traits.add(trait));
        }
      });
      
      setAvailableCareers(Array.from(careers).sort());
      setAvailablePersonalityTraits(Array.from(traits).sort());
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }
  
  // Handle opening story detail modal
  const handleReadMore = (id: string) => {
    const story = stories.find(s => s.id === id);
    if (story) {
      setSelectedStory(story);
      setIsModalOpen(true);
    }
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
  };
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, careerFilter, personalityFilter, sortBy]);

  return (
    <div className={className}>
      {/* Filters and sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select value={careerFilter} onValueChange={setCareerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by career" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All careers</SelectItem>
              {availableCareers.map((career) => (
                <SelectItem key={career} value={career}>
                  {career}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={personalityFilter} onValueChange={setPersonalityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by personality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All personalities</SelectItem>
              {availablePersonalityTraits.map((trait) => (
                <SelectItem key={trait} value={trait}>
                  {trait}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="birthYear">Birth year (oldest first)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading stories...</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && stories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No stories found. Try adjusting your filters.</p>
        </div>
      )}
      
      {/* Stories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            id={story.id}
            fullName={story.fullName}
            birthYear={story.birthYear}
            personalityTraits={story.personalityTraits}
            careerFields={story.careerFields}
            hobbiesInterests={story.hobbiesInterests}
            lifeStory={story.lifeStory}
            onReadMoreClick={handleReadMore}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {/* Show first page */}
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
            )}
            
            {/* Ellipsis for skipped pages */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationLink disabled>...</PaginationLink>
              </PaginationItem>
            )}
            
            {/* Previous page */}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {/* Current page */}
            <PaginationItem>
              <PaginationLink isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            
            {/* Next page */}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {/* Ellipsis for skipped pages */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationLink disabled>...</PaginationLink>
              </PaginationItem>
            )}
            
            {/* Last page */}
            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Story detail modal */}
      <StoryDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        story={selectedStory}
      />
    </div>
  );
}
