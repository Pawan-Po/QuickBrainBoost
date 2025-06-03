import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CameraComponent } from '@/components/Camera';
import { ProductForm } from '@/components/ProductForm';
import { DashboardStats } from '@/components/DashboardStats';
import { LowStockAlerts } from '@/components/LowStockAlerts';
import { RecentActivity } from '@/components/RecentActivity';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Camera, 
  QrCode, 
  ShoppingCart, 
  BarChart3, 
  Search,
  Plus,
  Store
} from 'lucide-react';
import { Link } from 'wouter';

export default function Dashboard() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);

  const handleCameraCapture = (data: any, imageData: string) => {
    setExtractedData(data);
    setCapturedImage(imageData);
    setIsProductFormOpen(true);
  };

  const handleProductFormClose = () => {
    setIsProductFormOpen(false);
    setExtractedData(null);
    setCapturedImage('');
  };

  const quickActions = [
    {
      title: 'Scan Product',
      description: 'Add via camera',
      icon: Camera,
      action: () => setIsCameraOpen(true),
      color: 'border-blue-500 hover:bg-blue-50 text-blue-600',
    },
    {
      title: 'Scan Barcode',
      description: 'Quick lookup',
      icon: QrCode,
      action: () => setIsCameraOpen(true),
      color: 'border-blue-500 hover:bg-blue-50 text-blue-600',
    },
    {
      title: 'New Sale',
      description: 'Start checkout',
      icon: ShoppingCart,
      action: () => {},
      color: 'border-green-500 hover:bg-green-50 text-green-600',
      link: '/pos',
    },
    {
      title: 'Reports',
      description: 'View analytics',
      icon: BarChart3,
      action: () => {},
      color: 'border-yellow-500 hover:bg-yellow-50 text-yellow-600',
      link: '/reports',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Store className="h-6 w-6" />
              <h1 className="text-xl font-medium">ShopSmart POS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="text-white hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white shadow-md border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products, barcodes, or categories..."
                className="pl-12 pr-4 py-3 w-full"
              />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <Card className="shadow-md p-6 mb-8">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const content = (
                  <div
                    className={`
                      flex flex-col items-center justify-center p-6 
                      border-2 border-dashed rounded-lg transition-colors cursor-pointer
                      ${action.color}
                    `}
                    onClick={action.action}
                  >
                    <action.icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">{action.title}</span>
                    <span className="text-xs text-gray-500 mt-1">{action.description}</span>
                  </div>
                );

                return action.link ? (
                  <Link key={action.title} href={action.link}>
                    <a>{content}</a>
                  </Link>
                ) : (
                  <div key={action.title}>{content}</div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <LowStockAlerts />

        {/* Recent Activity */}
        <RecentActivity />
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-30"
        onClick={() => setIsCameraOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

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
      />
    </div>
  );
}
