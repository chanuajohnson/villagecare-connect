
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fab } from "@/components/ui/fab";

// Mock FAQ data
const faqData = [
  {
    id: 1,
    category: "Account",
    questions: [
      {
        id: "acc-1",
        question: "How do I create an account?",
        answer: "To create an account, click on the 'Sign Up' button in the top right corner of the homepage. Follow the prompts to enter your information and select your role (Family, Professional, or Community)."
      },
      {
        id: "acc-2",
        question: "How do I reset my password?",
        answer: "Click on the 'Sign In' button, then select 'Forgot Password'. Enter your email address, and we'll send you instructions to reset your password."
      },
      {
        id: "acc-3",
        question: "Can I change my role after signing up?",
        answer: "Yes, you can change your role by contacting our support team. Please note that changing roles may require additional information or verification."
      }
    ]
  },
  {
    id: 2,
    category: "Family Dashboard",
    questions: [
      {
        id: "fam-1",
        question: "How do I create a care plan?",
        answer: "From your Family Dashboard, navigate to the 'Care Plans' section and click on 'Create New Plan'. Follow the step-by-step guide to set up a personalized care plan for your loved one."
      },
      {
        id: "fam-2",
        question: "How do I invite family members to collaborate?",
        answer: "In your Family Dashboard, go to 'Team' section and click 'Invite Members'. Enter their email addresses and select their permission level. They'll receive an invitation to join your care circle."
      }
    ]
  },
  {
    id: 3,
    category: "Professional Dashboard",
    questions: [
      {
        id: "pro-1",
        question: "How do I showcase my qualifications?",
        answer: "In your Professional Dashboard, go to 'Profile' and select 'Qualifications'. From there, you can add your education, certifications, and experience. Don't forget to upload supporting documents for verification."
      },
      {
        id: "pro-2",
        question: "How do I set my availability?",
        answer: "Navigate to the 'Schedule' section in your Professional Dashboard. You can set your regular working hours and mark specific dates as unavailable. This helps families find times that work for both of you."
      }
    ]
  },
  {
    id: 4,
    category: "Community Dashboard",
    questions: [
      {
        id: "com-1",
        question: "How do I create a community event?",
        answer: "From your Community Dashboard, go to 'Events' and click 'Create New Event'. Fill in the event details, location, and time. You can also add resources needed and volunteer opportunities."
      },
      {
        id: "com-2",
        question: "How do I share resources with my community?",
        answer: "In the 'Resources' section of your Community Dashboard, click 'Add Resource'. You can upload documents, add links, or create new content to share with your community members."
      }
    ]
  },
  {
    id: 5,
    category: "Technical Issues",
    questions: [
      {
        id: "tech-1",
        question: "The app is running slowly. What can I do?",
        answer: "Try clearing your browser cache and cookies, then restart your browser. If the issue persists, check your internet connection or try using a different browser."
      },
      {
        id: "tech-2",
        question: "How do I upload documents to the platform?",
        answer: "When you see an upload button or area, click on it to open your file browser. Select the document you want to upload (PDF, DOC, DOCX, JPG, PNG formats are supported). The maximum file size is 10MB."
      }
    ]
  }
];

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId) 
        : [...prev, questionId]
    );
  };

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4 inline-block">
            Support Center
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions about our platform. If you can't find what you're looking for, 
            don't hesitate to contact our support team.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: category.id * 0.1 }}
                className="mb-6"
              >
                <Button
                  variant="ghost"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex justify-between items-center py-4 text-left bg-white rounded-lg shadow-sm hover:bg-gray-50"
                >
                  <h2 className="text-xl font-semibold text-gray-800">
                    {category.category}
                  </h2>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </Button>

                {expandedCategory === category.id && (
                  <div className="mt-2 space-y-3">
                    {category.questions.map((q) => (
                      <div key={q.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <Button
                          variant="ghost"
                          onClick={() => toggleQuestion(q.id)}
                          className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                        >
                          <h3 className="text-lg font-medium text-gray-800">
                            {q.question}
                          </h3>
                          {expandedQuestions.includes(q.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </Button>
                        
                        {expandedQuestions.includes(q.id) && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-600">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10">
              <h3 className="text-xl font-medium text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try different keywords or contact our support team for assistance.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Still have questions?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              className="flex items-center gap-2"
              onClick={() => window.open("https://wa.me/+18687865357?text=Hello,%20I%20need%20support%20with%20[brief%20issue].", "_blank")}
            >
              <Phone className="h-5 w-5" />
              <span>WhatsApp Support</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
