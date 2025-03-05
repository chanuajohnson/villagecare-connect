
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { Fab } from "@/components/ui/fab";
import { MessageSquareHeart } from "lucide-react";

// Fetch FAQ content from markdown file
const fetchFAQContent = async () => {
  try {
    const response = await fetch('/FAQ.md');
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error loading FAQ:', error);
    return '# FAQ\n\nError loading FAQ content. Please try again later.';
  }
};

const FAQPage = () => {
  const [faqContent, setFaqContent] = useState<string>('Loading...');
  const { toast } = useToast();

  useEffect(() => {
    fetchFAQContent().then(setFaqContent);
  }, []);

  return (
    <div className="container mx-auto py-8 min-h-[calc(100vh-4rem)]">
      <Helmet>
        <title>FAQ - Takes a Village</title>
        <meta name="description" content="Frequently asked questions about the Takes a Village platform" />
      </Helmet>
      
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary-700 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mb-8">
          Find answers to common questions about Takes a Village. If you don't see your question here, 
          feel free to contact our support team.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto overflow-hidden">
        <ScrollArea className="h-[65vh]">
          <div className="p-6 md:p-8">
            <ReactMarkdown className="prose prose-primary max-w-none">
              {faqContent}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => toast({
            title: "Support request received",
            description: "Our team will get back to you shortly.",
          })}
          className="bg-primary-600 hover:bg-primary-700"
        >
          Still have questions? Contact us
        </Button>
      </div>

      <Fab 
        icon={<MessageSquareHeart className="h-6 w-6" />}
        label="Get help"
        className="bg-primary-500 hover:bg-primary-600 text-white"
      />
    </div>
  );
};

export default FAQPage;
