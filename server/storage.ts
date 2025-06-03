import {
  UserModel,
  CategoryModel,
  ProductModel,
  SaleModel,
  SaleItemModel,
  StockMovementModel,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductWithCategory,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type SaleWithItems,
  type StockMovement,
  type InsertStockMovement,
} from "@shared/schema";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Product operations
  getProducts(userId: string): Promise<ProductWithCategory[]>;
  getProduct(id: string, userId: string): Promise<ProductWithCategory | undefined>;
  getProductByBarcode(barcode: string, userId: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getLowStockProducts(userId: string): Promise<ProductWithCategory[]>;
  searchProducts(query: string, userId: string): Promise<ProductWithCategory[]>;

  // Sales operations
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems>;
  getSales(userId: string, limit?: number): Promise<SaleWithItems[]>;
  getSale(id: string, userId: string): Promise<SaleWithItems | undefined>;
  getDailySales(userId: string, date: Date): Promise<{ total: string; count: number }>;
  getSalesReport(userId: string, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalTransactions: number;
    topProducts: Array<{ name: string; quantity: number; revenue: string }>;
  }>;

  // Stock operations
  updateStock(productId: string, quantity: number, type: string, reason?: string, userId?: string): Promise<void>;
  getStockMovements(productId: string): Promise<StockMovement[]>;

  // Dashboard operations
  getDashboardStats(userId: string): Promise<{
    dailySales: string;
    totalProducts: number;
    lowStockCount: number;
    transactionCount: number;
  }>;
  getRecentActivity(userId: string, limit?: number): Promise<Array<{
    type: string;
    description: string;
    amount?: string;
    time: Date;
    icon: string;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    if (!user) return undefined;
    
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(
      userData.id,
      {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
      },
      { upsert: true, new: true }
    );

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    const categories = await CategoryModel.find({ userId }).sort({ createdAt: -1 });
    return categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      color: cat.color,
      userId: cat.userId,
      createdAt: cat.createdAt,
    }));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = new CategoryModel({
      _id: nanoid(),
      ...category,
    });
    const saved = await newCategory.save();
    
    return {
      id: saved._id,
      name: saved.name,
      color: saved.color,
      userId: saved.userId,
      createdAt: saved.createdAt,
    };
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const updated = await CategoryModel.findByIdAndUpdate(id, category, { new: true });
    if (!updated) throw new Error('Category not found');
    
    return {
      id: updated._id,
      name: updated.name,
      color: updated.color,
      userId: updated.userId,
      createdAt: updated.createdAt,
    };
  }

  async deleteCategory(id: string): Promise<void> {
    await CategoryModel.findByIdAndDelete(id);
  }

  // Product operations
  async getProducts(userId: string): Promise<ProductWithCategory[]> {
    const products = await ProductModel.find({ userId }).sort({ createdAt: -1 });
    const result: ProductWithCategory[] = [];
    
    for (const product of products) {
      let category = undefined;
      if (product.categoryId) {
        const cat = await CategoryModel.findById(product.categoryId);
        if (cat) {
          category = {
            id: cat._id.toString(),
            name: cat.name,
            color: cat.color,
            userId: cat.userId,
            createdAt: cat.createdAt,
          };
        }
      }
      
      result.push({
        id: product._id.toString(),
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        description: product.description,
        isActive: product.isActive,
        userId: product.userId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category,
      });
    }
    
    return result;
  }

  async getProduct(id: string, userId: string): Promise<ProductWithCategory | undefined> {
    const product = await ProductModel.findOne({ _id: id, userId });
    if (!product) return undefined;
    
    let category = undefined;
    if (product.categoryId) {
      const cat = await CategoryModel.findById(product.categoryId);
      if (cat) {
        category = {
          id: cat._id.toString(),
          name: cat.name,
          color: cat.color,
          userId: cat.userId,
          createdAt: cat.createdAt,
        };
      }
    }
    
    return {
      id: product._id.toString(),
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      description: product.description,
      isActive: product.isActive,
      userId: product.userId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category,
    };
  }

  async getProductByBarcode(barcode: string, userId: string): Promise<ProductWithCategory | undefined> {
    const product = await ProductModel.findOne({ barcode, userId });
    if (!product) return undefined;
    
    let category = undefined;
    if (product.categoryId) {
      const cat = await CategoryModel.findById(product.categoryId);
      if (cat) {
        category = {
          id: cat._id.toString(),
          name: cat.name,
          color: cat.color,
          userId: cat.userId,
          createdAt: cat.createdAt,
        };
      }
    }
    
    return {
      id: product._id.toString(),
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      description: product.description,
      isActive: product.isActive,
      userId: product.userId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category,
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = new ProductModel({
      _id: nanoid(),
      ...product,
    });
    const saved = await newProduct.save();
    
    return {
      id: saved._id,
      name: saved.name,
      barcode: saved.barcode,
      price: saved.price,
      cost: saved.cost,
      stock: saved.stock,
      minStock: saved.minStock,
      categoryId: saved.categoryId,
      imageUrl: saved.imageUrl,
      description: saved.description,
      isActive: saved.isActive,
      userId: saved.userId,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const updated = await ProductModel.findByIdAndUpdate(id, product, { new: true });
    if (!updated) throw new Error('Product not found');
    
    return {
      id: updated._id,
      name: updated.name,
      barcode: updated.barcode,
      price: updated.price,
      cost: updated.cost,
      stock: updated.stock,
      minStock: updated.minStock,
      categoryId: updated.categoryId,
      imageUrl: updated.imageUrl,
      description: updated.description,
      isActive: updated.isActive,
      userId: updated.userId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteProduct(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  async getLowStockProducts(userId: string): Promise<ProductWithCategory[]> {
    const products = await ProductModel.find({
      userId,
      $expr: { $lte: ["$stock", "$minStock"] }
    });
    
    const result: ProductWithCategory[] = [];
    for (const product of products) {
      let category = undefined;
      if (product.categoryId) {
        const cat = await CategoryModel.findById(product.categoryId);
        if (cat) {
          category = {
            id: cat._id.toString(),
            name: cat.name,
            color: cat.color,
            userId: cat.userId,
            createdAt: cat.createdAt,
          };
        }
      }
      
      result.push({
        id: product._id.toString(),
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        description: product.description,
        isActive: product.isActive,
        userId: product.userId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category,
      });
    }
    
    return result;
  }

  async searchProducts(query: string, userId: string): Promise<ProductWithCategory[]> {
    const products = await ProductModel.find({
      userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    
    const result: ProductWithCategory[] = [];
    for (const product of products) {
      let category = undefined;
      if (product.categoryId) {
        const cat = await CategoryModel.findById(product.categoryId);
        if (cat) {
          category = {
            id: cat._id.toString(),
            name: cat.name,
            color: cat.color,
            userId: cat.userId,
            createdAt: cat.createdAt,
          };
        }
      }
      
      result.push({
        id: product._id.toString(),
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        description: product.description,
        isActive: product.isActive,
        userId: product.userId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category,
      });
    }
    
    return result;
  }

  // Sales operations
  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems> {
    const saleId = nanoid();
    
    // Create the sale
    const newSale = new SaleModel({
      _id: saleId,
      ...sale,
    });
    const savedSale = await newSale.save();
    
    // Create sale items and update stock
    const createdItems: (SaleItem & { product: Product })[] = [];
    
    for (const item of items) {
      const saleItem = new SaleItemModel({
        _id: nanoid(),
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
      const savedItem = await saleItem.save();
      
      // Get product details
      const product = await ProductModel.findById(item.productId);
      if (product) {
        // Update stock
        await ProductModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
        
        // Record stock movement
        const stockMovement = new StockMovementModel({
          _id: nanoid(),
          productId: item.productId,
          type: 'sale',
          quantity: -item.quantity,
          reason: 'Sale transaction',
          referenceId: saleId,
          userId: sale.userId,
        });
        await stockMovement.save();
        
        createdItems.push({
          id: savedItem._id,
          saleId: savedItem.saleId,
          productId: savedItem.productId,
          quantity: savedItem.quantity,
          unitPrice: savedItem.unitPrice,
          totalPrice: savedItem.totalPrice,
          product: {
            id: product._id,
            name: product.name,
            barcode: product.barcode,
            price: product.price,
            cost: product.cost,
            stock: product.stock,
            minStock: product.minStock,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
            description: product.description,
            isActive: product.isActive,
            userId: product.userId,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          }
        });
      }
    }
    
    return {
      id: savedSale._id,
      total: savedSale.total,
      subtotal: savedSale.subtotal,
      tax: savedSale.tax,
      discount: savedSale.discount,
      paymentMethod: savedSale.paymentMethod,
      customerName: savedSale.customerName,
      receiptNumber: savedSale.receiptNumber,
      userId: savedSale.userId,
      createdAt: savedSale.createdAt,
      items: createdItems,
    };
  }

  async getSales(userId: string, limit = 50): Promise<SaleWithItems[]> {
    const sales = await SaleModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    const result: SaleWithItems[] = [];
    
    for (const sale of sales) {
      const items = await SaleItemModel.find({ saleId: sale._id });
      const itemsWithProducts: (SaleItem & { product: Product })[] = [];
      
      for (const item of items) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          itemsWithProducts.push({
            id: item._id,
            saleId: item.saleId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            product: {
              id: product._id,
              name: product.name,
              barcode: product.barcode,
              price: product.price,
              cost: product.cost,
              stock: product.stock,
              minStock: product.minStock,
              categoryId: product.categoryId,
              imageUrl: product.imageUrl,
              description: product.description,
              isActive: product.isActive,
              userId: product.userId,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
            }
          });
        }
      }
      
      result.push({
        id: sale._id,
        total: sale.total,
        subtotal: sale.subtotal,
        tax: sale.tax,
        discount: sale.discount,
        paymentMethod: sale.paymentMethod,
        customerName: sale.customerName,
        receiptNumber: sale.receiptNumber,
        userId: sale.userId,
        createdAt: sale.createdAt,
        items: itemsWithProducts,
      });
    }
    
    return result;
  }

  async getSale(id: string, userId: string): Promise<SaleWithItems | undefined> {
    const sale = await SaleModel.findOne({ _id: id, userId });
    if (!sale) return undefined;
    
    const items = await SaleItemModel.find({ saleId: id });
    const itemsWithProducts: (SaleItem & { product: Product })[] = [];
    
    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (product) {
        itemsWithProducts.push({
          id: item._id,
          saleId: item.saleId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          product: {
            id: product._id,
            name: product.name,
            barcode: product.barcode,
            price: product.price,
            cost: product.cost,
            stock: product.stock,
            minStock: product.minStock,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
            description: product.description,
            isActive: product.isActive,
            userId: product.userId,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          }
        });
      }
    }
    
    return {
      id: sale._id,
      total: sale.total,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      paymentMethod: sale.paymentMethod,
      customerName: sale.customerName,
      receiptNumber: sale.receiptNumber,
      userId: sale.userId,
      createdAt: sale.createdAt,
      items: itemsWithProducts,
    };
  }

  async getDailySales(userId: string, date: Date): Promise<{ total: string; count: number }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const sales = await SaleModel.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    return {
      total: total.toFixed(2),
      count: sales.length,
    };
  }

  async getSalesReport(userId: string, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalTransactions: number;
    topProducts: Array<{ name: string; quantity: number; revenue: string }>;
  }> {
    const sales = await SaleModel.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;
    
    // Get top products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    for (const sale of sales) {
      const items = await SaleItemModel.find({ saleId: sale._id });
      for (const item of items) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          const existing = productSales.get(item.productId) || { name: product.name, quantity: 0, revenue: 0 };
          existing.quantity += item.quantity;
          existing.revenue += item.totalPrice;
          productSales.set(item.productId, existing);
        }
      }
    }
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        quantity: p.quantity,
        revenue: p.revenue.toFixed(2),
      }));
    
    return {
      totalSales: totalSales.toFixed(2),
      totalTransactions,
      topProducts,
    };
  }

  // Stock operations
  async updateStock(productId: string, quantity: number, type: string, reason?: string, userId?: string): Promise<void> {
    await ProductModel.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } }
    );
    
    if (userId) {
      const stockMovement = new StockMovementModel({
        _id: nanoid(),
        productId,
        type,
        quantity,
        reason,
        userId,
      });
      await stockMovement.save();
    }
  }

  async getStockMovements(productId: string): Promise<StockMovement[]> {
    const movements = await StockMovementModel.find({ productId }).sort({ createdAt: -1 });
    return movements.map(movement => ({
      id: movement._id,
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      referenceId: movement.referenceId,
      userId: movement.userId,
      createdAt: movement.createdAt,
    }));
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<{
    dailySales: string;
    totalProducts: number;
    lowStockCount: number;
    transactionCount: number;
  }> {
    const today = new Date();
    const dailySales = await this.getDailySales(userId, today);
    
    const totalProducts = await ProductModel.countDocuments({ userId });
    const lowStockCount = await ProductModel.countDocuments({
      userId,
      $expr: { $lte: ["$stock", "$minStock"] }
    });
    
    return {
      dailySales: dailySales.total,
      totalProducts,
      lowStockCount,
      transactionCount: dailySales.count,
    };
  }

  async getRecentActivity(userId: string, limit = 10): Promise<Array<{
    type: string;
    description: string;
    amount?: string;
    time: Date;
    icon: string;
  }>> {
    const activities: Array<{
      type: string;
      description: string;
      amount?: string;
      time: Date;
      icon: string;
    }> = [];
    
    // Get recent sales
    const recentSales = await SaleModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    for (const sale of recentSales) {
      activities.push({
        type: 'sale',
        description: `Sale #${sale.receiptNumber}`,
        amount: `$${sale.total.toFixed(2)}`,
        time: sale.createdAt,
        icon: 'ShoppingCart',
      });
    }
    
    // Get recent stock movements
    const recentMovements = await StockMovementModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    for (const movement of recentMovements) {
      if (movement.type !== 'sale') {
        const product = await ProductModel.findById(movement.productId);
        if (product) {
          activities.push({
            type: 'stock',
            description: `Stock ${movement.type}: ${product.name}`,
            time: movement.createdAt,
            icon: movement.quantity > 0 ? 'Plus' : 'Minus',
          });
        }
      }
    }
    
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit);
  }
}

export const storage = new DatabaseStorage();