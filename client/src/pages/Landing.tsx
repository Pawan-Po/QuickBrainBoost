import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Store, 
  Camera, 
  QrCode, 
  ShoppingCart, 
  BarChart3, 
  Package,
  Smartphone,
  Clock,
  Shield
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Camera,
      title: 'OCR Product Scanning',
      description: 'Capture product photos and extract information automatically using advanced OCR technology.'
    },
    {
      icon: QrCode,
      title: 'Barcode Support',
      description: 'Scan barcodes for quick product lookup and inventory management.'
    },
    {
      icon: ShoppingCart,
      title: 'Point of Sale',
      description: 'Complete POS system with receipt generation and payment processing.'
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock levels, get low stock alerts, and manage product categories.'
    },
    {
      icon: BarChart3,
      title: 'Sales Analytics',
      description: 'Monitor daily sales, track top products, and generate detailed reports.'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Optimized for tablets and phones with touch-friendly interface.'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Quickly add products by simply taking a photo instead of manual data entry.'
    },
    {
      icon: Shield,
      title: 'Reduce Errors',
      description: 'OCR technology minimizes human error in product information entry.'
    },
    {
      icon: Store,
      title: 'Grow Your Business',
      description: 'Professional POS system helps you serve customers faster and track growth.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ShopSmart POS</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Inventory Management
            <span className="block text-blue-600">for Small Shops</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Revolutionize your shop with OCR-powered product scanning, intelligent inventory tracking, 
            and a complete point-of-sale system designed for modern retailers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Shop
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From photo-based product entry to comprehensive sales analytics, 
              ShopSmart POS has all the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ShopSmart POS?
            </h2>
            <p className="text-xl text-gray-600">
              Built specifically for small shop owners who want to modernize their operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Shop?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of shop owners who have modernized their operations with ShopSmart POS.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Store className="h-8 w-8" />
              <span className="text-xl font-bold">ShopSmart POS</span>
            </div>
            <p className="text-gray-400">
              © 2024 ShopSmart POS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
