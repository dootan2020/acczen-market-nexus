
import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  Wallet, 
  ArrowUpRight,
  BarChart,
  CurrencyIcon
} from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StatsData, ChartData } from '@/types/reports';

// Format currency function
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

interface DashboardOverviewProps {
  statsData: StatsData;
  revenueChartData: ChartData[];
  ordersChartData: ChartData[];
  paymentMethodData: ChartData[];
  isLoading: boolean;
}

export function DashboardOverview({
  statsData,
  revenueChartData,
  ordersChartData,
  paymentMethodData,
  isLoading
}: DashboardOverviewProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Loading..."
          value="--"
          icon={<Users className="h-4 w-4" />}
          loading={true}
        />
        <StatCard
          title="Loading..."
          value="--"
          icon={<ShoppingBag className="h-4 w-4" />}
          loading={true}
        />
        <StatCard
          title="Loading..."
          value="--"
          icon={<Wallet className="h-4 w-4" />}
          loading={true}
        />
        <StatCard
          title="Loading..."
          value="--"
          icon={<ArrowUpRight className="h-4 w-4" />}
          loading={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={statsData.totalUsers}
          icon={<Users className="h-4 w-4" />}
          description={`${statsData.activeUsers} active users`}
          percentChange={statsData.conversionRate}
          trend="up"
        />
        <StatCard
          title="Total Orders"
          value={statsData.totalOrders}
          icon={<ShoppingBag className="h-4 w-4" />}
          description="Processed orders"
          percentChange={10.3}
          trend="up"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(statsData.totalDepositAmount)}
          icon={<Wallet className="h-4 w-4" />}
          description="From all transactions"
          percentChange={5.1}
          trend="up"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(statsData.averageOrderValue)}
          icon={<CurrencyIcon className="h-4 w-4" />}
          description="Per transaction"
          percentChange={2.4}
          trend="down"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2ECC71" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={ordersChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Orders']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3498DB" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1 text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
              <div className="space-y-1 text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData.activeUsers}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="space-y-1 text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData.conversionRate}%</div>
                <div className="text-xs text-muted-foreground">Conversion Rate</div>
              </div>
              <div className="space-y-1 text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData.totalDeposits}</div>
                <div className="text-xs text-muted-foreground">Total Deposits</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
