import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Truck, PlusCircle, Upload, Save, Trash2, FileSpreadsheet, Tag } from 'lucide-react';
import { mockSuppliers, api } from '@/services/api';
import { Supplier, InventoryItem, formatCurrency, SUPPLIER_CLASSIFICATIONS, SupplierClassification } from '@/types';

const UNITS = ['PC', 'REAM', 'BOX', 'PAD', 'PACK', 'BDL', 'BTL', 'ROLL', 'SET', 'UNIT'];

interface StockEntry {
  id: string;
  date: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export default function StockSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '', classification: 'General Supplies' as SupplierClassification });
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: '',
        qty: 0,
        unit: 'PC',
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof StockEntry, value: string | number) => {
    setEntries(
      entries.map((e) => {
        if (e.id === id) {
          const updated = { ...e, [field]: value };
          if (field === 'qty' || field === 'unitPrice') {
            updated.amount = updated.qty * updated.unitPrice;
          }
          return updated;
        }
        return e;
      })
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Parse Excel file - for now, show mock data
    toast.success(`File "${file.name}" uploaded. Parsing Excel data...`);
    
    // Mock parsed data from Excel
    const mockParsedData: StockEntry[] = [
      { id: crypto.randomUUID(), date: '2024-01-20', description: 'Bond Paper A4', qty: 100, unit: 'REAM', unitPrice: 250, amount: 25000 },
      { id: crypto.randomUUID(), date: '2024-01-20', description: 'Ballpen Blue (12 pcs)', qty: 50, unit: 'BOX', unitPrice: 120, amount: 6000 },
      { id: crypto.randomUUID(), date: '2024-01-20', description: 'Folder Long White', qty: 200, unit: 'PC', unitPrice: 18, amount: 3600 },
    ];
    
    setEntries(mockParsedData);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const supplier = await api.addSupplier(newSupplier);
      setSuppliers([...suppliers, supplier]);
      setSelectedSupplier(supplier.id);
      setShowAddSupplier(false);
      setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '', classification: 'General Supplies' });
      toast.success('Supplier added successfully');
    } catch (error) {
      toast.error('Failed to add supplier');
    }
    setIsSubmitting(false);
  };

  const handleSubmitStocks = async () => {
    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }
    if (entries.length === 0) {
      toast.error('Please add at least one stock entry');
      return;
    }

    const invalid = entries.some((e) => !e.description.trim() || e.qty <= 0);
    if (invalid) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    const supplier = suppliers.find(s => s.id === selectedSupplier);
    
    // Add each entry as inventory item
    for (const entry of entries) {
      await api.addInventoryItem({
        supplierId: selectedSupplier,
        supplierName: supplier?.name || '',
        date: entry.date,
        description: entry.description,
        unit: entry.unit,
        qty: entry.qty,
        unitPrice: entry.unitPrice,
        amount: entry.amount,
        totalRunningStocks: entry.qty,
        status: 'In Stock',
      });
    }
    
    toast.success(`${entries.length} stock item(s) added successfully!`);
    setEntries([]);
    setIsSubmitting(false);
  };

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Truck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Stock Suppliers</h1>
          <p className="text-muted-foreground">Add stocks from suppliers with Excel import</p>
        </div>
      </div>

      {/* Supplier Selection */}
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="font-display">Select Supplier</CardTitle>
          <CardDescription>Choose a supplier or add a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.id}) {s.classification && `- ${s.classification}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddSupplier(true)} variant="outline" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New Supplier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Entry */}
      {selectedSupplier && (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="font-display">Add New Stocks</CardTitle>
              <CardDescription>
                From: {suppliers.find(s => s.id === selectedSupplier)?.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Import Excel
              </Button>
              <Button onClick={addEntry} variant="outline" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-3 p-3 bg-muted/50 rounded-lg">
              <strong>Excel File Headers:</strong> Date, Description, Qty, Unit, Unit Price, Amount
            </div>
            
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Import Excel file or add rows manually</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Item ID</TableHead>
                        <TableHead className="w-32">Date</TableHead>
                        <TableHead className="min-w-[200px]">Description *</TableHead>
                        <TableHead className="w-24">Qty *</TableHead>
                        <TableHead className="w-28">Unit</TableHead>
                        <TableHead className="w-32">Unit Price</TableHead>
                        <TableHead className="w-32 text-right">Amount</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry, index) => {
                        const supplier = suppliers.find(s => s.id === selectedSupplier);
                        const prefix = supplier?.name.substring(0, 3).toUpperCase() || 'ITM';
                        const itemId = `${prefix}-${String(index + 1).padStart(4, '0')}`;
                        
                        return (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <Badge variant="secondary" className="font-mono text-xs">
                                {itemId}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={entry.date}
                                onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Item description"
                                value={entry.description}
                                onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                value={entry.qty}
                                onChange={(e) => updateEntry(entry.id, 'qty', parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={entry.unit}
                                onValueChange={(v) => updateEntry(entry.id, 'unit', v)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {UNITS.map((u) => (
                                    <SelectItem key={u} value={u}>{u}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={entry.unitPrice}
                                onChange={(e) => updateEntry(entry.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-28"
                              />
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">
                              {formatCurrency(entry.amount)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEntry(entry.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <tfoot>
                      <tr className="border-t bg-muted/50">
                        <td colSpan={6} className="px-4 py-3 text-right font-semibold">
                          Total Amount:
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-lg text-primary">
                          {formatCurrency(totalAmount)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button
                    onClick={handleSubmitStocks}
                    disabled={isSubmitting}
                    className="gap-2 gradient-primary"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Save Stock Items'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplier Name *</Label>
              <Input
                placeholder="Company name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  placeholder="Name"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="Phone number"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="supplier@email.com"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Business address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Classification *</Label>
              <Select 
                value={newSupplier.classification} 
                onValueChange={(value: SupplierClassification) => setNewSupplier({ ...newSupplier, classification: value })}
              >
                <SelectTrigger>
                  <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIER_CLASSIFICATIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSupplier(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier} disabled={isSubmitting} className="gap-2">
              <Save className="w-4 h-4" />
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
