import {
  LayoutDashboard,
  ListChecks,
  ShoppingCart,
  Users,
  DollarSign,
  Activity,
  Boxes,
  Puzzle,
  TrendingUp,
  Settings,
  Bell,
  Coins,
  Award
} from "lucide-react"

import { MainNavItem, SidebarNavItem } from "@/types"

interface Props {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export function AdminSidebar({ mainNav, sidebarNav }: Props) {
  return (
    <div className="flex flex-col space-y-6 w-64">
      <nav className="flex flex-col space-y-1">
        {mainNav?.map((item, index) => (
          <SidebarNavItem key={index} item={item} />
        ))}
      </nav>
      <div className="flex-1 space-y-4">
        <nav className="flex flex-col space-y-1">
          {sidebarNav?.map((item, index) => (
            <SidebarNavItem key={index} item={item} />
          ))}
        </nav>
        <div className="flex flex-col space-y-1">
          <div className="px-3 py-2 text-sm font-medium">
            Marketing
          </div>
          <nav className="grid gap-1">
            {marketingItems?.map((item, index) => (
              <SidebarNavItem key={index} item={item} />
            ))}
          </nav>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="px-3 py-2 text-sm font-medium">
            Integrations
          </div>
          <nav className="grid gap-1">
            {integrationItems?.map((item, index) => (
              <SidebarNavItem key={index} item={item} />
            ))}
          </nav>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="px-3 py-2 text-sm font-medium">
            Settings
          </div>
          <nav className="grid gap-1">
            {settingsItems?.map((item, index) => (
              <SidebarNavItem key={index} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

const marketingItems = [
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: <Bell className="h-4 w-4" />,
    label: "228",
  },
  {
    title: "Exchange Rates",
    href: "/admin/exchange-rates",
    icon: <Coins className="h-4 w-4" />
  },
  {
    title: "Thành viên",
    href: "/admin/marketing/loyalty",
    icon: <Award className="h-4 w-4" />
  },
];

const integrationItems = [
  {
    title: "Product Integration",
    href: "/admin/integrations",
    icon: <Puzzle className="h-4 w-4" />,
  },
  {
    title: "API Monitoring",
    href: "/admin/api-monitoring",
    icon: <Activity className="h-4 w-4" />,
  }
]

const settingsItems = [
  {
    title: "General",
    href: "/admin/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: <TrendingUp className="h-4 w-4" />,
  }
]
