import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Calendar,
  Download,
  Store,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { type SaleWithItems } from '@shared/schema';

interface SalesReport {
  totalSales: string;
  totalTransactions: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: string;
  }>;
}

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: salesReport, isLoading: reportLoading } = useQuery<SalesReport>({
    queryKey: ['/api/reports/sales', { 
      startDate: dateRange.start, 
      endDate: dateRange.end 
    }],
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery<SaleWithItems[]>({
    queryKey: ['/api/sales', { limit: 20 }],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const exportData = (type: 'sales' | 'products') => {
    // In a real implementation, this would generate and download a CSV/Excel file
    console.log(`Exporting ${type} data for ${dateRange.start} to ${dateRange.end}`);
  };

  const calculateGrowth = () => {
    // This would calculate growth compared to previous period
    // For now, showing mock data
    return {
      sales: 12.5,
      transactions: 8.3,
    };
  };

  const growth = calculateGrowth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Store className="h-6 w-6" />
              <h1 className="text-xl font-medium">Reports & Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Range Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Report Period
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('sales')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Sales
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('products')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Products
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reportLoading ? '...' : salesReport?.totalSales || '0.00'}
                  </p>
                  <div className="flex items-center mt-1">
                    {growth.sales > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${growth.sales > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(growth.sales)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportLoading ? '...' : salesReport?.totalTransactions || '0'}
                  </p>
                  <div className="flex items-center mt-1">
                    {growth.transactions > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${growth.transactions > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(growth.transactions)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportLoading || !salesReport ? '...' : 
                      salesReport.totalTransactions > 0 
                        ? `$${(parseFloat(salesReport.totalSales) / salesReport.totalTransactions).toFixed(2)}`
                        : '$0.00'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardStats?.dailySales || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="transactions">Recent Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading report...</p>
                    </div>
                  ) : salesReport ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-bold">${salesReport.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Transactions:</span>
                        <span className="font-bold">{salesReport.totalTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average per Transaction:</span>
                        <span className="font-bold">
                          ${salesReport.totalTransactions > 0 
                            ? (parseFloat(salesReport.totalSales) / salesReport.totalTransactions).toFixed(2)
                            : '0.00'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="font-bold">
                          {format(new Date(dateRange.start), 'MMM dd')} - {format(new Date(dateRange.end), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No data available for selected period</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-medium">Revenue Growth</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +{growth.sales}%
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Compared to previous period
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">Transaction Growth</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          +{growth.transactions}%
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        More customers served
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-800 font-medium">Low Stock Items</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {dashboardStats?.lowStockCount || 0}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-600 mt-1">
                        Need restocking attention
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                {reportLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading top products...</p>
                  </div>
                ) : salesReport?.topProducts && salesReport.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {salesReport.topProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${product.revenue}</p>
                          <p className="text-sm text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No product sales in selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading transactions...</p>
                  </div>
                ) : recentSales && recentSales.length > 0 ? (
                  <div className="space-y-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Receipt #{sale.receiptNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items • {' '}
                            {sale.customerName || 'Walk-in customer'} • {' '}
                            {format(new Date(sale.createdAt!), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${sale.total}</p>
                          <Badge variant="secondary" className="capitalize">
                            {sale.paymentMethod}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
