
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ContentBlock {
  id: string;
  content_type: 'text' | 'image' | 'video';
  content: string;
  order_index: number;
}

interface LessonContentProps {
  lessonId: string;
}

export const LessonContent = ({ lessonId }: LessonContentProps) => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('lesson_content_blocks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (error) {
        console.error('Error fetching lesson content:', error);
        return;
      }

      setContentBlocks(data || []);
      setLoading(false);
    };

    fetchContent();
  }, [lessonId]);

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-md" />;
  }

  return (
    <div className="space-y-6">
      {contentBlocks.map((block) => (
        <div key={block.id} className="prose max-w-none">
          {block.content_type === 'text' && (
            <div className="text-gray-700">{block.content}</div>
          )}
          {block.content_type === 'image' && (
            <img
              src={block.content}
              alt="Lesson content"
              className="rounded-lg shadow-sm max-w-full h-auto"
            />
          )}
        </div>
      ))}
    </div>
  );
};
