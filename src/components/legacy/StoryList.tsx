
import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Search, Loader2 } from "lucide-react";
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
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
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
      applySearch(data || [], searchTerm);
      
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
  
  // Apply search to stories
  const applySearch = (allStories: Story[], term: string) => {
    if (!term.trim()) {
      setFilteredStories(allStories);
      setTotalPages(Math.max(1, Math.ceil(allStories.length / storiesPerPage)));
      return;
    }
    
    const searchLower = term.toLowerCase();
    const result = allStories.filter(story => 
      (story.life_story && story.life_story.toLowerCase().includes(searchLower)) ||
      (story.full_name && story.full_name.toLowerCase().includes(searchLower)) ||
      (story.career_fields && Array.isArray(story.career_fields) && story.career_fields.some(c => c.toLowerCase().includes(searchLower))) ||
      (story.hobbies_interests && Array.isArray(story.hobbies_interests) && story.hobbies_interests.some(h => h.toLowerCase().includes(searchLower)))
    );
    
    setFilteredStories(result);
    setTotalPages(Math.max(1, Math.ceil(result.length / storiesPerPage)));
    setCurrentPage(1);
  };
  
  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applySearch(stories, value);
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
  
  // Load stories on component mount and when search term changes
  useEffect(() => {
    fetchStories();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative w-full md:w-1/2 lg:w-1/3">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search stories..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
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
          <p className="text-gray-500">No stories found matching your search.</p>
          {searchTerm && (
            <Button 
              onClick={() => handleSearchChange("")} 
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
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
