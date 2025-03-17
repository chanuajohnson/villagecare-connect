import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export const VisionSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} viewport={{
    once: true
  }} className="mb-8">
      <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow">
        <CardHeader className="bg-primary-50">
          <CardTitle className="text-primary-700">Our Vision</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-primary-700 mb-6">We envision a world where quality caregiving is instantly accessible whenever needed - whether for an hour, a day, or ongoing support - creating a community where families find peace of mind and caregivers are valued professionals in a seamless, compassionate care ecosystem.</p>
            
            <AnimatePresence>
              {isExpanded && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: 'auto'
            }} exit={{
              opacity: 0,
              height: 0
            }} transition={{
              duration: 0.5
            }} className="text-primary-600 space-y-4">
                  
                  
                  
                </motion.div>}
            </AnimatePresence>
            
            
          </div>
        </CardContent>
      </Card>
    </motion.div>;
};