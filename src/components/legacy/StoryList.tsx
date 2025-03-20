
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { StoryCard } from "./StoryCard";
import { StoryDetailModal } from "./StoryDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Filter, SortDesc, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define the Story type based on the care_recipient_profiles table
interface Story {
  id: string;
  full_name: string;
  birth_year: string;
  personality_traits: string[];
  career_fields: string[];
  hobbies_interests: string[];
  life_story: string;
  created_at: string;
}

// Define the filter state interface
interface FilterState {
  career: string;
  personality: string;
  searchTerm: string;
}

export const StoryList = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const storiesPerPage = 12;
  
  // Selected story for detail modal
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    career: "",
    personality: "",
    searchTerm: "",
  });
  const [sortBy, setSortBy] = useState<"recent" | "birth_year">("recent");
  
  // Unique lists for filter dropdowns
  const [uniqueCareers, setUniqueCareers] = useState<string[]>([]);
  const [uniquePersonalityTraits, setUniquePersonalityTraits] = useState<string[]>([]);
  
  // Show filter panel state
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch stories from Supabase
  const fetchStories = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("care_recipient_profiles")
        .select("*")
        .not("life_story", "is", null)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setStories(data || []);
      // Apply initial filtering and sorting
      applyFiltersAndSort(data || [], filters, sortBy);
      
      // Extract unique values for filters
      if (data) {
        extractUniqueFilterValues(data);
      }
      
    } catch (err: any) {
      console.error("Error fetching stories:", err);
      setError(err.message);
      toast({
        title: "Error fetching stories",
        description: "There was an error loading the legacy stories. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Extract unique values for filter dropdowns
  const extractUniqueFilterValues = (data: Story[]) => {
    const careers = new Set<string>();
    const traits = new Set<string>();
    
    data.forEach(story => {
      if (story.career_fields && Array.isArray(story.career_fields)) {
        story.career_fields.forEach(career => careers.add(career));
      }
      
      if (story.personality_traits && Array.isArray(story.personality_traits)) {
        story.personality_traits.forEach(trait => traits.add(trait));
      }
    });
    
    setUniqueCareers(Array.from(careers).sort());
    setUniquePersonalityTraits(Array.from(traits).sort());
  };
  
  // Apply filters and sorting to stories
  const applyFiltersAndSort = (allStories: Story[], filterState: FilterState, sortOption: string) => {
    let result = [...allStories];
    
    // Apply filters
    if (filterState.career) {
      result = result.filter(story => 
        story.career_fields && 
        Array.isArray(story.career_fields) && 
        story.career_fields.includes(filterState.career)
      );
    }
    
    if (filterState.personality) {
      result = result.filter(story => 
        story.personality_traits && 
        Array.isArray(story.personality_traits) && 
        story.personality_traits.includes(filterState.personality)
      );
    }
    
    if (filterState.searchTerm) {
      const searchLower = filterState.searchTerm.toLowerCase();
      result = result.filter(story => 
        (story.life_story && story.life_story.toLowerCase().includes(searchLower)) ||
        (story.full_name && story.full_name.toLowerCase().includes(searchLower)) ||
        (story.career_fields && story.career_fields.some(c => c.toLowerCase().includes(searchLower))) ||
        (story.hobbies_interests && story.hobbies_interests.some(h => h.toLowerCase().includes(searchLower)))
      );
    }
    
    // Apply sorting
    if (sortOption === "birth_year") {
      result.sort((a, b) => {
        const yearA = a.birth_year ? parseInt(a.birth_year) : 0;
        const yearB = b.birth_year ? parseInt(b.birth_year) : 0;
        return yearA - yearB;
      });
    } else {
      // "recent" is the default sort, which is by created_at date
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }
    
    setFilteredStories(result);
    setTotalPages(Math.max(1, Math.ceil(result.length / storiesPerPage)));
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  
  // Handle filter changes
  const handleFilterChange = (type: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    applyFiltersAndSort(stories, newFilters, sortBy);
  };
  
  // Handle sort changes
  const handleSortChange = (value: "recent" | "birth_year") => {
    setSortBy(value);
    applyFiltersAndSort(stories, filters, value);
  };
  
  // Reset filters
  const resetFilters = () => {
    const resetFilters = { career: "", personality: "", searchTerm: "" };
    setFilters(resetFilters);
    setSortBy("recent");
    applyFiltersAndSort(stories, resetFilters, "recent");
    setShowFilters(false);
  };
  
  // Handle story selection for detail modal
  const openStoryDetail = (story: Story) => {
    setSelectedStory(story);
    setModalOpen(true);
  };
  
  // Calculate current page stories
  const getCurrentPageStories = () => {
    const startIndex = (currentPage - 1) * storiesPerPage;
    const endIndex = startIndex + storiesPerPage;
    return filteredStories.slice(startIndex, endIndex);
  };
  
  // Pagination controls
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Load stories on component mount
  useEffect(() => {
    fetchStories();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search stories..."
            className="pl-9"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <Select 
            value={sortBy} 
            onValueChange={(value) => handleSortChange(value as "recent" | "birth_year")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="birth_year">Birth Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Career Field
                </label>
                <Select 
                  value={filters.career} 
                  onValueChange={(value) => handleFilterChange("career", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All careers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All careers</SelectItem>
                    {uniqueCareers.map(career => (
                      <SelectItem key={career} value={career}>{career}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personality Trait
                </label>
                <Select 
                  value={filters.personality} 
                  onValueChange={(value) => handleFilterChange("personality", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All traits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All traits</SelectItem>
                    {uniquePersonalityTraits.map(trait => (
                      <SelectItem key={trait} value={trait}>{trait}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Results count */}
      <div className="text-sm text-gray-500">
        {loading ? (
          "Loading stories..."
        ) : (
          `Showing ${filteredStories.length} ${filteredStories.length === 1 ? 'story' : 'stories'}`
        )}
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-600">Loading stories...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={fetchStories} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No stories found matching your criteria.</p>
          <Button 
            onClick={resetFilters} 
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Story grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getCurrentPageStories().map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onReadMore={() => openStoryDetail(story)}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first page, last page, current page, and pages adjacent to current
                  let pageToShow: number | null = null;
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageToShow = i + 1;
                  } else if (currentPage <= 3) {
                    // Near start: show pages 1-4 and last page
                    if (i < 4) {
                      pageToShow = i + 1;
                    } else {
                      pageToShow = totalPages;
                    }
                  } else if (currentPage >= totalPages - 2) {
                    // Near end: show first page and last 4 pages
                    if (i === 0) {
                      pageToShow = 1;
                    } else {
                      pageToShow = totalPages - (4 - i);
                    }
                  } else {
                    // Middle: show first, current-1, current, current+1, last
                    if (i === 0) {
                      pageToShow = 1;
                    } else if (i === 4) {
                      pageToShow = totalPages;
                    } else {
                      pageToShow = currentPage + (i - 2);
                    }
                  }
                  
                  // Add ellipsis indicators
                  if ((pageToShow === 1 && currentPage > 3) || 
                      (pageToShow === totalPages && currentPage < totalPages - 2)) {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    );
                  }
                  
                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageToShow as number)}
                        isActive={currentPage === pageToShow}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
      
      {/* Story detail modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
