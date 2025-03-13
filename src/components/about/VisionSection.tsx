
import { useState } from 'react';
import { motion } from 'framer-motion';

export const VisionSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative mt-16 mb-20">
      <div className="absolute inset-0 bg-primary-100 rounded-xl -z-10 transform -skew-y-2"></div>
      <div className="px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-primary-800 mb-6">Our Vision</h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-primary-700 mb-6">
            A world where caregiving is valued, supported, and accessible — where technology 
            and community come together to ensure that no caregiver walks alone and every 
            person receives the care they deserve.
          </p>
          
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
              className="text-primary-600 space-y-4"
            >
              <p>
                We envision a future where caregiving is recognized as essential work, where 
                caregivers have access to fair compensation, ongoing education, and supportive 
                communities.
              </p>
              <p>
                Through Tavara.care, we're building pathways to this future — creating technology 
                that connects, empowers, and elevates everyone involved in the caregiving journey.
              </p>
            </motion.div>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 text-primary-500 underline hover:text-primary-600 transition-colors font-medium"
          >
            {isExpanded ? "See less" : "See more"}
          </button>
        </div>
      </div>
    </div>
  );
};
