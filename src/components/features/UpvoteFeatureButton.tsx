
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

export const UpvoteFeatureButton = ({ featureTitle, className, featureId }: UpvoteFeatureButtonProps) => {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && featureId) {
        checkUserVote(session.user.id);
        fetchVoteCount();
      }
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', { _event, session });
      setSession(session);
      
      if (session && featureId) {
        await checkUserVote(session.user.id);
        await fetchVoteCount();
        
        // Check if there's a pending vote after login
        const pendingVoteFeatureId = localStorage.getItem('pendingVoteFeatureId');
        console.log('Checking pending vote:', { pendingVoteFeatureId, featureId });
        
        if (pendingVoteFeatureId === featureId) {
          console.log('Processing pending vote for feature:', featureId);
          await handleUpvote(true);
          localStorage.removeItem('pendingVoteFeatureId');
        }
      }
    });

    // Set up real-time subscription for vote changes
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
            fetchVoteCount();
            if (session) {
              checkUserVote(session.user.id);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
        supabase.removeChannel(channel);
      };
    }
    
    return () => {
      subscription.unsubscribe();
    };
  }, [featureId]);

  const checkUserVote = async (userId: string) => {
    if (!featureId) return;
    
    try {
      const { data, error } = await supabase.rpc('has_user_voted_for_feature', {
        feature_id: featureId,
        user_id: userId
      });
      
      if (error) throw error;
      setHasVoted(!!data);
    } catch (error) {
      console.error('Error checking vote:', error);
    }
  };

  const fetchVoteCount = async () => {
    if (!featureId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_feature_vote_count', {
        feature_id: featureId
      });
      
      if (error) throw error;
      setVoteCount(data || 0);
    } catch (error) {
      console.error('Error fetching vote count:', error);
    }
  };

  const handleUpvote = async (isPostLogin: boolean = false) => {
    if (!featureId) {
      toast.error('This feature is not available for voting yet.');
      return;
    }

    if (!session) {
      // Store the feature ID we want to vote for after login
      localStorage.setItem('pendingVoteFeatureId', featureId);
      navigate('/auth');
      toast.info(`Sign in to vote for "${featureTitle}" and other upcoming features!`);
      return;
    }

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
        
        // After successful vote post-login, redirect to features page
        if (isPostLogin) {
          navigate('/features');
        }
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
