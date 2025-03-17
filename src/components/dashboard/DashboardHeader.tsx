
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BreadcrumbSimple } from "@/components/ui/breadcrumbs/BreadcrumbSimple";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface DashboardHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
}

export const DashboardHeader = ({ breadcrumbItems }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <BreadcrumbSimple items={breadcrumbItems} />
    </div>
  );
};
