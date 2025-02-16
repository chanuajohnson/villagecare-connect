
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const FamilyRegistration = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-100 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Care Now</h1>
          <p className="text-gray-600 mb-8">
            Complete your registration to start coordinating care for your loved ones.
          </p>
          
          <div className="space-y-6">
            <p className="text-primary-600">
              Registration form will be implemented in the next iteration.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyRegistration;
