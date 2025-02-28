
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

interface UpvoteFeatureButtonProps {
  featureTitle: string;
  className?: string;
  featureId?: string;
  buttonText?: string;
}

export const UpvoteFeatureButton = ({ featureTitle, className, featureId: propFeatureId, buttonText = "Upvote" }: UpvoteFeatureButtonProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [featureId, setFeatureId] = useState<string | null>(propFeatureId || null);
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  // Get or create the feature ID if it doesn't exist
  const getOrCreateFeatureId = async (title: string) => {
    try {
      // First, check if we already have this feature ID stored
      if (featureId) return featureId;
      
      // Check if feature exists in database
      const { data: existingFeature, error: fetchError } = await supabase
        .from('features')
        .select('id')
        .eq('title', title)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching feature:', fetchError);
        return null;
      }

      if (existingFeature) {
        setFeatureId(existingFeature.id);
        return existingFeature.id;
      }

      // Create new feature if it doesn't exist
      const { data: newFeature, error: insertError } = await supabase
        .from('features')
        .insert([{ title, description: `Feature request for ${title}` }])
        .select('id')
        .maybeSingle();

      if (insertError) {
        console.error('Error creating feature:', insertError);
        return null;
      }
      
      if (newFeature) {
        setFeatureId(newFeature.id);
        return newFeature.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting/creating feature:', error);
      return null;
    }
  };

  // Check if user has already voted for this feature
  const checkUserVote = async (fId: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('feature_upvotes')
        .select('id')
        .eq('feature_id', fId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking user vote:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking user vote:', error);
      return false;
    }
  };

  // Fetch vote count for the feature
  const fetchVoteCount = async (fId: string) => {
    try {
      const { count, error } = await supabase
        .from('feature_upvotes')
        .select('id', { count: 'exact' })
        .eq('feature_id', fId);
      
      if (error) {
        console.error('Error fetching vote count:', error);
        return;
      }
      
      setVoteCount(count || 0);
    } catch (error) {
      console.error('Error fetching vote count:', error);
    }
  };

  // Initialize component - get feature ID, check vote status, fetch vote count
  useEffect(() => {
    const initializeFeature = async () => {
      const fId = await getOrCreateFeatureId(featureTitle);
      if (fId) {
        await fetchVoteCount(fId);
        if (user) {
          const userHasVoted = await checkUserVote(fId);
          setHasVoted(userHasVoted);
        }
      }
    };

    initializeFeature();
  }, [featureTitle, user]);

  // Handle upvote click
  const handleUpvote = async () => {
    // Get feature ID first
    const fId = await getOrCreateFeatureId(featureTitle);
    if (!fId) {
      toast.error('Unable to process vote at this time.');
      return;
    }
    
    // Store the feature ID for post-login handling
    localStorage.setItem('pendingFeatureId', fId);
    
    // Check if user is authenticated
    if (!requireAuth(`upvote "${featureTitle}"`)) {
      return; // requireAuth will handle redirect to login page
    }
    
    // Prevent multiple clicks
    if (isVoting) return;
    setIsVoting(true);
    
    try {
      if (hasVoted) {
        // Remove vote if user already voted
        const { error } = await supabase
          .from('feature_upvotes')
          .delete()
          .eq('feature_id', fId)
          .eq('user_id', user!.id);

        if (error) throw error;
        
        setHasVoted(false);
        setVoteCount(prev => Math.max(0, prev - 1));
        toast.success('Your vote has been removed');
      } else {
        // Add vote
        const { error } = await supabase
          .from('feature_upvotes')
          .insert([{
            feature_id: fId,
            user_id: user!.id
          }]);

        if (error) throw error;
        
        setHasVoted(true);
        setVoteCount(prev => prev + 1);
        toast.success(`Thank you for voting for "${featureTitle}"!`);
        
        // Navigate to profile features page after successful vote
        navigate('/features');
      }
    } catch (error: any) {
      console.error('Error handling vote:', error);
      toast.error(error.message || 'Failed to process your vote. Please try again.');
    } finally {
      setIsVoting(false);
      // Clean up local storage after successful vote
      localStorage.removeItem('pendingFeatureId');
    }
  };

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      className={className}
      onClick={handleUpvote}
      disabled={isVoting}
    >
      <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-current' : ''}`} />
      {buttonText} {voteCount > 0 && `(${voteCount})`}
    </Button>
  );
};
