
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

  // Get or create a feature ID for the given title
  const getOrCreateFeatureId = async (title: string) => {
    try {
      // Try to get existing feature
      const { data: existingFeature, error: fetchError } = await supabase
        .from('features')
        .select('id')
        .eq('title', title)
        .single();

      if (existingFeature) {
        return existingFeature.id;
      }

      // If feature doesn't exist, create it
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
    let isMounted = true;
    let cleanupFunction: (() => void) | undefined;
    
    // Get initial session and check for pending votes
    const checkSessionAndPendingVotes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(session);
      
      const featureId = await getOrCreateFeatureId(featureTitle);
      
      if (session && featureId) {
        await checkUserVote(session.user.id, featureId);
        await fetchVoteCount(featureId);
        
        // Check for pending vote
        const pendingVoteFeatureId = localStorage.getItem('pendingVoteFeatureId');
        const pendingVoteTitle = localStorage.getItem('pendingVoteTitle');
        
        if (pendingVoteTitle === featureTitle) {
          console.log('Processing pending vote for:', featureTitle);
          await handleUpvote(true);
          localStorage.removeItem('pendingVoteFeatureId');
          localStorage.removeItem('pendingVoteTitle');
        }
      }
    };

    checkSessionAndPendingVotes();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      
      const featureId = await getOrCreateFeatureId(featureTitle);
      
      if (session && featureId) {
        await checkUserVote(session.user.id, featureId);
        await fetchVoteCount(featureId);
      }
    });

    // Set up real-time subscription for vote changes
    const setupRealtimeSubscription = async () => {
      const featureId = await getOrCreateFeatureId(featureTitle);
      if (featureId) {
        const channel = supabase
          .channel('vote_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'feature_votes',
              filter: `feature_id=eq.${featureId}`
            },
            () => {
              if (!isMounted) return;
              fetchVoteCount(featureId);
              if (session) {
                checkUserVote(session.user.id, featureId);
              }
            }
          )
          .subscribe();

        cleanupFunction = () => {
          supabase.removeChannel(channel);
        };
      }
    };

    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [featureTitle]);

  const checkUserVote = async (userId: string, featureId: string) => {
    if (!featureId) return;
    
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
    if (!featureId) return;
    
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

  const handleUpvote = async (isPostLogin: boolean = false) => {
    const featureId = await getOrCreateFeatureId(featureTitle);
    
    if (!featureId) {
      toast.error('Unable to process vote at this time.');
      return;
    }

    if (!session) {
      // Store the feature info we want to vote for after login
      console.log('Storing pending vote for feature:', featureTitle);
      localStorage.setItem('pendingVoteFeatureId', featureId);
      localStorage.setItem('pendingVoteTitle', featureTitle);
      navigate('/auth');
      toast.info(`Sign in to vote for "${featureTitle}" and other upcoming features!`);
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
        toast.success(`Removed your vote for "${featureTitle}"`);
      } else {
        // Add vote
        const { error } = await supabase
          .from('feature_votes')
          .insert([
            {
              feature_id: featureId,
              user_id: session.user.id,
              user_email: session.user.email,
              user_type: 'user'
            }
          ]);

        if (error) throw error;
        toast.success(`Thank you for voting for "${featureTitle}"!`);
      }

      if (!hasVoted && !isPostLogin) {
        navigate('/features');
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
      onClick={() => handleUpvote(false)}
      disabled={isVoting}
    >
      <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-current' : ''}`} />
      {hasVoted ? 'Voted' : 'Upvote'} {voteCount > 0 && `(${voteCount})`}
    </Button>
  );
};
