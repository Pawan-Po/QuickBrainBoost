import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CameraComponent } from '@/components/Camera';
import { ProductForm } from '@/components/ProductForm';
import { ProductCard } from '@/components/ProductCard';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Search, 
  Plus, 
  Filter, 
  Package,
  Store,
  Camera,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { type ProductWithCategory, type Category } from '@shared/schema';

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: searchQuery ? ['/api/products', { search: searchQuery }] : ['/api/products'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const handleCameraCapture = (data: any, imageData: string) => {
    setExtractedData(data);
    setCapturedImage(imageData);
    setIsProductFormOpen(true);
  };

  const handleProductFormClose = () => {
    setIsProductFormOpen(false);
    setExtractedData(null);
    setCapturedImage('');
    setEditingProduct(null);
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setExtractedData(null);
    setCapturedImage('');
    setIsProductFormOpen(true);
  };

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.categoryId?.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'stock':
        comparison = a.stock - b.stock;
        break;
      case 'category':
        comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const lowStockCount = filteredProducts?.filter(p => p.stock <= p.minStock).length || 0;
  const outOfStockCount = filteredProducts?.filter(p => p.stock === 0).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Store className="h-6 w-6" />
              <h1 className="text-xl font-medium">Inventory</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="text-white hover:bg-white/10"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="text-white hover:bg-white/10"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Stats */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search products, barcodes, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 w-full"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredProducts?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Products</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
                  <p className="text-sm text-gray-600">Low Stock</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {categories?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Categories</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters & Sorting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="stock">Stock Level</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full justify-start"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <SortAsc className="h-4 w-4 mr-2" />
                        Ascending
                      </>
                    ) : (
                      <>
                        <SortDesc className="h-4 w-4 mr-2" />
                        Descending
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid/List */}
        {productsLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
          }`}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                showActions={true}
                showStockActions={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'No products found' 
                    : 'No products yet'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first product to the inventory'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                  <Button variant="outline" onClick={() => setIsCameraOpen(true)}>
                    <Camera className="h-4 w-4 mr-2" />
                    Scan Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col space-y-3 z-30">
        <Button
          className="w-12 h-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCameraOpen(true)}
        >
          <Camera className="h-5 w-5" />
        </Button>
        <Button
          className="w-14 h-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
          onClick={handleAddProduct}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Camera Modal */}
      <CameraComponent
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={handleProductFormClose}
        extractedData={extractedData}
        imageData={capturedImage}
        editProduct={editingProduct}
      />
    </div>
  );
}
