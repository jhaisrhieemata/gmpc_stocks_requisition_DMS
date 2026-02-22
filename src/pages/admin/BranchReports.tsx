import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Building2,
  Printer,
  FileText,
  Download,
  TrendingUp,
} from 'lucide-react';
import { BRANCHES, formatCurrency } from '@/types';
import { mockOfficeRequests, mockSpecialRequests } from '@/services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BranchReports() {
  const [selectedBranch, setSelectedBranch] = useState<string>(BRANCHES[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  // Get branch-specific data
  const branchOfficeData = mockOfficeRequests.find((g) => g.branch === selectedBranch);
  const branchSpecialData = mockSpecialRequests.find((g) => g.branch === selectedBranch);

  const officeItems = branchOfficeData?.rows || [];
  const specialItems = branchSpecialData?.rows || [];

  const officeTotals = officeItems.reduce(
    (acc, item) => ({
      qty: acc.qty + item.qty,
      amount: acc.amount + item.amount,
    }),
    { qty: 0, amount: 0 }
  );

  const specialTotals = specialItems.reduce(
    (acc, item) => ({
      qty: acc.qty + item.qty,
      amount: acc.amount + item.amount,
    }),
    { qty: 0, amount: 0 }
  );

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file);
      toast.success(`Template "${file.name}" uploaded`);
    }
  };

  const handlePrintReport = (type: 'office' | 'special') => {
    const items = type === 'office' ? officeItems : specialItems;
    const totals = type === 'office' ? officeTotals : specialTotals;
    const title = type === 'office' ? 'Office Supplies' : 'Special Request';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedBranch} - ${title} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #1976d2; margin: 0; }
            .header h2 { color: #333; margin: 5px 0; }
            .meta { color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px 10px; text-align: left; }
            th { background: #1976d2; color: white; }
            .text-right { text-align: right; }
            .total-row { background: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 11px; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GIANT MOTO PRO CORPORATION</h1>
            <h2>${selectedBranch} Branch</h2>
            <h3>${title} Report</h3>
            <p class="meta">${selectedMonth} ${selectedYear}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Unit</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.description}</td>
                  <td>${item.unit}</td>
                  <td class="text-right">${item.qty}</td>
                  <td class="text-right">${formatCurrency(item.uprice)}</td>
                  <td class="text-right">${formatCurrency(item.amount)}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="3">TOTAL</td>
                <td class="text-right">${totals.qty}</td>
                <td></td>
                <td class="text-right">${formatCurrency(totals.amount)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleGeneratePDF = (type: 'office' | 'special') => {
    if (!templateFile) {
      toast.error('Please upload a template file first');
      return;
    }
    toast.success(`Generating ${type} PDF with template. Integrate with PHP backend.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Branch Reports</h1>
          <p className="text-muted-foreground">Monthly reports per branch</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Input type="file" accept=".doc,.docx,.pdf" onChange={handleTemplateUpload} />
            </div>
          </div>
          {templateFile && (
            <div className="mt-3">
              <Badge variant="secondary" className="gap-2">
                <FileText className="w-3 h-3" />
                {templateFile.name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branch Summary */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Office Supplies</p>
                <p className="text-2xl font-bold">{formatCurrency(officeTotals.amount)}</p>
                <p className="text-sm text-muted-foreground">{officeItems.length} items</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Special Requests</p>
                <p className="text-2xl font-bold">{formatCurrency(specialTotals.amount)}</p>
                <p className="text-sm text-muted-foreground">{specialItems.length} items</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="office" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="office">Office Supplies Report</TabsTrigger>
          <TabsTrigger value="special">Special Request Report</TabsTrigger>
        </TabsList>

        <TabsContent value="office">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedBranch} - Office Supplies
                </CardTitle>
                <CardDescription>
                  {selectedMonth} {selectedYear}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handlePrintReport('office')} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button onClick={() => handleGeneratePDF('office')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Generate PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officeItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No office supply requests for this branch
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {officeItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{item.qty}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.uprice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={3}>TOTAL</TableCell>
                        <TableCell className="text-right">{officeTotals.qty}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">{formatCurrency(officeTotals.amount)}</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedBranch} - Special Requests
                </CardTitle>
                <CardDescription>
                  {selectedMonth} {selectedYear}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handlePrintReport('special')} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button onClick={() => handleGeneratePDF('special')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Generate PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No special requests for this branch
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {specialItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{item.qty}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.uprice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={3}>TOTAL</TableCell>
                        <TableCell className="text-right">{specialTotals.qty}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">{formatCurrency(specialTotals.amount)}</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
