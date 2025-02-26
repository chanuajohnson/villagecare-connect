
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface UpvoteFeatureButtonProps {
  featureTitle: string;
  className?: string;
  featureId?: string;
}

export const UpvoteFeatureButton = ({ featureTitle, className }: UpvoteFeatureButtonProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  
  const getOrCreateFeatureId = async (title: string) => {
    try {
      const { data: existingFeature, error: fetchError } = await supabase
        .from('features')
        .select('id')
        .eq('title', title)
        .maybeSingle();

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

  const fetchVoteCount = async (featureId: string) => {
    try {
      const { data: votes, error } = await supabase
        .from('feature_votes')
        .select('id')
        .eq('feature_id', featureId);
      
      if (error) throw error;
      setVoteCount(votes?.length || 0);
    } catch (error) {
      console.error('Error fetching vote count:', error);
    }
  };

  useEffect(() => {
    const initializeFeature = async () => {
      const featureId = await getOrCreateFeatureId(featureTitle);
      if (featureId) {
        await fetchVoteCount(featureId);
      }
    };

    initializeFeature();
  }, [featureTitle]);

  const handleUpvote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    
    try {
      const featureId = await getOrCreateFeatureId(featureTitle);
      
      if (!featureId) {
        toast.error('Unable to process vote at this time.');
        return;
      }

      const { error } = await supabase
        .from('feature_votes')
        .insert([{
          feature_id: featureId,
          anonymous: true
        }]);

      if (error) throw error;
      
      setVoteCount(prev => prev + 1);
      toast.success(`Thank you for voting for "${featureTitle}"!`);
    } catch (error: any) {
      console.error('Error handling vote:', error);
      toast.error(error.message || 'Failed to process your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleUpvote}
      disabled={isVoting}
    >
      <ThumbsUp className="w-4 h-4 mr-2" />
      Upvote {voteCount > 0 && `(${voteCount})`}
    </Button>
  );
};

