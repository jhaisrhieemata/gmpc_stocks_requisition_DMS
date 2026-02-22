import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, CalendarDays, FileText, Eye } from 'lucide-react';
import { BRANCHES, formatCurrency } from '@/types';

interface BranchRequest {
  id: string;
  date: Date;
  type: 'office' | 'special';
  itemCount: number;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Completed';
  items: { description: string; qty: number; unit: string; amount: number }[];
}

// Mock data - replace with actual API
const mockBranchRequests: Record<string, BranchRequest[]> = {
  LAGTANG: [
    {
      id: '1',
      date: new Date(2026, 0, 15),
      type: 'office',
      itemCount: 3,
      totalAmount: 1840,
      status: 'Pending',
      items: [
        { description: 'Bond Paper A4', qty: 5, unit: 'REAM', amount: 1250 },
        { description: 'Ballpen Black', qty: 2, unit: 'BOX', amount: 240 },
        { description: 'Stapler', qty: 1, unit: 'PC', amount: 350 },
      ],
    },
    {
      id: '2',
      date: new Date(2026, 0, 20),
      type: 'special',
      itemCount: 1,
      totalAmount: 8500,
      status: 'Approved',
      items: [{ description: 'Office Chair', qty: 1, unit: 'UNIT', amount: 8500 }],
    },
    {
      id: '3',
      date: new Date(2026, 0, 28),
      type: 'office',
      itemCount: 2,
      totalAmount: 520,
      status: 'Pending',
      items: [
        { description: 'Yellow Pad', qty: 10, unit: 'PAD', amount: 450 },
        { description: 'Marker', qty: 2, unit: 'PC', amount: 70 },
      ],
    },
  ],
  BACAYAN: [
    {
      id: '4',
      date: new Date(2026, 0, 10),
      type: 'office',
      itemCount: 2,
      totalAmount: 775,
      status: 'Completed',
      items: [
        { description: 'Yellow Pad', qty: 10, unit: 'PAD', amount: 450 },
        { description: 'Correction Tape', qty: 5, unit: 'PC', amount: 325 },
      ],
    },
  ],
  TOLEDO: [
    {
      id: '5',
      date: new Date(2026, 0, 22),
      type: 'office',
      itemCount: 4,
      totalAmount: 1305,
      status: 'Pending',
      items: [
        { description: 'Bond Paper Legal', qty: 3, unit: 'REAM', amount: 840 },
        { description: 'Staple Wire', qty: 1, unit: 'BOX', amount: 85 },
        { description: 'Masking Tape', qty: 2, unit: 'ROLL', amount: 110 },
        { description: 'Marker Black', qty: 6, unit: 'PC', amount: 270 },
      ],
    },
  ],
};

export default function BranchesDashboard() {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [requests, setRequests] = useState<BranchRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BranchRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Get requests for selected branch
  useEffect(() => {
    if (selectedBranch) {
      // TODO: Replace with actual API call
      const branchRequests = mockBranchRequests[selectedBranch] || [];
      setRequests(branchRequests);
    } else {
      setRequests([]);
    }
  }, [selectedBranch]);

  // Get dates with requests for calendar highlighting
  const requestDates = requests.map((r) => r.date);
  
  // Filter requests by selected date
  const filteredRequests = selectedDate
    ? requests.filter(
        (r) =>
          r.date.getDate() === selectedDate.getDate() &&
          r.date.getMonth() === selectedDate.getMonth() &&
          r.date.getFullYear() === selectedDate.getFullYear()
      )
    : [];

  const viewRequestDetail = (request: BranchRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'Approved':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'Completed':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Branches Dashboard</h1>
          <p className="text-muted-foreground">View requests by branch with calendar</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Branch Selection & Calendar */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Select Branch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBranch && (
              <div className="pt-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasRequest: requestDates,
                  }}
                  modifiersStyles={{
                    hasRequest: {
                      backgroundColor: 'hsl(var(--primary) / 0.15)',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                    },
                  }}
                  className="rounded-lg border p-3"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Highlighted dates have requests
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedBranch ? `${selectedBranch} Requests` : 'Select a Branch'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedBranch ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a branch to view requests</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No requests on {selectedDate?.toLocaleDateString()}</p>
                <p className="text-sm mt-1">
                  Total requests for {selectedBranch}: {requests.length}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          request.type === 'office' ? 'bg-office/20' : 'bg-special/20'
                        }`}
                      >
                        <FileText
                          className={`w-5 h-5 ${
                            request.type === 'office' ? 'text-office' : 'text-special'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {request.type === 'office' ? 'Office Supplies' : 'Special Request'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.itemCount} items • ₱{formatCurrency(request.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewRequestDetail(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All requests summary */}
            {selectedBranch && requests.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">All Requests Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-warning/10">
                    <p className="text-2xl font-bold text-warning">
                      {requests.filter((r) => r.status === 'Pending').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <p className="text-2xl font-bold text-primary">
                      {requests.filter((r) => r.status === 'Approved').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-success/10">
                    <p className="text-2xl font-bold text-success">
                      {requests.filter((r) => r.status === 'Completed').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    selectedRequest.type === 'office' ? 'badge-office' : 'badge-special'
                  }
                >
                  {selectedRequest.type === 'office' ? 'Office Supplies' : 'Special Request'}
                </Badge>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                Date: {selectedRequest.date.toLocaleDateString()}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-center">Unit</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-center">{item.qty}</td>
                        <td className="px-3 py-2 text-center">{item.unit}</td>
                        <td className="px-3 py-2 text-right">
                          ₱{formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-medium">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right">
                        Total:
                      </td>
                      <td className="px-3 py-2 text-right">
                        ₱{formatCurrency(selectedRequest.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
