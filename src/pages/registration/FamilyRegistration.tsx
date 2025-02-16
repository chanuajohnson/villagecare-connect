
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const FamilyRegistration = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add registration logic here
    navigate("/dashboard/family");
  };

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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <button 
              type="submit"
              className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600"
            >
              Go to Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyRegistration;
