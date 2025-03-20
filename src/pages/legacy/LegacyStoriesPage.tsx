
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { StoryList } from "@/components/legacy/StoryList";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";

export default function LegacyStoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Honoring Loved Ones' Legacies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A tribute to those we love. Discover the stories of individuals who shaped lives, 
            made an impact, and deserve to be remembered.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StoryList className="mb-12" />
        </motion.div>
      </Container>
      
      {/* Track page views */}
      <DashboardTracker dashboardType="community" />
    </div>
  );
}
