import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchIcon, Phone as PhoneIcon, MessageSquare, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}
const faqs: FAQ[] = [{
  id: "faq-1",
  question: "How do I create a family care account?",
  answer: "To create a family care account, click on the 'Sign In' button in the top navigation bar, then select the 'Sign Up' tab. Fill in your details, select 'Family' as your role, and complete the registration process. After verification, you'll be prompted to complete your family profile.",
  category: "Account"
}, {
  id: "faq-2",
  question: "Can I invite other family members to help manage care?",
  answer: "Yes, you can invite other family members to collaborate on care management. From your family dashboard, go to 'Team Management' and select 'Invite Family Member'. Enter their email address and they'll receive an invitation to join your care network.",
  category: "Care Management"
}, {
  id: "faq-3",
  question: "How do I find qualified care professionals?",
  answer: "You can find qualified care professionals by navigating to the 'Find Care' section in your family dashboard. Use filters to specify the type of care needed, location, availability, and other preferences. You can view profiles, ratings, and specialties before reaching out to potential care providers.",
  category: "Care Services"
}, {
  id: "faq-4",
  question: "What information do professionals need to provide when signing up?",
  answer: "Professionals need to provide basic contact information, professional credentials, areas of expertise, service areas, availability, and references. You'll also need to complete a background verification process before your profile becomes visible to families seeking care.",
  category: "Account"
}, {
  id: "faq-5",
  question: "How does the meal planning feature work?",
  answer: "The meal planning feature allows you to create customized meal plans for those under your care. You can input dietary restrictions, set up recurring meals, browse and save recipes, generate shopping lists, and track nutritional information. Access this feature from the 'Meal Planning' section of your dashboard.",
  category: "Features"
}, {
  id: "faq-6",
  question: "Is my personal and health information secure?",
  answer: "Yes, we take data security very seriously. All personal and health information is encrypted and stored securely. We comply with relevant data protection regulations and implement strict access controls. Your information is only shared with care team members you explicitly authorize.",
  category: "Privacy & Security"
}, {
  id: "faq-7",
  question: "How can I update my availability as a care professional?",
  answer: "To update your availability, log into your professional account and navigate to 'Schedule Management'. From there, you can modify your recurring availability or block off specific dates and times. Changes will be reflected to families who have you in their care network.",
  category: "Care Services"
}, {
  id: "faq-8",
  question: "What should I do if I need immediate support?",
  answer: "For immediate support, click on the help button (question mark icon) at the bottom right of any page. From there, you can access our WhatsApp support, submit a support ticket, or browse the FAQ section. For urgent matters, we recommend using the WhatsApp option for fastest response.",
  category: "Support"
}, {
  id: "faq-9",
  question: "How do I report an issue with the platform?",
  answer: "To report an issue, click on the help button in the bottom right corner and select 'Contact Form'. Describe the issue you're experiencing in detail, including any error messages, and submit the form. Our support team will investigate and respond as soon as possible.",
  category: "Support"
}, {
  id: "faq-10",
  question: "Can community organizations post resources and events?",
  answer: "Yes, community organizations can share resources and events. After creating a community account and completing verification, you can post resources, events, and services from your community dashboard. These will be visible to families and professionals in your service area.",
  category: "Community"
}];
const categories = Array.from(new Set(faqs.map(faq => faq.category)));
export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? faq.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });
  return <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about the Tavara.care</p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input type="text" placeholder="Search for questions or answers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={activeCategory === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveCategory(null)}>
            All
          </Badge>
          {categories.map(category => <Badge key={category} variant={activeCategory === category ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveCategory(category === activeCategory ? null : category)}>
              {category}
            </Badge>)}
        </div>
      </div>
      
      {/* FAQs */}
      {filteredFaqs.length > 0 ? <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map(faq => <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>)}
        </Accordion> : <div className="text-center py-8">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-1">No results found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any FAQs matching your search criteria
          </p>
          <Button onClick={() => {
        setSearchQuery("");
        setActiveCategory(null);
      }}>
            Clear filters
          </Button>
        </div>}
      
      {/* Support Options */}
      <div className="mt-12 bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Still need help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <PhoneIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">WhatsApp Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Get quick support via WhatsApp
              </p>
              <Button variant="outline" size="sm" onClick={() => {
              window.open(`https://wa.me/18687865357?text=${encodeURIComponent("Hello, I need support with Takes a Village platform.")}`, "_blank");
            }}>
                Connect on WhatsApp
              </Button>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Contact Form</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Submit a detailed support request
              </p>
              <Button variant="outline" size="sm" onClick={() => {
              // This would open the contact form modal
              alert("Contact form would open here");
            }}>
                Open Contact Form
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}