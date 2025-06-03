import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User interface and model
export interface IUser extends Document {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', userSchema);

// Category interface and model
export interface ICategory extends Document {
  _id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, maxlength: 100 },
  color: { type: String, default: "#1976D2", maxlength: 7 },
  userId: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);

// Product interface and model
export interface IProduct extends Document {
  _id: string;
  name: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, maxlength: 200 },
  barcode: { type: String, maxlength: 50 },
  price: { type: Number, required: true },
  cost: Number,
  stock: { type: Number, default: 0, required: true },
  minStock: { type: Number, default: 5, required: true },
  categoryId: { type: String, ref: 'Category' },
  imageUrl: String,
  description: String,
  isActive: { type: Boolean, default: true, required: true },
  userId: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);

// Sale interface and model
export interface ISale extends Document {
  _id: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  customerName?: string;
  receiptNumber: string;
  userId: string;
  createdAt: Date;
}

const saleSchema = new Schema<ISale>({
  total: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "cash", maxlength: 50 },
  customerName: { type: String, maxlength: 100 },
  receiptNumber: { type: String, required: true, maxlength: 50 },
  userId: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

export const SaleModel = mongoose.model<ISale>('Sale', saleSchema);

// Sale Item interface and model
export interface ISaleItem extends Document {
  _id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const saleItemSchema = new Schema<ISaleItem>({
  saleId: { type: String, required: true, ref: 'Sale' },
  productId: { type: String, required: true, ref: 'Product' },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

export const SaleItemModel = mongoose.model<ISaleItem>('SaleItem', saleItemSchema);

// Stock Movement interface and model
export interface IStockMovement extends Document {
  _id: string;
  productId: string;
  type: string;
  quantity: number;
  reason?: string;
  referenceId?: string;
  userId: string;
  createdAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>({
  productId: { type: String, required: true, ref: 'Product' },
  type: { type: String, required: true, maxlength: 20 }, // 'sale', 'adjustment', 'restock'
  quantity: { type: Number, required: true }, // positive for additions, negative for reductions
  reason: { type: String, maxlength: 100 },
  referenceId: String, // sale_id if type is 'sale'
  userId: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

export const StockMovementModel = mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);

// Zod schemas for validation
export const insertCategorySchema = z.object({
  name: z.string().max(100),
  color: z.string().max(7).optional(),
  userId: z.string(),
});

export const insertProductSchema = z.object({
  name: z.string().max(200),
  barcode: z.string().max(50).optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  userId: z.string(),
});

export const insertSaleSchema = z.object({
  total: z.number().positive(),
  subtotal: z.number().positive(),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.string().max(50).optional(),
  customerName: z.string().max(100).optional(),
  receiptNumber: z.string().max(50),
  userId: z.string(),
});

export const insertSaleItemSchema = z.object({
  saleId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
});

export const insertStockMovementSchema = z.object({
  productId: z.string(),
  type: z.string().max(20),
  quantity: z.number().int(),
  reason: z.string().max(100).optional(),
  referenceId: z.string().optional(),
  userId: z.string(),
});

// Types
export type UpsertUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
};

export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
};

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = {
  id: string;
  name: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = {
  id: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  customerName?: string;
  receiptNumber: string;
  userId: string;
  createdAt: Date;
};

export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reason?: string;
  referenceId?: string;
  userId: string;
  createdAt: Date;
};

// Extended types for relations
export type ProductWithCategory = Product & {
  category?: Category;
};

export type SaleWithItems = Sale & {
  items: (SaleItem & { product: Product })[];
};