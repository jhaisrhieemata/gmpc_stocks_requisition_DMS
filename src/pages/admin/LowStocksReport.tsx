import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Search,
  Printer,
  FileText,
  Download,
  Package,
} from 'lucide-react';
import { mockInventory } from '@/services/api';

export default function LowStocksReport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  // Filter low and out of stock items
  const lowStocks = mockInventory.filter(
    (item) => item.status === 'Low Stock' || item.status === 'Out of Stock'
  );

  const filteredStocks = lowStocks.filter(
    (stock) =>
      stock.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.itemId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const outOfStockCount = lowStocks.filter((s) => s.status === 'Out of Stock').length;
  const lowStockCount = lowStocks.filter((s) => s.status === 'Low Stock').length;

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file);
      toast.success(`Template "${file.name}" uploaded`);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Low Stock Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #dc3545; padding-bottom: 20px; }
            .header h1 { color: #dc3545; margin: 0; }
            .header .subtitle { color: #666; margin-top: 5px; }
            .summary { display: flex; justify-content: center; gap: 40px; margin: 20px 0; }
            .summary-item { text-align: center; padding: 15px 25px; border-radius: 8px; }
            .summary-item.critical { background: #f8d7da; color: #721c24; }
            .summary-item.warning { background: #fff3cd; color: #856404; }
            .summary-item h3 { margin: 0; font-size: 28px; }
            .summary-item p { margin: 5px 0 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px 10px; text-align: left; }
            th { background: #dc3545; color: white; }
            .out-of-stock { background: #f8d7da; }
            .low-stock { background: #fff3cd; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 11px; }
            @media print { body { padding: 15px; } .summary-item { border: 1px solid #ccc; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚠️ LOW STOCK ALERT REPORT</h1>
            <p class="subtitle">Stocks & Requisitions System</p>
            <p class="subtitle">Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item critical">
              <h3>${outOfStockCount}</h3>
              <p>OUT OF STOCK</p>
            </div>
            <div class="summary-item warning">
              <h3>${lowStockCount}</h3>
              <p>LOW STOCK</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStocks
                .sort((a, b) => a.totalRunningStocks - b.totalRunningStocks)
                .map(
                  (stock) => `
                <tr class="${stock.status === 'Out of Stock' ? 'out-of-stock' : 'low-stock'}">
                  <td>${stock.itemId}</td>
                  <td>${stock.description}</td>
                  <td>${stock.unit}</td>
                  <td>${stock.totalRunningStocks}</td>
                  <td>${stock.status}</td>
                  <td>${stock.status === 'Out of Stock' ? 'CRITICAL' : 'WARNING'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report requires immediate attention. Please restock critical items.</p>
          </div>
          
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleGeneratePDF = () => {
    if (!templateFile) {
      toast.error('Please upload a template file first');
      return;
    }
    // TODO: Integrate with PHP backend
    toast.success('PDF generation would integrate with your PHP backend');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Out of Stock') {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>;
  };

  const getPriorityBadge = (status: string) => {
    if (status === 'Out of Stock') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          CRITICAL
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        WARNING
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Low Stocks Report</h1>
          <p className="text-muted-foreground">Items requiring immediate restocking</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-3xl font-bold text-destructive">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold text-warning">{lowStockCount}</p>
              </div>
              <Package className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-3xl font-bold">{lowStocks.length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Upload */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1 flex-1">
              <Label>Import Template Document</Label>
              <Input type="file" accept=".doc,.docx,.pdf" onChange={handleTemplateUpload} />
            </div>
            {templateFile && (
              <Badge variant="secondary" className="gap-2 h-8">
                <FileText className="w-3 h-3" />
                {templateFile.name}
              </Badge>
            )}
            <Button onClick={handleGeneratePDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Generate PDF
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Low Stocks Table */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Items
            </CardTitle>
            <CardDescription>{filteredStocks.length} items need attention</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      All stocks are at healthy levels!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStocks
                    .sort((a, b) => a.totalRunningStocks - b.totalRunningStocks)
                    .map((stock) => (
                      <TableRow
                        key={stock.itemId}
                        className={
                          stock.status === 'Out of Stock'
                            ? 'bg-destructive/5'
                            : 'bg-warning/5'
                        }
                      >
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {stock.itemId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{stock.description}</TableCell>
                        <TableCell>{stock.unit}</TableCell>
                        <TableCell className="text-right font-bold">
                          {stock.totalRunningStocks}
                        </TableCell>
                        <TableCell>{getStatusBadge(stock.status)}</TableCell>
                        <TableCell>{getPriorityBadge(stock.status)}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
