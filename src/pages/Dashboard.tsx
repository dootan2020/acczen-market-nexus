
import { useLocation } from "react-router-dom";
import DashboardComponent from "../components/dashboard/Dashboard";
import PurchasesPage from "../components/dashboard/PurchasesPage";
import DepositHistoryPage from "../components/dashboard/DepositHistoryPage";
import SettingsPage from "../components/dashboard/SettingsPage";

const Dashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  // Render the appropriate component based on the current path
  const renderDashboardContent = () => {
    if (path.includes("/dashboard/purchases")) {
      return <PurchasesPage />;
    } else if (path.includes("/dashboard/history")) {
      return <DepositHistoryPage />;
    } else if (path.includes("/dashboard/settings")) {
      return <SettingsPage />;
    } else {
      return <DashboardComponent />;
    }
  };

  return renderDashboardContent();
};

export default Dashboard;
