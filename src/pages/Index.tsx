
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCog, Heart, ArrowRight } from "lucide-react";

const roles = [
  {
    id: "family",
    title: "Family",
    description: "Coordinate care for your loved ones",
    icon: Users,
    color: "bg-primary-100",
  },
  {
    id: "professional",
    title: "Professional",
    description: "Provide care services and expertise",
    icon: UserCog,
    color: "bg-primary-200",
  },
  {
    id: "community",
    title: "Community",
    description: "Support and contribute to care networks",
    icon: Heart,
    color: "bg-primary-300",
  },
];

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-primary-100">
      <div className="container px-4 py-12 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4 inline-block">
            Care Coordination Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            It Takes a Village to Care
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community of care coordinators, families, and professionals to make
            caring easier and more effective.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group`}
            >
              <div
                className={`${
                  role.color
                } rounded-2xl p-6 h-full transition-transform duration-300 group-hover:scale-[1.02]`}
              >
                <div className="mb-4">
                  <role.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {role.title}
                </h3>
                <p className="text-gray-600 mb-6">{role.description}</p>
                <button
                  onClick={() => setSelectedRole(role.id)}
                  className="inline-flex items-center text-primary-700 font-medium group/button"
                >
                  Learn more
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="#get-started"
            className="inline-flex items-center justify-center h-11 px-8 font-medium text-white bg-primary-500 rounded-full transition-colors duration-300 hover:bg-primary-600"
          >
            Get Started
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
