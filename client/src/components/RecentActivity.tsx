import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingCart, 
  PackagePlus, 
  Edit, 
  Package2,
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  type: string;
  description: string;
  amount?: string;
  time: string;
  icon: string;
}

const iconMap = {
  'shopping-cart': ShoppingCart,
  'package-plus': PackagePlus,
  'edit': Edit,
  'package': Package2,
  'trending-up': TrendingUp,
};

const typeColors = {
  sale: 'bg-green-100 text-green-600',
  product_added: 'bg-blue-100 text-blue-600',
  stock_updated: 'bg-orange-100 text-orange-600',
  default: 'bg-gray-100 text-gray-600',
};

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['/api/dashboard/activity'],
  });

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activity</span>
            <Skeleton className="h-4 w-16" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500">Activity will appear here as you use the system</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Package2;
            const colorClass = typeColors[activity.type as keyof typeof typeColors] || typeColors.default;
            const timeAgo = formatTimeAgo(new Date(activity.time));
            
            return (
              <div
                key={`${activity.type}-${activity.time}-${index}`}
                className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", colorClass)}>
                  <IconComponent className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{timeAgo}</p>
                </div>
                
                <div className="text-right">
                  {activity.amount && (
                    <p className={cn(
                      "text-sm font-medium",
                      activity.amount.startsWith('+') 
                        ? "text-green-600" 
                        : "text-gray-700"
                    )}>
                      {activity.amount}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
