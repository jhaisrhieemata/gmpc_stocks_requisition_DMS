import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Printer,
  Calendar as CalendarIcon,
  Download,
  Filter,
  Upload,
} from 'lucide-react';
import { BRANCHES, formatCurrency } from '@/types';
import { mockInventory, mockOfficeRequests, mockSpecialRequests } from '@/services/api';

type DateFilter = 'day' | 'week' | 'month' | 'year' | 'custom';
type RequestType = 'all' | 'office' | 'special' | 'stocks';

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<RequestType>('all');
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  const getDateRange = () => {
    const now = selectedDate;
    switch (dateFilter) {
      case 'day':
        return { start: now, end: now };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: now, end: now };
    }
  };

  const dateRange = getDateRange();

  // Combined data for reports
  const allRequests = [
    ...mockOfficeRequests.flatMap((g) =>
      g.rows.map((r) => ({
        ...r,
        branch: g.branch,
        type: 'Office Supplies' as const,
        date: new Date(),
      }))
    ),
    ...mockSpecialRequests.flatMap((g) =>
      g.rows.map((r) => ({
        ...r,
        branch: g.branch,
        type: 'Special Request' as const,
        date: new Date(),
      }))
    ),
  ];

  const filteredRequests = allRequests.filter((req) => {
    const matchesSearch =
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'all' || req.branch === branchFilter;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'office' && req.type === 'Office Supplies') ||
      (typeFilter === 'special' && req.type === 'Special Request');
    return matchesSearch && matchesBranch && matchesType;
  });

  const filteredStocks = mockInventory.filter((stock) =>
    stock.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.itemId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title =
      typeFilter === 'stocks'
        ? 'Inventory Report'
        : typeFilter === 'office'
        ? 'Office Supplies Report'
        : typeFilter === 'special'
        ? 'Special Request Report'
        : 'All Requests Report';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #1976d2; color: white; }
            .total-row { background: #f5f5f5; font-weight: bold; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="meta">
            Period: ${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}<br/>
            Branch: ${branchFilter === 'all' ? 'All Branches' : branchFilter}<br/>
            Generated: ${new Date().toLocaleString()}
          </p>
          <table>
            <thead>
              <tr>
                ${
                  typeFilter === 'stocks'
                    ? '<th>Item ID</th><th>Description</th><th>Unit</th><th>Stocks</th><th>Status</th>'
                    : '<th>Branch</th><th>Type</th><th>Description</th><th>Qty</th><th>Unit</th><th>UPrice</th><th>Amount</th>'
                }
              </tr>
            </thead>
            <tbody>
              ${
                typeFilter === 'stocks'
                  ? filteredStocks
                      .map(
                        (s) => `
                      <tr>
                        <td>${s.itemId}</td>
                        <td>${s.description}</td>
                        <td>${s.unit}</td>
                        <td>${s.totalRunningStocks}</td>
                        <td>${s.status}</td>
                      </tr>
                    `
                      )
                      .join('')
                  : filteredRequests
                      .map(
                        (r) => `
                      <tr>
                        <td>${r.branch}</td>
                        <td>${r.type}</td>
                        <td>${r.description}</td>
                        <td>${r.qty}</td>
                        <td>${r.unit}</td>
                        <td>${formatCurrency(r.uprice)}</td>
                        <td>${formatCurrency(r.amount)}</td>
                      </tr>
                    `
                      )
                      .join('')
              }
              ${
                typeFilter !== 'stocks'
                  ? `<tr class="total-row">
                      <td colspan="6">Total</td>
                      <td>${formatCurrency(filteredRequests.reduce((sum, r) => sum + r.amount, 0))}</td>
                    </tr>`
                  : ''
              }
            </tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file);
      toast.success(`Template "${file.name}" uploaded successfully`);
    }
  };

  const handleGeneratePDF = () => {
    if (!templateFile) {
      toast.error('Please upload a template file first');
      return;
    }
    // TODO: Integrate with PHP backend to generate PDF with template
    toast.success('PDF generation started. This would integrate with your PHP backend.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and print filtered reports</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(selectedDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Branch Filter */}
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as RequestType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="office">Office Supplies</SelectItem>
                  <SelectItem value="special">Special Request</SelectItem>
                  <SelectItem value="stocks">Inventory Stocks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Import */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Template Import
          </CardTitle>
          <CardDescription>
            Upload a document template to generate PDF reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={handleTemplateUpload}
                className="cursor-pointer"
              />
            </div>
            {templateFile && (
              <Badge variant="secondary" className="gap-2">
                <FileText className="w-3 h-3" />
                {templateFile.name}
              </Badge>
            )}
            <Button onClick={handleGeneratePDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Generate PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Data */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-display">
            {typeFilter === 'stocks'
              ? 'Inventory Report'
              : typeFilter === 'office'
              ? 'Office Supplies Report'
              : typeFilter === 'special'
              ? 'Special Request Report'
              : 'All Requests Report'}
          </CardTitle>
          <CardDescription>
            {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
            {branchFilter !== 'all' && ` • ${branchFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typeFilter === 'stocks' ? (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Stocks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.itemId}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {stock.itemId}
                        </Badge>
                      </TableCell>
                      <TableCell>{stock.description}</TableCell>
                      <TableCell>{stock.unit}</TableCell>
                      <TableCell className="text-right">{stock.totalRunningStocks}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            stock.status === 'In Stock'
                              ? 'default'
                              : stock.status === 'Low Stock'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {stock.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">UPrice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant="secondary">{req.branch}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={req.type === 'Office Supplies' ? 'default' : 'outline'}
                          className={req.type === 'Office Supplies' ? 'bg-primary' : ''}
                        >
                          {req.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{req.description}</TableCell>
                      <TableCell>{req.qty}</TableCell>
                      <TableCell>{req.unit}</TableCell>
                      <TableCell className="text-right">{formatCurrency(req.uprice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(req.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted font-medium">
                    <TableCell colSpan={6} className="text-right">
                      Total
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(filteredRequests.reduce((sum, r) => sum + r.amount, 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
