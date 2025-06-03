import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { insertProductSchema, type Category } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const productFormSchema = insertProductSchema.extend({
  categoryId: z.number().min(1, 'Category is required'),
  price: z.string().min(1, 'Price is required'),
  stock: z.number().min(0, 'Stock must be 0 or greater'),
  minStock: z.number().min(0, 'Min stock must be 0 or greater'),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData?: any;
  imageData?: string;
  editProduct?: any;
}

export function ProductForm({ isOpen, onClose, extractedData, imageData, editProduct }: ProductFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      barcode: '',
      price: '',
      cost: '',
      stock: 0,
      minStock: 5,
      categoryId: 0,
      description: '',
      imageUrl: '',
      isActive: true,
    },
  });

  // Populate form with extracted data
  useEffect(() => {
    if (extractedData && isOpen) {
      const updates: Partial<ProductFormData> = {};
      
      if (extractedData.name) {
        updates.name = extractedData.name;
      }
      
      if (extractedData.price) {
        // Remove currency symbols and parse
        const priceStr = extractedData.price.replace(/[$,]/g, '');
        updates.price = priceStr;
      }
      
      if (extractedData.barcode) {
        updates.barcode = extractedData.barcode;
      }
      
      if (extractedData.description || extractedData.weight) {
        const description = [extractedData.description, extractedData.weight]
          .filter(Boolean)
          .join(' - ');
        updates.description = description;
      }

      if (imageData) {
        updates.imageUrl = imageData;
      }

      // Auto-select category based on common patterns
      if (extractedData.name && categories) {
        const name = extractedData.name.toLowerCase();
        let categoryName = '';
        
        if (name.includes('coffee') || name.includes('tea') || name.includes('drink') || name.includes('beverage')) {
          categoryName = 'Beverages';
        } else if (name.includes('food') || name.includes('snack') || name.includes('pasta') || name.includes('bread')) {
          categoryName = 'Food';
        } else if (name.includes('health') || name.includes('medicine') || name.includes('vitamin') || name.includes('sanitizer')) {
          categoryName = 'Health';
        } else if (name.includes('clean') || name.includes('soap') || name.includes('detergent') || name.includes('household')) {
          categoryName = 'Household';
        }
        
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (category) {
          updates.categoryId = category.id;
          setSelectedCategory(category.id.toString());
        }
      }

      Object.entries(updates).forEach(([key, value]) => {
        form.setValue(key as keyof ProductFormData, value as any);
      });
    }
  }, [extractedData, imageData, isOpen, categories, form]);

  // Populate form with edit data
  useEffect(() => {
    if (editProduct && isOpen) {
      form.reset({
        name: editProduct.name || '',
        barcode: editProduct.barcode || '',
        price: editProduct.price || '',
        cost: editProduct.cost || '',
        stock: editProduct.stock || 0,
        minStock: editProduct.minStock || 5,
        categoryId: editProduct.categoryId || 0,
        description: editProduct.description || '',
        imageUrl: editProduct.imageUrl || '',
        isActive: editProduct.isActive !== false,
      });
      
      if (editProduct.categoryId) {
        setSelectedCategory(editProduct.categoryId.toString());
      }
    }
  }, [editProduct, isOpen, form]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';
      
      return await apiRequest(method, url, {
        ...data,
        price: parseFloat(data.price),
        cost: data.cost ? parseFloat(data.cost) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: editProduct ? "Product updated" : "Product created",
        description: editProduct ? "Product has been updated successfully" : "Product has been added to inventory",
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setSelectedCategory('');
    onClose();
  };

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Preview image if available */}
          {(imageData || editProduct?.imageUrl) && (
            <div className="mb-4">
              <img
                src={imageData || editProduct?.imageUrl}
                alt="Product preview"
                className="w-full h-32 object-cover rounded-lg bg-gray-100"
              />
            </div>
          )}

          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter product name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                {...form.register('price')}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                {...form.register('cost')}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              {...form.register('barcode')}
              placeholder="Enter or scan barcode"
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                setSelectedCategory(value);
                form.setValue('categoryId', parseInt(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Current Stock *</Label>
              <Input
                id="stock"
                {...form.register('stock', { valueAsNumber: true })}
                placeholder="0"
                type="number"
                min="0"
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.stock.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="minStock">Min. Stock *</Label>
              <Input
                id="minStock"
                {...form.register('minStock', { valueAsNumber: true })}
                placeholder="5"
                type="number"
                min="0"
              />
              {form.formState.errors.minStock && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.minStock.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Product description"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
              className="flex-1"
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                editProduct ? 'Update Product' : 'Save Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
