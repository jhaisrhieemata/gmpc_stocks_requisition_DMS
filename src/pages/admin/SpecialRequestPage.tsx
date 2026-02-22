import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  FileText, 
  Search, 
  Printer,
  FileUp,
  Calendar,
  Building2,
  MoreHorizontal,
  Check,
  X,
  DollarSign,
  ShoppingCart,
  CheckSquare
} from 'lucide-react';
import { mockSpecialRequests, api } from '@/services/api';
import { BranchGroup, RequisitionItem, formatCurrency, BRANCHES, SpecialRequestStatus, getPluralUnit } from '@/types';

const STATUS_OPTIONS: SpecialRequestStatus[] = [
  'Pending',
  'Approved By Purchasing',
  'Approved By Accounting',
  'Petty Cash By Branch',
  'Cancelled',
  'To Purchased',
];

export default function SpecialRequestPage() {
  const [requests, setRequests] = useState<BranchGroup[]>(mockSpecialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const templateFileRef = useRef<HTMLInputElement>(null);

  // Flatten all requests for filtering
  const allItems = requests.flatMap(group => 
    group.rows.map(row => ({
      ...row,
      branch: group.branch,
    }))
  );

  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'all' || item.branch === filterBranch;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(i => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const selectedTotal = filteredItems
    .filter(i => selectedItems.includes(i.id))
    .reduce((sum, i) => sum + i.amount, 0);

  const handleStatusChange = async (itemId: string, newStatus: SpecialRequestStatus) => {
    // Update local state
    setRequests(prev => 
      prev.map(group => ({
        ...group,
        rows: group.rows.map(row => 
          row.id === itemId ? { ...row, status: newStatus } : row
        ),
      }))
    );

    // Call API
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      await api.batchUpdateStatus([item as RequisitionItem], newStatus);
      toast.success(`Status updated to "${newStatus}"`);
    }
  };

  const handleBatchStatusChange = async (newStatus: SpecialRequestStatus) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    // Update local state
    setRequests(prev => 
      prev.map(group => ({
        ...group,
        rows: group.rows.map(row => 
          selectedItems.includes(row.id) ? { ...row, status: newStatus } : row
        ),
      }))
    );

    // Call API
    const itemsToUpdate = allItems.filter(i => selectedItems.includes(i.id)) as RequisitionItem[];
    await api.batchUpdateStatus(itemsToUpdate, newStatus);
    toast.success(`${selectedItems.length} item(s) updated to "${newStatus}"`);
    setSelectedItems([]);
  };

  const handlePrint = () => {
    const itemsToPrint = selectedItems.length > 0 
      ? filteredItems.filter(i => selectedItems.includes(i.id))
      : filteredItems;
    
    const total = itemsToPrint.reduce((sum, i) => sum + i.amount, 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Special Request Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            h1 { color: #333; margin: 0; }
            .subtitle { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #9c27b0; color: white; }
            .amount { text-align: right; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .pending { background: #fff3cd; color: #856404; }
            .approved { background: #d4edda; color: #155724; }
            .cancelled { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GIANT MOTO PRO</h1>
            <p class="subtitle">Special Request Report</p>
            <p style="font-size: 12px; color: #666;">Generated: ${new Date().toLocaleString()}</p>
            ${filterBranch !== 'all' ? `<p style="font-size: 12px;">Branch: ${filterBranch}</p>` : ''}
            ${filterStatus !== 'all' ? `<p style="font-size: 12px;">Status: ${filterStatus}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Branch</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th class="amount">Unit Price</th>
                <th class="amount">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToPrint
                .map(
                  (item) => `
                <tr>
                  <td>${item.branch}</td>
                  <td>${item.description}</td>
                  <td>${item.qty}</td>
                  <td>${getPluralUnit(item.unit, item.qty)}</td>
                  <td class="amount">${formatCurrency(item.uprice)}</td>
                  <td class="amount">${formatCurrency(item.amount)}</td>
                  <td><span class="status ${item.status?.includes('Approved') ? 'approved' : item.status === 'Cancelled' ? 'cancelled' : 'pending'}">${item.status || 'Pending'}</span></td>
                </tr>
              `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="5" style="text-align: right;">TOTAL AMOUNT:</td>
                <td class="amount">${formatCurrency(total)}</td>
                <td></td>
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Approved By Purchasing':
        return <Badge className="bg-primary">Approved (Purchasing)</Badge>;
      case 'Approved By Accounting':
        return <Badge className="bg-success">Approved (Accounting)</Badge>;
      case 'Petty Cash By Branch':
        return <Badge className="bg-warning text-warning-foreground">Petty Cash</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'To Purchased':
        return <Badge className="bg-special text-white">To Purchase</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-special/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-special" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Special Requests</h1>
          <p className="text-muted-foreground">View and manage all special requests</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="font-display">All Special Requests</CardTitle>
              <CardDescription>{filteredItems.length} requests found</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <Badge variant="secondary">{selectedItems.length} selected</Badge>
                  <span className="text-sm font-semibold">Total: {formatCurrency(selectedTotal)}</span>
                  
                  {/* Batch Action Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Batch Action
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem 
                        onClick={() => handleBatchStatusChange('Approved By Purchasing')}
                        className="gap-2"
                      >
                        <Check className="w-4 h-4 text-primary" />
                        Approved By Purchasing Dept
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleBatchStatusChange('Approved By Accounting')}
                        className="gap-2"
                      >
                        <Check className="w-4 h-4 text-success" />
                        Approved By Accounting Dept
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleBatchStatusChange('Petty Cash By Branch')}
                        className="gap-2"
                      >
                        <DollarSign className="w-4 h-4 text-warning" />
                        Petty Cash By Branch
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleBatchStatusChange('To Purchased')}
                        className="gap-2"
                      >
                        <ShoppingCart className="w-4 h-4 text-special" />
                        To Purchased
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleBatchStatusChange('Cancelled')}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              <input
                ref={templateFileRef}
                type="file"
                accept=".docx,.doc"
                className="hidden"
                onChange={() => {
                  toast.success('Template attached');
                  handlePrint();
                }}
              />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => templateFileRef.current?.click()}>
                <FileUp className="w-4 h-4" />
                Template
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-10 w-40"
              />
            </div>
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-48">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {BRANCHES.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search description..."
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
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.branch}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{getPluralUnit(item.unit, item.qty)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.uprice)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(item.amount)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(item.id, 'Approved By Purchasing')}
                            className="gap-2"
                          >
                            <Check className="w-4 h-4 text-primary" />
                            Approved By Purchasing Dept
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(item.id, 'Approved By Accounting')}
                            className="gap-2"
                          >
                            <Check className="w-4 h-4 text-success" />
                            Approved By Accounting Dept
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(item.id, 'Petty Cash By Branch')}
                            className="gap-2"
                          >
                            <DollarSign className="w-4 h-4 text-warning" />
                            Petty Cash By Branch
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(item.id, 'To Purchased')}
                            className="gap-2"
                          >
                            <ShoppingCart className="w-4 h-4 text-special" />
                            To Purchased
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(item.id, 'Cancelled')}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot>
                <tr className="border-t bg-muted/50">
                  <td colSpan={6} className="px-4 py-3 text-right font-semibold">
                    Total Amount:
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-lg text-special">
                    {formatCurrency(filteredItems.reduce((sum, i) => sum + i.amount, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}