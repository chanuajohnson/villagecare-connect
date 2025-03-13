
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const VisionSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative mt-16 mb-20">
      <motion.div 
        className="absolute inset-0 bg-primary-100 rounded-xl -z-10"
        initial={{ skewY: 0 }}
        animate={{ skewY: -2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      ></motion.div>
      <div className="px-8 py-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-primary-800 mb-6"
        >
          Our Vision
        </motion.h2>
        
        <div className="max-w-3xl mx-auto">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-primary-700 mb-6"
          >
            To transform caregiving into a recognized, professional, and compassionate career through comprehensive training and seamless care coordination.
          </motion.p>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
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
                <p>
                  Our vision extends to creating a comprehensive ecosystem where caregivers, families, and
                  agencies collaborate to provide the highest quality of care, leveraging technology
                  and community support to bridge the caregiving gap in Trinidad & Tobago.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 text-primary-500 underline hover:text-primary-600 transition-colors font-medium"
          >
            {isExpanded ? "See less" : "See more"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
