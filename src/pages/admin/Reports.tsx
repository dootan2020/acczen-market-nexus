
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Download, BarChart4, LineChart, PieChart, RefreshCw, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from 'date-fns';
import { 
  AreaChart, Area, BarChart, Bar, LineChart as ReLineChart, Line, PieChart as RePieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useReportsData, DateRangeType } from '@/hooks/admin/useReportsData';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    data,
    isLoading,
    dateRangeType,
    dateRange,
    handleDateRangeTypeChange,
    handleCustomDateRangeChange,
    refetch
  } = useReportsData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleExportExcel = () => {
    if (!data) return;

    const workbook = XLSX.utils.book_new();
    
    // Overview sheet
    const overviewData = [
      ['Report Date Range', `${format(dateRange.from, 'PP')} to ${format(dateRange.to, 'PP')}`],
      ['Generated On', format(new Date(), 'PPpp')],
      [''],
      ['Revenue Statistics'],
      ['Total Revenue', formatCurrency(data.revenueStats.total)],
      ['Average Order Value', formatCurrency(data.revenueStats.average)],
      ['Revenue Change', `${data.revenueStats.percentChange.toFixed(2)}%`],
      [''],
      ['Order Statistics'],
      ['Total Orders', data.ordersStats.total],
      ['Completed Orders', data.ordersStats.completed],
      ['Pending Orders', data.ordersStats.pending],
      ['Failed Orders', data.ordersStats.failed],
      [''],
      ['User Statistics'],
      ['Total Users', data.usersStats.total],
      ['New Users', data.usersStats.new],
    ];
    
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
    
    // Revenue by Day sheet
    const revenueData = [
      ['Date', 'Revenue'],
      ...data.revenueByDay.map(item => [item.date, item.revenue])
    ];
    
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue by Day');
    
    // Orders by Day sheet
    const ordersData = [
      ['Date', 'Orders'],
      ...data.ordersByDay.map(item => [item.date, item.count])
    ];
    
    const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders by Day');
    
    // Top Products sheet
    const topProductsData = [
      ['Product Name', 'Sales Count', 'Revenue'],
      ...data.topProducts.map(product => [product.name, product.sales, product.revenue])
    ];
    
    const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Top Products');
    
    // Write and download the file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Use date range for filename
    const filename = `report_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;
    saveAs(blob, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isLoading || !data}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
      
      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date Range:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={dateRangeType === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeTypeChange('today')}
            >
              Today
            </Button>
            <Button 
              variant={dateRangeType === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeTypeChange('7days')}
            >
              Last 7 Days
            </Button>
            <Button 
              variant={dateRangeType === '30days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeTypeChange('30days')}
            >
              Last 30 Days
            </Button>
          </div>
          
          <DatePicker
            date={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              if (range?.from && range.to) {
                handleCustomDateRangeChange({ from: range.from, to: range.to });
              }
            }}
          />
          
          <div className="text-sm text-muted-foreground ml-auto">
            Showing data from <span className="font-medium">{format(dateRange.from, 'MMM d, yyyy')}</span> to <span className="font-medium">{format(dateRange.to, 'MMM d, yyyy')}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : data ? (
              <>
                <div className="text-3xl font-bold">{formatCurrency(data.revenueStats.total)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avg. Order Value: {formatCurrency(data.revenueStats.average)}
                </div>
                <div className={`text-xs mt-1 ${data.revenueStats.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.revenueStats.percentChange >= 0 ? '↑' : '↓'} {Math.abs(data.revenueStats.percentChange).toFixed(1)}% from previous period
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : data ? (
              <>
                <div className="text-3xl font-bold">{data.ordersStats.total}</div>
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-green-500">{data.ordersStats.completed} completed</span>
                  <span className="text-yellow-500">{data.ordersStats.pending} pending</span>
                  <span className="text-red-500">{data.ordersStats.failed} failed</span>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : data ? (
              <>
                <div className="text-3xl font-bold">{data.usersStats.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.usersStats.new} new users in this period
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Products
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Revenue Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : data && data.revenueByDay.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.revenueByDay}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#19C37D" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#19C37D" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return format(date, 'MMM d');
                        }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return format(date, 'MMM d, yyyy');
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#19C37D" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No revenue data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Orders Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : data && data.ordersByDay.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.ordersByDay}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return format(date, 'MMM d');
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Orders']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return format(date, 'MMM d, yyyy');
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Orders" fill="#3498DB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No order data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6 pt-4">
          {/* Revenue Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : data && data.revenueByDay.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.revenueByDay.map(item => ({
                        ...item,
                        day: format(new Date(item.date), 'EEEE')
                      })).reduce((acc, curr) => {
                        const existingDay = acc.find(item => item.day === curr.day);
                        if (existingDay) {
                          existingDay.revenue += curr.revenue;
                        } else {
                          acc.push({ day: curr.day, revenue: curr.revenue });
                        }
                        return acc;
                      }, [] as {day: string, revenue: number}[]).sort((a, b) => {
                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        return days.indexOf(a.day) - days.indexOf(b.day);
                      })}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#19C37D" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No revenue data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Top Revenue Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue-Generating Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : data && data.topProducts.length > 0 ? (
                <>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.topProducts}
                        margin={{ top: 10, right: 30, left: 40, bottom: 40 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={150}
                          tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                        />
                        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#F1C40F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left font-medium">Product</th>
                          <th className="py-3 px-4 text-right font-medium">Units Sold</th>
                          <th className="py-3 px-4 text-right font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topProducts.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="py-2 px-4">{product.name}</td>
                            <td className="py-2 px-4 text-right">{product.sales}</td>
                            <td className="py-2 px-4 text-right">{formatCurrency(product.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No product revenue data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6 pt-4">
          {/* Products by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Products Sold by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : data && data.productsByCategory.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={data.productsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.productsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#19C37D', '#3498DB', '#F1C40F', '#E74C3C', '#9B59B6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Units Sold']} />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No category data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products (Units)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : data && data.topProducts.length > 0 ? (
                <>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.topProducts}
                        margin={{ top: 10, right: 30, left: 40, bottom: 40 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={150}
                          tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                        />
                        <Tooltip formatter={(value) => [value, 'Units Sold']} />
                        <Legend />
                        <Bar dataKey="sales" name="Units Sold" fill="#9B59B6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No product sales data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
