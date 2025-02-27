
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

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
  const [localFeatureId, setLocalFeatureId] = useState<string | null>(null);
  const { user, requireAuth } = useAuth();
  
  const getOrCreateFeatureId = async (title: string) => {
    try {
      const { data: existingFeature, error: fetchError } = await supabase
        .from('features')
        .select('id')
        .eq('title', title)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingFeature) {
        return existingFeature.id;
      }

      const { data: newFeature, error: insertError } = await supabase
        .from('features')
        .insert([{ title, description: `Feature request for ${title}` }])
        .select('id')
        .maybeSingle();

      if (insertError) {
        console.error('Error creating feature:', insertError);
        return null;
      }
      return newFeature?.id;
    } catch (error) {
      console.error('Error getting/creating feature:', error);
      return null;
    }
  };

  const checkUserVote = async (featureId: string) => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('feature_upvotes')
      .select('id')
      .eq('feature_id', featureId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking user vote:', error);
      return false;
    }

    return !!data;
  };

  const fetchVoteCount = async (featureId: string) => {
    try {
      const { count, error } = await supabase
        .from('feature_upvotes')
        .select('id', { count: 'exact' })
        .eq('feature_id', featureId);
      
      if (error) throw error;
      setVoteCount(count || 0);
    } catch (error) {
      console.error('Error fetching vote count:', error);
    }
  };

  useEffect(() => {
    const initializeFeature = async () => {
      const featureId = propFeatureId || await getOrCreateFeatureId(featureTitle);
      if (featureId) {
        setLocalFeatureId(featureId);
        await fetchVoteCount(featureId);
        if (user) {
          const userHasVoted = await checkUserVote(featureId);
          setHasVoted(userHasVoted);
        }
      }
    };

    initializeFeature();
  }, [featureTitle, propFeatureId, user]);

  const handleUpvote = async () => {
    try {
      const featureId = localFeatureId || await getOrCreateFeatureId(featureTitle);
      if (!featureId) {
        toast.error('Unable to process vote at this time.');
        return;
      }
      
      // Store the feature ID for post-login handling
      sessionStorage.setItem('pendingFeatureId', featureId);
      sessionStorage.setItem('pendingFeatureUpvote', featureId);
      
      if (!requireAuth(`upvote "${featureTitle}"`)) {
        return;
      }
      
      if (isVoting) return;
      setIsVoting(true);
      
      if (hasVoted) {
        const { error } = await supabase
          .from('feature_upvotes')
          .delete()
          .eq('feature_id', featureId)
          .eq('user_id', user!.id);

        if (error) throw error;
        setHasVoted(false);
        setVoteCount(prev => prev - 1);
        toast.success('Your vote has been removed');
      } else {
        const { error } = await supabase
          .from('feature_upvotes')
          .insert([{
            feature_id: featureId,
            user_id: user!.id
          }]);

        if (error) {
          console.error('Error inserting upvote:', error);
          throw error;
        }
        setHasVoted(true);
        setVoteCount(prev => prev + 1);
        toast.success(`Thank you for voting for "${featureTitle}"!`);
      }
    } catch (error: any) {
      console.error('Error handling vote:', error);
      toast.error(error.message || 'Failed to process your vote. Please try again.');
    } finally {
      setIsVoting(false);
      // Clean up session storage after successful vote
      sessionStorage.removeItem('pendingFeatureId');
      sessionStorage.removeItem('pendingFeatureUpvote');
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
