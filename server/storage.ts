import {
  users,
  categories,
  products,
  sales,
  saleItems,
  stockMovements,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductWithCategory,
  type Sale,
  type InsertSale,
  type SaleWithItems,
  type InsertSaleItem,
  type SaleItem,
  type InsertStockMovement,
  type StockMovement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sum, count, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getProducts(userId: string): Promise<ProductWithCategory[]>;
  getProduct(id: number, userId: string): Promise<ProductWithCategory | undefined>;
  getProductByBarcode(barcode: string, userId: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getLowStockProducts(userId: string): Promise<ProductWithCategory[]>;
  searchProducts(query: string, userId: string): Promise<ProductWithCategory[]>;

  // Sales operations
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems>;
  getSales(userId: string, limit?: number): Promise<SaleWithItems[]>;
  getSale(id: number, userId: string): Promise<SaleWithItems | undefined>;
  getDailySales(userId: string, date: Date): Promise<{ total: string; count: number }>;
  getSalesReport(userId: string, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalTransactions: number;
    topProducts: Array<{ name: string; quantity: number; revenue: string }>;
  }>;

  // Stock operations
  updateStock(productId: number, quantity: number, type: string, reason?: string, userId?: string): Promise<void>;
  getStockMovements(productId: number): Promise<StockMovement[]>;

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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(userId: string): Promise<ProductWithCategory[]> {
    return await db
      .select({
        id: products.id,
        name: products.name,
        barcode: products.barcode,
        price: products.price,
        cost: products.cost,
        stock: products.stock,
        minStock: products.minStock,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        description: products.description,
        isActive: products.isActive,
        userId: products.userId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.userId, userId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number, userId: string): Promise<ProductWithCategory | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        barcode: products.barcode,
        price: products.price,
        cost: products.cost,
        stock: products.stock,
        minStock: products.minStock,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        description: products.description,
        isActive: products.isActive,
        userId: products.userId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.id, id), eq(products.userId, userId)));
    return product;
  }

  async getProductByBarcode(barcode: string, userId: string): Promise<ProductWithCategory | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        barcode: products.barcode,
        price: products.price,
        cost: products.cost,
        stock: products.stock,
        minStock: products.minStock,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        description: products.description,
        isActive: products.isActive,
        userId: products.userId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.barcode, barcode), eq(products.userId, userId), eq(products.isActive, true)));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values({
      ...product,
      updatedAt: new Date(),
    }).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...product,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async getLowStockProducts(userId: string): Promise<ProductWithCategory[]> {
    return await db
      .select({
        id: products.id,
        name: products.name,
        barcode: products.barcode,
        price: products.price,
        cost: products.cost,
        stock: products.stock,
        minStock: products.minStock,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        description: products.description,
        isActive: products.isActive,
        userId: products.userId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.userId, userId),
          eq(products.isActive, true),
          sql`${products.stock} <= ${products.minStock}`
        )
      )
      .orderBy(asc(products.stock));
  }

  async searchProducts(query: string, userId: string): Promise<ProductWithCategory[]> {
    return await db
      .select({
        id: products.id,
        name: products.name,
        barcode: products.barcode,
        price: products.price,
        cost: products.cost,
        stock: products.stock,
        minStock: products.minStock,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        description: products.description,
        isActive: products.isActive,
        userId: products.userId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.userId, userId),
          eq(products.isActive, true),
          sql`(${products.name} ILIKE ${'%' + query + '%'} OR ${products.barcode} ILIKE ${'%' + query + '%'} OR ${products.description} ILIKE ${'%' + query + '%'})`
        )
      )
      .orderBy(desc(products.createdAt));
  }

  // Sales operations
  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems> {
    return await db.transaction(async (tx) => {
      // Create the sale
      const [newSale] = await tx.insert(sales).values(sale).returning();

      // Create sale items and update stock
      const createdItems: (SaleItem & { product: Product })[] = [];
      
      for (const item of items) {
        const [saleItem] = await tx
          .insert(saleItems)
          .values({ ...item, saleId: newSale.id })
          .returning();

        // Get product info
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));

        // Update product stock
        await tx
          .update(products)
          .set({ 
            stock: sql`${products.stock} - ${item.quantity}`,
            updatedAt: new Date()
          })
          .where(eq(products.id, item.productId));

        // Record stock movement
        await tx.insert(stockMovements).values({
          productId: item.productId,
          type: 'sale',
          quantity: -item.quantity,
          reason: `Sale #${newSale.receiptNumber}`,
          referenceId: newSale.id,
          userId: sale.userId,
        });

        createdItems.push({ ...saleItem, product });
      }

      return { ...newSale, items: createdItems };
    });
  }

  async getSales(userId: string, limit = 50): Promise<SaleWithItems[]> {
    const salesData = await db
      .select()
      .from(sales)
      .where(eq(sales.userId, userId))
      .orderBy(desc(sales.createdAt))
      .limit(limit);

    const salesWithItems: SaleWithItems[] = [];

    for (const sale of salesData) {
      const items = await db
        .select({
          id: saleItems.id,
          saleId: saleItems.saleId,
          productId: saleItems.productId,
          quantity: saleItems.quantity,
          unitPrice: saleItems.unitPrice,
          totalPrice: saleItems.totalPrice,
          product: products,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(eq(saleItems.saleId, sale.id));

      salesWithItems.push({ ...sale, items });
    }

    return salesWithItems;
  }

  async getSale(id: number, userId: string): Promise<SaleWithItems | undefined> {
    const [sale] = await db
      .select()
      .from(sales)
      .where(and(eq(sales.id, id), eq(sales.userId, userId)));

    if (!sale) return undefined;

    const items = await db
      .select({
        id: saleItems.id,
        saleId: saleItems.saleId,
        productId: saleItems.productId,
        quantity: saleItems.quantity,
        unitPrice: saleItems.unitPrice,
        totalPrice: saleItems.totalPrice,
        product: products,
      })
      .from(saleItems)
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, sale.id));

    return { ...sale, items };
  }

  async getDailySales(userId: string, date: Date): Promise<{ total: string; count: number }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [result] = await db
      .select({
        total: sum(sales.total),
        count: count(sales.id),
      })
      .from(sales)
      .where(
        and(
          eq(sales.userId, userId),
          gte(sales.createdAt, startOfDay),
          lte(sales.createdAt, endOfDay)
        )
      );

    return {
      total: result.total || "0.00",
      count: result.count || 0,
    };
  }

  async getSalesReport(userId: string, startDate: Date, endDate: Date): Promise<{
    totalSales: string;
    totalTransactions: number;
    topProducts: Array<{ name: string; quantity: number; revenue: string }>;
  }> {
    // Get total sales and transactions
    const [salesSummary] = await db
      .select({
        totalSales: sum(sales.total),
        totalTransactions: count(sales.id),
      })
      .from(sales)
      .where(
        and(
          eq(sales.userId, userId),
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        )
      );

    // Get top products
    const topProducts = await db
      .select({
        name: products.name,
        quantity: sum(saleItems.quantity),
        revenue: sum(saleItems.totalPrice),
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(
        and(
          eq(sales.userId, userId),
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        )
      )
      .groupBy(products.id, products.name)
      .orderBy(desc(sum(saleItems.quantity)))
      .limit(10);

    return {
      totalSales: salesSummary.totalSales || "0.00",
      totalTransactions: salesSummary.totalTransactions || 0,
      topProducts: topProducts.map((p) => ({
        name: p.name,
        quantity: Number(p.quantity) || 0,
        revenue: String(p.revenue) || "0.00",
      })),
    };
  }

  // Stock operations
  async updateStock(productId: number, quantity: number, type: string, reason?: string, userId?: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({ 
          stock: sql`${products.stock} + ${quantity}`,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      if (userId) {
        await tx.insert(stockMovements).values({
          productId,
          type,
          quantity,
          reason: reason || type,
          userId,
        });
      }
    });
  }

  async getStockMovements(productId: number): Promise<StockMovement[]> {
    return await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt));
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

    const [productStats] = await db
      .select({
        totalProducts: count(products.id),
        lowStockCount: count(sql`CASE WHEN ${products.stock} <= ${products.minStock} THEN 1 END`),
      })
      .from(products)
      .where(and(eq(products.userId, userId), eq(products.isActive, true)));

    return {
      dailySales: dailySales.total,
      totalProducts: productStats.totalProducts || 0,
      lowStockCount: productStats.lowStockCount || 0,
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
    const recentSales = await db
      .select()
      .from(sales)
      .where(eq(sales.userId, userId))
      .orderBy(desc(sales.createdAt))
      .limit(limit);

    const recentProducts = await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt))
      .limit(5);

    const activities: Array<{
      type: string;
      description: string;
      amount?: string;
      time: Date;
      icon: string;
    }> = [];

    // Add sales
    recentSales.forEach((sale) => {
      activities.push({
        type: 'sale',
        description: `Sale #${sale.receiptNumber}`,
        amount: `+$${sale.total}`,
        time: sale.createdAt!,
        icon: 'shopping-cart',
      });
    });

    // Add new products
    recentProducts.forEach((product) => {
      activities.push({
        type: 'product_added',
        description: `Product Added: ${product.name}`,
        time: product.createdAt!,
        icon: 'package-plus',
      });
    });

    // Sort by time and limit
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit);
  }
}

export const storage = new DatabaseStorage();
