
import { Fragment, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type BreadcrumbItem = {
  label: string;
  path: string;
  isLoading?: boolean;
};

// Enhanced route mapping with more descriptive labels
const routeMap: Record<string, string> = {
  features: "Features",
  auth: "Authentication",
  register: "Registration",
  family: "Family",
  professional: "Professional",
  community: "Community",
  dashboard: "Dashboard",
  "training-resources": "Training Resources",
  module: "Module",
  lesson: "Lesson",
  "message-board": "Message Board",
  subscription: "Subscription",
};

const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  if (pathname === "/") return [];

  const paths = pathname.split("/").filter(Boolean);
  let currentPath = "";
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Process each path segment
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Handle module IDs - mark for later replacement with actual module titles
    if (path === "module" && index < paths.length - 1) {
      breadcrumbItems.push({
        label: "Module",
        path: currentPath,
      });
      return;
    }
    
    // Prepare to replace module ID with actual module title
    if (index > 0 && paths[index - 1] === "module") {
      breadcrumbItems.push({
        label: `Module ${paths[index]}`,
        path: currentPath,
        isLoading: true, // Mark for loading the actual module title
      });
      return;
    }
    
    // Handle lesson IDs
    if (path === "lesson" && index < paths.length - 1) {
      breadcrumbItems.push({
        label: "Lesson",
        path: currentPath,
      });
      return;
    }
    
    // Prepare to replace lesson ID with actual lesson title
    if (index > 0 && paths[index - 1] === "lesson") {
      breadcrumbItems.push({
        label: `Lesson ${paths[index]}`,
        path: currentPath,
        isLoading: true, // Mark for loading the actual lesson title
      });
      return;
    }
    
    // Normal path handling for other routes
    breadcrumbItems.push({
      label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
      path: currentPath,
    });
  });
  
  return breadcrumbItems;
};

export function Breadcrumb() {
  const location = useLocation();
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialItems = getBreadcrumbItems(location.pathname);
    setItems(initialItems);

    // Check if we need to fetch module or lesson titles
    const needsFetching = initialItems.some(item => item.isLoading);
    
    if (needsFetching) {
      setIsLoading(true);
      
      const fetchModuleAndLessonTitles = async () => {
        const updatedItems = [...initialItems];
        const paths = location.pathname.split("/").filter(Boolean);
        
        // Find module ID and lesson ID in the path
        let moduleId = null;
        let lessonId = null;
        
        for (let i = 0; i < paths.length; i++) {
          if (paths[i] === "module" && i + 1 < paths.length) {
            moduleId = paths[i + 1];
          }
          if (paths[i] === "lesson" && i + 1 < paths.length) {
            lessonId = paths[i + 1];
          }
        }
        
        // Fetch module title if needed
        if (moduleId) {
          try {
            const { data: moduleData, error: moduleError } = await supabase
              .from('training_modules')
              .select('title')
              .eq('id', moduleId)
              .single();
            
            if (moduleData && !moduleError) {
              // Update the module breadcrumb with actual title
              for (let i = 0; i < updatedItems.length; i++) {
                if (updatedItems[i].isLoading && updatedItems[i].path.includes(`/module/${moduleId}`)) {
                  updatedItems[i] = {
                    ...updatedItems[i],
                    label: moduleData.title,
                    isLoading: false
                  };
                  break;
                }
              }
            }
          } catch (error) {
            console.error("Error fetching module title:", error);
          }
        }
        
        // Fetch lesson title if needed
        if (lessonId) {
          try {
            const { data: lessonData, error: lessonError } = await supabase
              .from('module_lessons')
              .select('title')
              .eq('id', lessonId)
              .single();
            
            if (lessonData && !lessonError) {
              // Update the lesson breadcrumb with actual title
              for (let i = 0; i < updatedItems.length; i++) {
                if (updatedItems[i].isLoading && updatedItems[i].path.includes(`/lesson/${lessonId}`)) {
                  updatedItems[i] = {
                    ...updatedItems[i],
                    label: lessonData.title,
                    isLoading: false
                  };
                  break;
                }
              }
            }
          } catch (error) {
            console.error("Error fetching lesson title:", error);
          }
        }
        
        setItems(updatedItems);
        setIsLoading(false);
      };
      
      fetchModuleAndLessonTitles();
    }
  }, [location.pathname]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full py-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <li>
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-primary-600 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  item.label
                )}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-primary-600 transition-colors"
              >
                {item.isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
