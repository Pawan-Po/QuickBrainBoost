import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, AlertTriangle, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStatsData {
  dailySales: string;
  totalProducts: number;
  lowStockCount: number;
  transactionCount: number;
}

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStatsData>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Sales",
      value: `$${stats?.dailySales || '0.00'}`,
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: "Total Products",
      value: stats?.totalProducts?.toLocaleString() || '0',
      icon: Package,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount?.toString() || '0',
      icon: AlertTriangle,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: "Transactions",
      value: stats?.transactionCount?.toString() || '0',
      icon: Receipt,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
