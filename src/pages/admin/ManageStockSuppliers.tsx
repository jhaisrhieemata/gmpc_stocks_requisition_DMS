import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Package, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  Shield, 
  AlertTriangle, 
  Printer,
  FileUp,
  Truck
} from 'lucide-react';
import { mockInventory, mockSuppliers, api } from '@/services/api';
import { InventoryItem, Supplier, formatCurrency } from '@/types';

const UNITS = ['PC', 'REAM', 'BOX', 'PAD', 'PACK', 'BDL', 'BTL', 'ROLL', 'SET', 'UNIT'];

export default function ManageStockSuppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingStock, setEditingStock] = useState<InventoryItem | null>(null);
  const [deletingStock, setDeletingStock] = useState<InventoryItem | null>(null);
  const [showDeletePermission, setShowDeletePermission] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const templateFileRef = useRef<HTMLInputElement>(null);

  const [stocks, setStocks] = useState<InventoryItem[]>(mockInventory);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = filterSupplier === 'all' || stock.supplierId === filterSupplier;
    const matchesStatus = filterStatus === 'all' || stock.status === filterStatus;
    return matchesSearch && matchesSupplier && matchesStatus;
  });

  const lowStocks = stocks.filter((s) => s.status === 'Low Stock' || s.status === 'Critical');
  const criticalStocks = stocks.filter((s) => s.status === 'Out of Stock' || s.status === 'Critical');

  const selectedTotal = filteredStocks
    .filter(s => selectedItems.includes(s.itemId))
    .reduce((sum, s) => sum + s.amount, 0);

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredStocks.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredStocks.map(s => s.itemId));
    }
  };

  const toggleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleEdit = (stock: InventoryItem) => {
    setEditingStock({ ...stock });
  };

  const handleSaveEdit = async () => {
    if (!editingStock) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    let newStatus: InventoryItem['status'] = 'In Stock';
    if (editingStock.totalRunningStocks === 0) {
      newStatus = 'Out of Stock';
    } else if (editingStock.totalRunningStocks <= 5) {
      newStatus = 'Critical';
    } else if (editingStock.totalRunningStocks <= 10) {
      newStatus = 'Low Stock';
    }

    const updatedStock = { ...editingStock, status: newStatus };
    setStocks((prev) =>
      prev.map((s) => (s.itemId === editingStock.itemId ? updatedStock : s))
    );
    toast.success(`Stock "${editingStock.description}" updated successfully!`);
    setEditingStock(null);
    setIsSubmitting(false);
  };

  const handleDeleteRequest = (stock: InventoryItem) => {
    setDeletingStock(stock);
    setShowDeletePermission(true);
    setDeletePassword('');
  };

  const handleConfirmDelete = async () => {
    if (deletePassword !== 'ADMIN@DELETE') {
      toast.error('Invalid permission password');
      return;
    }

    if (!deletingStock) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    setStocks((prev) => prev.filter((s) => s.itemId !== deletingStock.itemId));
    toast.success(`Stock "${deletingStock.description}" deleted successfully!`);
    setDeletingStock(null);
    setShowDeletePermission(false);
    setDeletePassword('');
    setIsSubmitting(false);
  };

  const handlePrintLowStocks = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stocksToPrint = filterStatus === 'Critical' ? criticalStocks : lowStocks;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Low Stock Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            h1 { color: #333; margin: 0; }
            .subtitle { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #1976d2; color: white; }
            .low { background: #fff3cd; }
            .critical { background: #f8d7da; }
            .print-date { color: #666; font-size: 12px; }
            .total-row { background: #f0f0f0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GIANT MOTO PRO</h1>
            <p class="subtitle">Low Stock / Critical Stock Report</p>
            <p class="print-date">Generated: ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Supplier</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Stocks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${stocksToPrint
                .map(
                  (s) => `
                <tr class="${s.status === 'Critical' || s.status === 'Out of Stock' ? 'critical' : 'low'}">
                  <td>${s.itemId}</td>
                  <td>${s.supplierName}</td>
                  <td>${s.description}</td>
                  <td>${s.unit}</td>
                  <td>${s.totalRunningStocks}</td>
                  <td>${s.status}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to print');
      return;
    }

    const selectedStocks = stocks.filter(s => selectedItems.includes(s.itemId));
    const total = selectedStocks.reduce((sum, s) => sum + s.amount, 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stock Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            h1 { color: #333; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #1976d2; color: white; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .amount { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GIANT MOTO PRO</h1>
            <p>Stock Inventory Report</p>
            <p style="font-size: 12px; color: #666;">Generated: ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Supplier</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${selectedStocks
                .map(
                  (s) => `
                <tr>
                  <td>${s.itemId}</td>
                  <td>${s.supplierName}</td>
                  <td>${s.description}</td>
                  <td>${s.unit}</td>
                  <td>${s.qty}</td>
                  <td class="amount">${formatCurrency(s.unitPrice)}</td>
                  <td class="amount">${formatCurrency(s.amount)}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="6" style="text-align: right;">TOTAL AMOUNT:</td>
                <td class="amount">${formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <Badge className="bg-success">In Stock</Badge>;
      case 'Low Stock':
        return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>;
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'Out of Stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Manage Stock Suppliers</h1>
          <p className="text-muted-foreground">Edit, update, and manage supplier inventory</p>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {lowStocks.length > 0 && (
          <Card className="border-warning bg-warning/10">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="font-medium">{lowStocks.length} Low Stock item(s)</span>
              </div>
              <div className="flex gap-2">
                <input
                  ref={templateFileRef}
                  type="file"
                  accept=".docx,.doc"
                  className="hidden"
                  onChange={() => {
                    toast.success('Template attached');
                    handlePrintLowStocks();
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => templateFileRef.current?.click()}
                >
                  <FileUp className="w-4 h-4" />
                  Template
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintLowStocks} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {criticalStocks.length > 0 && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="font-medium">{criticalStocks.length} Critical/Out of Stock item(s)</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setFilterStatus('Critical');
                  handlePrintLowStocks();
                }} 
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Critical
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="font-display">Inventory Items</CardTitle>
              <CardDescription>{filteredStocks.length} items found</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <Badge variant="secondary">{selectedItems.length} selected</Badge>
                  <span className="text-sm font-semibold">Total: {formatCurrency(selectedTotal)}</span>
                  <Button size="sm" variant="outline" onClick={handlePrintSelected} className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print Selected
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Select value={filterSupplier} onValueChange={setFilterSupplier}>
              <SelectTrigger className="w-48">
                <Truck className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredStocks.length && filteredStocks.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow key={stock.itemId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(stock.itemId)}
                        onCheckedChange={() => toggleSelectItem(stock.itemId)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {stock.itemId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{stock.supplierName}</TableCell>
                    <TableCell className="font-medium">{stock.description}</TableCell>
                    <TableCell>{stock.unit}</TableCell>
                    <TableCell className="text-right">{stock.qty}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(stock.unitPrice)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(stock.amount)}</TableCell>
                    <TableCell>{getStatusBadge(stock.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(stock)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRequest(stock)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingStock} onOpenChange={() => setEditingStock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item ID</Label>
                <Input value={editingStock?.itemId || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input value={editingStock?.supplierName || ''} disabled className="bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editingStock?.description || ''}
                onChange={(e) =>
                  setEditingStock((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={editingStock?.unit || 'PC'}
                  onValueChange={(v) =>
                    setEditingStock((prev) => (prev ? { ...prev, unit: v } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingStock?.qty || 0}
                  onChange={(e) =>
                    setEditingStock((prev) =>
                      prev ? { ...prev, qty: parseInt(e.target.value) || 0 } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Running Stocks</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingStock?.totalRunningStocks || 0}
                  onChange={(e) =>
                    setEditingStock((prev) =>
                      prev ? { ...prev, totalRunningStocks: parseInt(e.target.value) || 0 } : null
                    )
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingStock?.unitPrice || 0}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    setEditingStock((prev) =>
                      prev ? { ...prev, unitPrice: price, amount: price * prev.qty } : null
                    );
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  value={formatCurrency(editingStock?.amount || 0)}
                  disabled
                  className="bg-muted font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStock(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <AlertDialog open={showDeletePermission} onOpenChange={setShowDeletePermission}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Delete Permission Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deleting a stock item is a restricted action. Please enter the admin permission
              password to proceed with deleting "{deletingStock?.description}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Permission Password</Label>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Stock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
