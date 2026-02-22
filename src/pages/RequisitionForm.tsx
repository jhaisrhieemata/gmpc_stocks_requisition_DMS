import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RequisitionItem, BRANCHES, formatCurrency } from '@/types';
import { api, mockInventory } from '@/services/api';

import { ItemsTable } from '@/components/requisition/ItemsTable';
import { SignaturePad, SignaturePadRef } from '@/components/requisition/SignaturePad';
import { NetworkStatusModal } from '@/components/NetworkStatusModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Package, 
  LogOut, 
  Send, 
  RotateCcw, 
  Eraser,
  AlertTriangle,
  CheckCircle2,
  Home,
  Printer
} from 'lucide-react';

// Unit pluralization map
const UNIT_PLURAL_MAP: Record<string, string> = {
  REAM: 'REAMS',
  PC: 'PCS',
  PAD: 'PADS',
  BOX: 'BOXES',
  PACK: 'PACKS',
  BDL: 'BDLS',
  BTL: 'BTLS',
  ROLL: 'ROLLS',
  SET: 'SETS',
  UNIT: 'UNITS',
};

function getPluralUnit(unit: string, qty: number): string {
  if (qty <= 1) return unit;
  const upperUnit = unit.toUpperCase();
  return UNIT_PLURAL_MAP[upperUnit] || unit;
}

// Generate PDF for printing
function generatePDF(formData: {
  branch: string;
  date: string;
  to: string;
  purpose: string;
  items: RequisitionItem[];
  note: string;
  requestedBy: string;
  signature: string;
}) {
  const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Please allow popups to generate PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Requisition Slip - ${formData.branch}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            max-width: 800px; 
            margin: 0 auto;
            font-size: 12px;
          }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .header p { font-size: 11px; color: #666; }
          .title { 
            text-align: center; 
            font-size: 16px; 
            font-weight: bold; 
            margin: 20px 0;
            text-decoration: underline;
          }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .info-item { display: flex; gap: 5px; }
          .info-label { font-weight: bold; }
          .info-value { border-bottom: 1px solid #000; min-width: 150px; padding-left: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; }
          .amount { text-align: right; }
          .total-row { font-weight: bold; background: #f9f9f9; }
          .note-section { margin: 15px 0; }
          .note-label { font-weight: bold; }
          .note-content { border: 1px solid #ccc; padding: 10px; min-height: 50px; margin-top: 5px; }
          .signature-section { margin-top: 30px; }
          .signature-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-bottom: 1px solid #000; height: 40px; margin-bottom: 5px; }
          .signature-image { max-width: 150px; max-height: 50px; }
          .footer { margin-top: 20px; font-size: 10px; color: #666; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GIANT MOTO PRO</h1>
          <p>CEBU SOUTH ROAD N. BACALSO AVE. BULACAO, TALISAY CITY CEBU</p>
        </div>

        <div class="title">Requisition Slip</div>

        <div class="info-row">
          <div class="info-item">
            <span class="info-label">Branch/Department:</span>
            <span class="info-value">${formData.branch}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date:</span>
            <span class="info-value">${new Date(formData.date).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="info-label">To:</span>
            <span class="info-value">${formData.to}</span>
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="info-label">Purpose of Request:</span>
            <span class="info-value">${formData.purpose}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%">Qty</th>
              <th style="width: 15%">Unit</th>
              <th style="width: 40%">Description</th>
              <th style="width: 15%" class="amount">Unit Price</th>
              <th style="width: 20%" class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${formData.items.map(item => `
              <tr>
                <td>${item.qty}</td>
                <td>${getPluralUnit(item.unit, item.qty)}</td>
                <td>${item.description}</td>
                <td class="amount">₱${formatCurrency(item.uprice)}</td>
                <td class="amount">₱${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" class="amount">TOTAL:</td>
              <td class="amount">₱${formatCurrency(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="note-section">
          <div class="note-label">Note:</div>
          <div class="note-content">${formData.note || '—'}</div>
        </div>

        <div class="signature-section">
          <div class="signature-row">
            <div class="signature-box">
              ${formData.signature ? `<img src="${formData.signature}" class="signature-image" alt="Signature" />` : '<div class="signature-line"></div>'}
              <div class="signature-label">Requested By: <strong>${formData.requestedBy}</strong></div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Received By: _____________ Date: _______</div>
            </div>
          </div>

          <div class="signature-row">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Verified by: _____________<br/>(Acct'g/Inventory/Operations)</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Approved By: _____________<br/>(Acct'g/Inventory/Operations)</div>
            </div>
          </div>

          <div class="signature-row" style="justify-content: center;">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Special Approval: _____________ (For Significant and Extra Ordinary)<br/>CEO/FO</div>
            </div>
          </div>

          <div class="signature-row">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Date Accomplished/Delivered: _____________</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Received/Checked By: _____________</div>
            </div>
          </div>
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleString()}
        </div>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Deduct inventory stock after submission
function deductInventoryStock(items: RequisitionItem[]) {
  items.forEach(item => {
    const inventoryItem = mockInventory.find(i => i.description === item.description);
    if (inventoryItem) {
      inventoryItem.totalRunningStocks = Math.max(0, inventoryItem.totalRunningStocks - item.qty);
      inventoryItem.qty = Math.max(0, inventoryItem.qty - item.qty);
      
      // Update status based on remaining stock
      if (inventoryItem.totalRunningStocks === 0) {
        inventoryItem.status = 'Out of Stock';
      } else if (inventoryItem.totalRunningStocks <= 5) {
        inventoryItem.status = 'Critical';
      } else if (inventoryItem.totalRunningStocks <= 10) {
        inventoryItem.status = 'Low Stock';
      }
    }
  });
}

export default function RequisitionForm() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const signatureRef = useRef<SignaturePadRef>(null);

  // Form state
  const [branch, setBranch] = useState(user?.branch || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [to, setTo] = useState('PURCHASING OFFICE');
  const [purpose, setPurpose] = useState<'OFFICE SUPPLIES' | 'SPECIAL REQUEST' | ''>('');
  const [items, setItems] = useState<RequisitionItem[]>([]);
  const [note, setNote] = useState('');
  const [requestedBy, setRequestedBy] = useState(user?.name || '');
  const [hasSignature, setHasSignature] = useState(false);

  // Modal state
  const [showSignatureWarning, setShowSignatureWarning] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedFormData, setSubmittedFormData] = useState<any>(null);

  const handlePurposeChange = (value: 'OFFICE SUPPLIES' | 'SPECIAL REQUEST') => {
    setPurpose(value);
    setItems([]);
    if (value === 'SPECIAL REQUEST') {
      // Add initial empty row for special requests
      setItems([{
        id: Math.random().toString(36).substr(2, 9),
        qty: 1,
        unit: 'PC',
        description: '',
        uprice: 0,
        amount: 0,
        sheetName: '',
        rowNumber: 0,
      }]);
    }
  };

  const resetForm = () => {
    setBranch(user?.branch || '');
    setDate(new Date().toISOString().split('T')[0]);
    setTo('PURCHASING OFFICE');
    setPurpose('');
    setItems([]);
    setNote('');
    setRequestedBy(user?.name || '');
    signatureRef.current?.clear();
    setHasSignature(false);
    setSubmittedFormData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!hasSignature || signatureRef.current?.isEmpty()) {
      setShowSignatureWarning(true);
      return;
    }

    // Check signature validity (this will show toast if invalid)
    const signatureData = signatureRef.current?.toDataURL();
    if (!signatureData) {
      return; // Toast already shown by SignaturePad
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (purpose === 'SPECIAL REQUEST' && !note.trim()) {
      toast.error('Please add a note for special requests');
      return;
    }

    // Start processing
    setShowProcessing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = {
        branch,
        date,
        to,
        purpose,
        items,
        note,
        requestedBy,
        signature: signatureData,
      };

      // Submit requisition
      const result = await api.submitRequisition(formData);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setSubmittedFormData(formData);
        
        // Deduct inventory for office supplies
        if (purpose === 'OFFICE SUPPLIES') {
          deductInventoryStock(items);
        }

        setTimeout(() => {
          setShowProcessing(false);
          setShowSuccess(true);
        }, 500);
      } else {
        setShowProcessing(false);
        toast.error('Failed to submit requisition');
      }
    } catch {
      clearInterval(progressInterval);
      setShowProcessing(false);
      toast.error('An error occurred');
    }
  };

  const handlePrintPDF = () => {
    if (submittedFormData) {
      generatePDF(submittedFormData);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Network Status Modal */}
      <NetworkStatusModal />

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-foreground">
                  Requisition Form
                </h1>
                <p className="text-xs text-muted-foreground">
                  Submit your request
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user?.name}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="font-display">New Requisition</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch/Department</Label>
                  <Select value={branch} onValueChange={setBranch} required>
                    <SelectTrigger className="input-form">
                      <SelectValue placeholder="Select branch" />
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="input-form"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Select value={to} onValueChange={setTo} required>
                    <SelectTrigger className="input-form">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASING OFFICE">PURCHASING OFFICE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Request</Label>
                  <Select value={purpose} onValueChange={(v) => handlePurposeChange(v as 'OFFICE SUPPLIES' | 'SPECIAL REQUEST')} required>
                    <SelectTrigger className="input-form">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFFICE SUPPLIES">OFFICE SUPPLIES</SelectItem>
                      <SelectItem value="SPECIAL REQUEST">SPECIAL REQUEST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items Table */}
              {purpose && (
                <ItemsTable
                  items={items}
                  onChange={setItems}
                  isOfficeSupplies={purpose === 'OFFICE SUPPLIES'}
                />
              )}

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">
                  Note {purpose === 'SPECIAL REQUEST' && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Request details here..."
                  rows={3}
                  required={purpose === 'SPECIAL REQUEST'}
                  className="input-form resize-none"
                />
              </div>

              {/* Requested By */}
              <div className="space-y-2">
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input
                  id="requestedBy"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder="Complete Name of Branch Manager"
                  required
                  className="input-form"
                />
              </div>

              {/* Signature */}
              <div className="space-y-3">
                <Label>E-Signature</Label>
                <p className="text-sm text-primary">Please provide a wider signature.</p>
                <SignaturePad ref={signatureRef} onSignatureChange={setHasSignature} />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => signatureRef.current?.clear()}
                    className="gap-1"
                  >
                    <Eraser className="w-4 h-4" />
                    Clear Signature
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button type="submit" className="gap-2 gradient-primary">
                  <Send className="w-4 h-4" />
                  Submit Request
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Signature Warning Modal */}
      <Dialog open={showSignatureWarning} onOpenChange={setShowSignatureWarning}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <DialogTitle>Signature Required</DialogTitle>
            <DialogDescription>
              Please sign the form before submitting.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSignatureWarning(false)} className="w-full">
            Go to Signature Pad
          </Button>
        </DialogContent>
      </Dialog>

      {/* Processing Modal */}
      <Dialog open={showProcessing} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm text-center" hideCloseButton>
          <DialogHeader>
            <DialogTitle>Processing Request</DialogTitle>
            <DialogDescription>
              Saving your requisition...
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <DialogTitle>Submitted Successfully!</DialogTitle>
            <DialogDescription>
              Your requisition has been submitted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handlePrintPDF}
              className="w-full gap-2 gradient-primary"
            >
              <Printer className="w-4 h-4" />
              Print Requisition Slip
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowSuccess(false);
                resetForm();
              }}
              className="w-full gap-2"
            >
              Submit Another Request
            </Button>
            <Button 
              variant="ghost"
              onClick={() => {
                setShowSuccess(false);
                navigate('/');
              }}
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
