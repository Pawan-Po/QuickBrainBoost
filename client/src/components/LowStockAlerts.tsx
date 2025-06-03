import { useQuery } from '@tanstack/react-query';
import { Package2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type ProductWithCategory } from '@shared/schema';

export function LowStockAlerts() {
  const { data: lowStockProducts, isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products/low-stock'],
  });

  if (isLoading) {
    return (
      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Low Stock Alerts</span>
            <Skeleton className="h-5 w-16" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lowStockProducts || lowStockProducts.length === 0) {
    return (
      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Low Stock Alerts</span>
            <span className="text-sm text-gray-500">0 items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No low stock items</p>
            <p className="text-sm text-gray-500">All products are well stocked</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Low Stock Alerts</span>
          <span className="text-sm text-gray-500">{lowStockProducts.length} items</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className={cn(
                "p-4 rounded-lg transition-colors",
                "bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package2 className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {product.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-orange-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">
                      {product.stock} left
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">${product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {lowStockProducts.length > 5 && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View All Low Stock Items ({lowStockProducts.length - 5} more)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
