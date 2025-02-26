
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface UpvoteFeatureButtonProps {
  featureTitle: string;
  className?: string;
  featureId?: string;
}

export const UpvoteFeatureButton = ({ featureTitle, className }: UpvoteFeatureButtonProps) => {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [session, setSession] = useState<any>(null);

  const getOrCreateFeatureId = async (title: string) => {
    try {
      const { data: existingFeature, error: fetchError } = await supabase
        .from('features')
        .select('id')
        .eq('title', title)
        .single();

      if (existingFeature) {
        return existingFeature.id;
      }

      const { data: newFeature, error: insertError } = await supabase
        .from('features')
        .insert([{ title, description: `Feature request for ${title}` }])
        .select('id')
        .single();

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

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        const featureId = await getOrCreateFeatureId(featureTitle);
        if (featureId) {
          await checkUserVote(currentSession.user.id, featureId);
          await fetchVoteCount(featureId);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const featureId = await getOrCreateFeatureId(featureTitle);
        if (featureId) {
          await checkUserVote(session.user.id, featureId);
          await fetchVoteCount(featureId);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [featureTitle]);

  const checkUserVote = async (userId: string, featureId: string) => {
    try {
      const { data: votes, error } = await supabase
        .from('feature_votes')
        .select('id')
        .eq('feature_id', featureId)
        .eq('user_id', userId);
      
      if (error) throw error;
      setHasVoted(votes && votes.length > 0);
    } catch (error) {
      console.error('Error checking vote:', error);
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

  const handleUpvote = async () => {
    const featureId = await getOrCreateFeatureId(featureTitle);
    
    if (!featureId) {
      toast.error('Unable to process vote at this time.');
      return;
    }

    if (!session) {
      // Store the feature info we want to vote for after login
      localStorage.setItem('pendingVoteFeatureId', featureId);
      localStorage.setItem('pendingVoteTitle', featureTitle);
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/auth?returnTo=${returnUrl}`);
      toast.info('Please sign in to vote for this feature');
      return;
    }

    if (isVoting) return;
    setIsVoting(true);
    
    try {
      if (hasVoted) {
        // Remove vote
        const { error } = await supabase
          .from('feature_votes')
          .delete()
          .eq('feature_id', featureId)
          .eq('user_id', session.user.id);

        if (error) throw error;
        
        setHasVoted(false);
        setVoteCount(prev => Math.max(0, prev - 1));
        toast.success(`Removed your vote for "${featureTitle}"`);
      } else {
        // Add vote
        const { error } = await supabase
          .from('feature_votes')
          .insert([{
            feature_id: featureId,
            user_id: session.user.id,
            user_email: session.user.email,
            user_type: 'user'
          }]);

        if (error) throw error;
        
        setHasVoted(true);
        setVoteCount(prev => prev + 1);
        toast.success(`Thank you for voting for "${featureTitle}"!`);
      }
    } catch (error: any) {
      console.error('Error handling vote:', error);
      toast.error(error.message || 'Failed to process your vote. Please try again.');
    } finally {
      setIsVoting(false);
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
      {hasVoted ? 'Voted' : 'Upvote'} {voteCount > 0 && `(${voteCount})`}
    </Button>
  );
};
