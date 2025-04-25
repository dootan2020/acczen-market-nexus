
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DashboardHeader() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  return (
    <div className="border-b">
      <div className="container flex items-center gap-4 h-14">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {paths.length > 1 && (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {paths[1].charAt(0).toUpperCase() + paths[1].slice(1)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
