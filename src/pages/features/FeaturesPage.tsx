
import FeaturesGrid from "@/components/features/FeaturesGrid";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <Breadcrumb />
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Feature Roadmap
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Help shape the future of Takes a Village by voting for features you'd like to see next.
            Your feedback helps us prioritize what to build.
          </p>
        </div>

        <FeaturesGrid />
      </div>
    </div>
  );
};

export default FeaturesPage;
