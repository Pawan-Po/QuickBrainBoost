import { forwardRef } from 'react';
import { type SaleWithItems } from '@shared/schema';

interface ReceiptProps {
  sale: SaleWithItems;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale, shopName = "ShopSmart POS", shopAddress, shopPhone }, ref) => {
    const formatDate = (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    };

    return (
      <div
        ref={ref}
        className="bg-white p-6 max-w-sm mx-auto font-mono text-sm"
        style={{ width: '80mm' }}
      >
        {/* Header */}
        <div className="text-center mb-4 border-b-2 border-dashed border-gray-300 pb-4">
          <h1 className="text-lg font-bold">{shopName}</h1>
          {shopAddress && <p className="text-xs">{shopAddress}</p>}
          {shopPhone && <p className="text-xs">{shopPhone}</p>}
        </div>

        {/* Sale Info */}
        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span>{sale.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formatDate(sale.createdAt!)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>POS System</span>
          </div>
          {sale.customerName && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{sale.customerName}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-4">
          {sale.items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="flex-1 pr-2">{item.product.name}</span>
                <span>${item.totalPrice}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 ml-2">
                <span>{item.quantity} × ${item.unitPrice}</span>
                {item.product.barcode && (
                  <span>{item.product.barcode}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t-2 border-dashed border-gray-300 pt-2 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${sale.subtotal}</span>
          </div>
          
          {parseFloat(sale.discount) > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-${sale.discount}</span>
            </div>
          )}
          
          {parseFloat(sale.tax) > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${sale.tax}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-1 mt-1">
            <span>TOTAL:</span>
            <span>${sale.total}</span>
          </div>
          
          <div className="flex justify-between mt-1">
            <span>Payment:</span>
            <span className="capitalize">{sale.paymentMethod}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-dashed border-gray-300 pt-4">
          <p className="text-xs mb-2">Thank you for your business!</p>
          <p className="text-xs">Return policy: 30 days with receipt</p>
          <p className="text-xs mt-2">
            Items sold: {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>

        {/* Barcode-style decoration */}
        <div className="flex justify-center mt-4 space-x-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-black"
              style={{ height: `${Math.random() * 20 + 10}px` }}
            />
          ))}
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
