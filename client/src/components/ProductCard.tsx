import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Package2, 
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type ProductWithCategory } from '@shared/schema';

interface ProductCardProps {
  product: ProductWithCategory;
  onEdit: (product: ProductWithCategory) => void;
  onAddToCart?: (product: ProductWithCategory) => void;
  showActions?: boolean;
  showStockActions?: boolean;
}

export function ProductCard({ 
  product, 
  onEdit, 
  onAddToCart, 
  showActions = true,
  showStockActions = false 
}: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/products/${product.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Product deleted",
        description: "Product has been removed from inventory",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ quantity, type }: { quantity: number; type: string }) => {
      await apiRequest('POST', `/api/products/${product.id}/stock`, {
        quantity,
        type,
        reason: type === 'adjustment' ? 'Manual adjustment' : 'Quick stock update',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Stock updated",
        description: "Product stock has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdatingStock(false);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(true);
      deleteProductMutation.mutate();
    }
  };

  const handleStockUpdate = (change: number) => {
    setIsUpdatingStock(true);
    updateStockMutation.mutate({
      quantity: change,
      type: 'adjustment',
    });
  };

  const isLowStock = product.stock <= product.minStock;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isLowStock && "ring-2 ring-orange-200"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</p>
              {product.barcode && (
                <p className="text-xs text-gray-400 font-mono">{product.barcode}</p>
              )}
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">${product.price}</span>
            {product.cost && (
              <span className="text-sm text-gray-500">
                (Cost: ${product.cost})
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <Badge variant={isLowStock ? "destructive" : "secondary"}>
              {product.stock} in stock
            </Badge>
          </div>
        </div>

        {showStockActions && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Quick Stock Update:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleStockUpdate(-1)}
                disabled={isUpdatingStock || product.stock <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[3rem] text-center">
                {product.stock}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleStockUpdate(1)}
                disabled={isUpdatingStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {onAddToCart && (
          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className="w-full"
            variant={product.stock <= 0 ? "secondary" : "default"}
          >
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}

        {product.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
