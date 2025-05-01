import React from 'react';
import { LayoutDashboard, ShoppingBag, Users, DollarSign, Package, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Box, User, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Mock data for revenue chart
const revenueData = [
  { name: 'Jan', revenue: 1200 },
  { name: 'Feb', revenue: 1900 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2400 },
  { name: 'May', revenue: 1800 },
  { name: 'Jun', revenue: 3000 },
  { name: 'Jul', revenue: 3500 },
];

// Mock data for category distribution
const categoryData = [
  { name: 'Email Accounts', value: 400 },
  { name: 'Social Accounts', value: 300 },
  { name: 'Software Keys', value: 500 },
  { name: 'Other', value: 200 },
];

// Mock data for recent orders
const recentOrders = [
  { id: 'ORD-123', customer: 'John Doe', product: 'Gmail Accounts', amount: '$45.00', status: 'completed', date: '2 hours ago' },
  { id: 'ORD-122', customer: 'Jane Smith', product: 'Instagram Accounts', amount: '$89.00', status: 'processing', date: '4 hours ago' },
  { id: 'ORD-121', customer: 'Robert Johnson', product: 'Windows Keys', amount: '$25.00', status: 'completed', date: '6 hours ago' },
  { id: 'ORD-120', customer: 'Emily Davis', product: 'Twitter Accounts', amount: '$59.00', status: 'completed', date: '8 hours ago' },
  { id: 'ORD-119', customer: 'Michael Brown', product: 'Office Keys', amount: '$125.00', status: 'pending', date: '10 hours ago' },
];

// Mock data for recent activities
const recentActivities = [
  { type: 'signup', user: 'thomas.m', action: 'registered an account', time: '15 minutes ago' },
  { type: 'purchase', user: 'angela.w', action: 'purchased 5 Gmail accounts', time: '1 hour ago' },
  { type: 'review', user: 'robert.k', action: 'left a 5-star review', time: '2 hours ago' },
  { type: 'deposit', user: 'karen.j', action: 'deposited $200 via PayPal', time: '3 hours ago' },
  { type: 'purchase', user: 'james.b', action: 'purchased Windows 10 keys', time: '5 hours ago' },
];

// Colors for pie chart
const COLORS = ['#19C37D', '#3498DB', '#F1C40F', '#E74C3C'];

// Mini chart data
const miniChartData = [
  { name: '1', value: 12 },
  { name: '2', value: 18 },
  { name: '3', value: 15 },
  { name: '4', value: 20 },
  { name: '5', value: 22 },
  { name: '6', value: 25 },
  { name: '7', value: 30 },
];

const AdminHome = () => {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">$45,678</div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="flex items-center text-[#19C37D] mr-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />8.3%
                </span>
                from last month
              </div>
              <div className="h-10 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniChartData}>
                    <Area type="monotone" dataKey="value" stroke="#19C37D" fill="#19C37D" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">12,234</div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="flex items-center text-[#19C37D] mr-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />12%
                </span>
                from last month
              </div>
              <div className="h-10 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniChartData}>
                    <Line type="monotone" dataKey="value" stroke="#19C37D" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">1,247</div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="flex items-center text-[#19C37D] mr-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />5.2%
                </span>
                <span>+124 new</span>
              </div>
              <div className="h-10 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={miniChartData}>
                    <Bar dataKey="value" fill="#19C37D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">458</div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="flex items-center text-[#E74C3C] mr-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />3.2%
                </span>
                <span>32 out of stock</span>
              </div>
              <div className="h-10 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniChartData}>
                    <Line type="monotone" dataKey="value" stroke="#19C37D" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="border shadow-sm md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <Tabs defaultValue="daily" className="w-[270px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#19C37D" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#19C37D" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#19C37D" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border shadow-sm md:col-span-3">
          <CardHeader>
            <CardTitle>Orders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col items-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#19C37D] mr-2"></div>
                  <span>Email Accounts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#3498DB] mr-2"></div>
                  <span>Social Accounts</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Order ID</th>
                    <th className="px-6 py-2 font-medium">Product</th>
                    <th className="px-6 py-2 font-medium">Amount</th>
                    <th className="px-6 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={order.id} className={`text-sm ${i !== recentOrders.length - 1 ? 'border-b' : ''}`}>
                      <td className="px-6 py-3 flex flex-col">
                        <span className="font-medium">{order.id}</span>
                        <span className="text-xs text-muted-foreground">{order.date}</span>
                      </td>
                      <td className="px-6 py-3 flex flex-col">
                        <span className="font-medium">{order.product}</span>
                        <span className="text-xs text-muted-foreground">{order.customer}</span>
                      </td>
                      <td className="px-6 py-3">{order.amount}</td>
                      <td className="px-6 py-3">
                        <Badge variant={
                          order.status === 'completed' ? 'outline' : 
                          order.status === 'processing' ? 'secondary' : 'destructive'
                        } className={
                          order.status === 'completed' ? 'bg-[#19C37D]/10 text-[#19C37D] hover:bg-[#19C37D]/20 hover:text-[#19C37D]' : ''
                        }>
                          {order.status === 'completed' ? 'Completed' : 
                           order.status === 'processing' ? 'Processing' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`mt-1 p-1.5 rounded-full 
                    ${activity.type === 'signup' ? 'bg-[#3498DB]/10 text-[#3498DB]' : 
                      activity.type === 'purchase' ? 'bg-[#19C37D]/10 text-[#19C37D]' : 
                      activity.type === 'review' ? 'bg-[#F1C40F]/10 text-[#F1C40F]' : 
                      'bg-[#E74C3C]/10 text-[#E74C3C]'}`}>
                    {activity.type === 'signup' && <User className="h-4 w-4" />}
                    {activity.type === 'purchase' && <ShoppingBag className="h-4 w-4" />}
                    {activity.type === 'review' && <Star className="h-4 w-4" />}
                    {activity.type === 'deposit' && <CreditCard className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">{activity.user}</span> {activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
