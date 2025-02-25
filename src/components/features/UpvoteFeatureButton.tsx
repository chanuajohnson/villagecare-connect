
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface UpvoteFeatureButtonProps {
  featureTitle: string;
  className?: string;
}

export const UpvoteFeatureButton = ({ featureTitle, className }: UpvoteFeatureButtonProps) => {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);

  const handleUpvote = () => {
    setIsVoting(true);
    navigate('/features');
    toast.info(`You'll be able to vote for "${featureTitle}" and other upcoming features!`);
    setIsVoting(false);
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
      Upvote This Feature
    </Button>
  );
};
