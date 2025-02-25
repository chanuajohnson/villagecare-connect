
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_development' | 'ready_for_demo' | 'launched';
  _count?: {
    votes: number;
  };
}

interface FeatureCardProps {
  feature: Feature;
  isAuthenticated: boolean;
  userEmail?: string;
  userType?: string;
  onVote?: () => void;
}

const statusColors = {
  planned: 'bg-gray-100 text-gray-800',
  in_development: 'bg-blue-100 text-blue-800',
  ready_for_demo: 'bg-green-100 text-green-800',
  launched: 'bg-purple-100 text-purple-700',
};

const FeatureCard = ({ feature, isAuthenticated, userEmail, userType, onVote }: FeatureCardProps) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote for features');
      return;
    }

    if (!userEmail || !userType) {
      toast.error('User information is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase.from('feature_votes').insert({
        feature_id: feature.id,
        user_id: user.id,
        user_email: userEmail,
        user_type: userType,
        feedback: feedback.trim() || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already voted for this feature');
        } else {
          throw error;
        }
      } else {
        toast.success('Thank you for your vote!');
        setFeedback('');
        if (onVote) onVote();
      }
    } catch (error: any) {
      console.error('Error voting for feature:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{feature.title}</CardTitle>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${statusColors[feature.status]}`}>
              {feature.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleVote}
            disabled={isSubmitting || !isAuthenticated}
          >
            <ArrowUpIcon className="w-4 h-4" />
            <span>{feature._count?.votes || 0}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{feature.description}</CardDescription>
        {isAuthenticated && (
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts about this feature (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
