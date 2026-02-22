import { useState } from 'react';
import { RequisitionItem, InventoryItem, formatCurrency, getPluralUnit, SUPPLIER_CLASSIFICATIONS, SupplierClassification } from '@/types';
import { mockInventory } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Minus, Trash2, Package, Search, Check, CheckSquare, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface ItemsTableProps {
  items: RequisitionItem[];
  onChange: (items: RequisitionItem[]) => void;
  isOfficeSupplies: boolean;
}

const UNITS = ['PC', 'PCS', 'REAM', 'REAMS', 'PAD', 'PADS', 'BOX', 'BOXES', 'PACK', 'PACKS', 'ROLL', 'ROLLS', 'SET', 'SETS', 'UNIT', 'UNITS', 'BTL', 'BTLS', 'BDL', 'BDLS'];

export function ItemsTable({ items, onChange, isOfficeSupplies }: ItemsTableProps) {
  const [selectedTableItems, setSelectedTableItems] = useState<Set<string>>(new Set());
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [selectedStockItems, setSelectedStockItems] = useState<Set<string>>(new Set());
  const [filterClassification, setFilterClassification] = useState<string>('all');
  
  // Show all inventory items including out of stock
  const [stockItems] = useState<InventoryItem[]>(mockInventory);

  const filteredStocks = stockItems.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(stockSearch.toLowerCase()) ||
      item.itemId.toLowerCase().includes(stockSearch.toLowerCase());
    const matchesClassification = filterClassification === 'all' || item.classification === filterClassification;
    return matchesSearch && matchesClassification;
  });

  const addRow = () => {
    if (isOfficeSupplies) {
      setShowStockModal(true);
      setSelectedStockItems(new Set());
    } else {
      const newItem: RequisitionItem = {
        id: Math.random().toString(36).substr(2, 9),
        qty: 1,
        unit: 'PC',
        description: '',
        uprice: 0,
        amount: 0,
        sheetName: '',
        rowNumber: 0,
      };
      onChange([...items, newItem]);
    }
  };

  const toggleStockItem = (itemId: string, stock: InventoryItem) => {
    // Check if out of stock
    if (stock.status === 'Out of Stock' || stock.totalRunningStocks === 0) {
      toast.warning('Currently out of stock. Restocking soon.', {
        duration: 3000,
      });
      return;
    }

    setSelectedStockItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const selectAllStocks = () => {
    const availableStocks = filteredStocks.filter(s => s.status !== 'Out of Stock' && s.totalRunningStocks > 0);
    if (selectedStockItems.size === availableStocks.length) {
      setSelectedStockItems(new Set());
    } else {
      setSelectedStockItems(new Set(availableStocks.map(s => s.itemId)));
    }
  };

  const applySelectedStocks = () => {
    const newItems: RequisitionItem[] = [];
    
    selectedStockItems.forEach(itemId => {
      const stock = stockItems.find(s => s.itemId === itemId);
      if (!stock) return;
      
      // Check if item already exists in the list
      const existingIndex = items.findIndex(i => i.description === stock.description);
      
      if (existingIndex === -1) {
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          qty: 1,
          unit: stock.unit,
          description: stock.description,
          uprice: stock.unitPrice,
          amount: stock.unitPrice,
          sheetName: 'Office Supplies',
          rowNumber: 0,
        });
      }
    });

    if (newItems.length > 0) {
      onChange([...items, ...newItems]);
      toast.success(`${newItems.length} item(s) added`);
    }

    setShowStockModal(false);
    setStockSearch('');
    setSelectedStockItems(new Set());
    setFilterClassification('all');
  };

  const updateItem = (id: string, updates: Partial<RequisitionItem>) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        updated.amount = updated.qty * updated.uprice;
        // Update unit based on quantity
        if (updates.qty !== undefined) {
          updated.unit = getPluralUnit(updated.unit, updated.qty);
        }
        return updated;
      })
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
    setSelectedTableItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const removeSelected = () => {
    onChange(items.filter((item) => !selectedTableItems.has(item.id)));
    setSelectedTableItems(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedTableItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const availableStocksCount = filteredStocks.filter(s => s.status !== 'Out of Stock' && s.totalRunningStocks > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">Items</h3>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1">
            <Plus className="w-4 h-4" />
            {isOfficeSupplies ? 'Select from Stocks' : 'Add Item'}
          </Button>
          {selectedTableItems.size > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeSelected}
              className="gap-1 text-destructive border-destructive"
            >
              <Minus className="w-4 h-4" />
              Remove ({selectedTableItems.size})
            </Button>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="w-10 p-3"></th>
                <th className="p-3 text-left font-semibold w-20">Qty</th>
                <th className="p-3 text-left font-semibold w-28">Unit</th>
                <th className="p-3 text-left font-semibold">Description</th>
                <th className="p-3 text-left font-semibold w-28">Unit Price</th>
                <th className="p-3 text-left font-semibold w-28">Amount</th>
                <th className="w-12 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No items added yet. Click "{isOfficeSupplies ? 'Select from Stocks' : 'Add Item'}" to start.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedTableItems.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: parseInt(e.target.value) || 0 })}
                        className="h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Select
                        value={item.unit}
                        onValueChange={(value) => updateItem(item.id, { unit: value })}
                        disabled={isOfficeSupplies}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        placeholder="Item description"
                        className="h-9"
                        disabled={isOfficeSupplies}
                      />
                    </td>
                    <td className="p-3 font-mono">
                      {formatCurrency(item.uprice)}
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-9 w-9 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr className="bg-muted/50 border-t border-border">
                  <td colSpan={5} className="p-3 text-right font-semibold">
                    Total:
                  </td>
                  <td className="p-3 font-mono font-bold text-lg">
                    {formatCurrency(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Stock Selection Modal with Multi-Select and Select All */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Select Office Supplies
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClassification} onValueChange={setFilterClassification}>
              <SelectTrigger className="w-44">
                <Tag className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {SUPPLIER_CLASSIFICATIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select All Button */}
          <div className="flex items-center justify-between mb-2 px-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllStocks}
              className="gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              {selectedStockItems.size === availableStocksCount ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {availableStocksCount} available items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-2">
              {filteredStocks.map((stock) => {
                const isOutOfStock = stock.status === 'Out of Stock' || stock.totalRunningStocks === 0;
                const isSelected = selectedStockItems.has(stock.itemId);
                
                return (
                  <button
                    key={stock.itemId}
                    type="button"
                    onClick={() => toggleStockItem(stock.itemId, stock)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      isOutOfStock 
                        ? 'border-destructive/50 bg-destructive/5 opacity-60 cursor-not-allowed' 
                        : isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-primary/5 hover:border-primary'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                      isOutOfStock 
                        ? 'border-destructive/30 bg-destructive/10'
                        : isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && !isOutOfStock && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {stock.itemId}
                        </Badge>
                        {stock.classification && (
                          <Badge variant="secondary" className="text-xs">
                            {stock.classification}
                          </Badge>
                        )}
                        <span className={`font-medium ${isOutOfStock ? 'text-destructive' : ''}`}>
                          {stock.description}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {stock.unit} • {formatCurrency(stock.unitPrice)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        className={
                          isOutOfStock 
                            ? 'bg-destructive' 
                            : stock.status === 'In Stock' 
                              ? 'bg-success' 
                              : 'bg-warning text-warning-foreground'
                        }
                      >
                        {isOutOfStock ? 'Out of Stock' : `${stock.totalRunningStocks} in stock`}
                      </Badge>
                    </div>
                  </button>
                );
              })}
              {filteredStocks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items found matching "{stockSearch}"
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {selectedStockItems.size} item(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowStockModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={applySelectedStocks}
                  disabled={selectedStockItems.size === 0}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Selection
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}