import { useState } from 'react';
import { BranchGroup, RequisitionItem, formatCurrency, getEmailForBranch, OfficeSupplyStatus, SpecialRequestStatus } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Check, 
  Trash2, 
  Edit2, 
  Printer, 
  Mail, 
  Loader2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Wallet,
  ShoppingCart,
  FileCheck,
  Ban
} from 'lucide-react';

interface RequestModalProps {
  group: BranchGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const OFFICE_SUPPLY_STATUSES: { value: OfficeSupplyStatus; label: string; icon: React.ElementType }[] = [
  { value: 'Approved', label: 'Approved', icon: CheckCircle },
  { value: 'No Stocks Available', label: 'No Stocks Available', icon: XCircle },
  { value: 'Petty Cash By Branch', label: 'Petty Cash By Branch', icon: Wallet },
  { value: 'Cancelled', label: 'Cancel', icon: Ban },
];

const SPECIAL_REQUEST_STATUSES: { value: SpecialRequestStatus; label: string; icon: React.ElementType }[] = [
  { value: 'Approved By Purchasing', label: 'Approved By Purchasing Dept.', icon: FileCheck },
  { value: 'Approved By Accounting', label: 'Approved By Accounting Dept.', icon: CheckCircle },
  { value: 'Petty Cash By Branch', label: 'Petty Cash By Branch', icon: Wallet },
  { value: 'Cancelled', label: 'Cancel', icon: Ban },
  { value: 'To Purchased', label: 'To Purchased', icon: ShoppingCart },
];

export function RequestModal({ group, isOpen, onClose, onRefresh }: RequestModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<RequisitionItem | null>(null);
  const [editQty, setEditQty] = useState('');
  const [deleteRow, setDeleteRow] = useState<RequisitionItem | null>(null);

  if (!group) return null;

  const isSpecial = group.type === 'special';
  const totalAmount = group.rows.reduce((sum, r) => sum + r.amount, 0);
  const statusOptions = isSpecial ? SPECIAL_REQUEST_STATUSES : OFFICE_SUPPLY_STATUSES;

  const handleBatchStatus = async (status: OfficeSupplyStatus | SpecialRequestStatus) => {
    setLoading('batch');
    try {
      await api.batchUpdateStatus(group.rows, status);
      toast.success(`All ${group.rows.length} items updated to "${status}"`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(null);
    }
  };

  const handleApproveRow = async (item: RequisitionItem) => {
    setLoading(item.id);
    try {
      await api.approveRow(item.sheetName, item.rowNumber);
      toast.success('Item approved successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to approve item');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteRow = async () => {
    if (!deleteRow) return;
    setLoading(deleteRow.id);
    try {
      await api.deleteRow(deleteRow.sheetName, deleteRow.rowNumber);
      toast.success('Item deleted successfully');
      setDeleteRow(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setLoading(null);
    }
  };

  const handleEditQty = async () => {
    if (!editingRow) return;
    const newQty = parseInt(editQty);
    if (isNaN(newQty) || newQty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    setLoading(editingRow.id);
    try {
      await api.editQty(editingRow.sheetName, editingRow.rowNumber, newQty);
      toast.success('Quantity updated successfully');
      setEditingRow(null);
      setEditQty('');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setLoading(null);
    }
  };

  const handleEmail = (emailType: 'received' | 'claimed' | 'special') => {
    const email = getEmailForBranch(group.branch);
    let subject = '';
    let body = '';

    const itemsList = group.rows
      .map((r, i) => `${i + 1} - ${r.description} - ${r.qty} - ${r.unit}`)
      .join('\n');

    if (emailType === 'received') {
      subject = `OFFICE SUPPLIES RECEIVED – ${group.branch}`;
      body = `Good Day Ma'am/Sir,\n\nWe have received your office supplies request.\n\n${'='.repeat(60)}\n\nRequest Details:\n\n# - Description - Qty - Unit\n${'='.repeat(60)}\n${itemsList}\n${'='.repeat(60)}\n\nThank you, God bless!`;
    } else if (emailType === 'claimed') {
      subject = `OFFICE SUPPLIES READY FOR PICKUP – ${group.branch}`;
      body = `Good Day Ma'am/Sir,\n\nThe requested office supplies are ready for pickup.\n\n${'='.repeat(60)}\n\nRequest Details:\n\n# - Description - Qty - Unit\n${'='.repeat(60)}\n${itemsList}\n${'='.repeat(60)}\n\nThank you, God bless!`;
    } else {
      const detailedList = group.rows
        .map((r, i) => `${i + 1} - ${r.qty} - ${r.unit} - ${r.description} - ${formatCurrency(r.uprice)} - ${formatCurrency(r.amount)}`)
        .join('\n');
      subject = `SPECIAL REQUEST RECEIVED – ${group.branch}`;
      body = `Good Day Ma'am/Sir,\n\nWe have received your special request.\n\nNOTE: Please be informed that this request has been approved by our corporate accountant and has been endorsed to the disbursement officer for issuance.\n\n${'='.repeat(60)}\n\nSpecial Request Details:\n\n# - Qty - Unit - Description - Uprice - Amount\n${'='.repeat(60)}\n${detailedList}\n${'='.repeat(60)}\nTOTAL AMOUNT: ${formatCurrency(totalAmount)}\n\nThank you, God bless!`;
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    toast.success('Email composer opened');
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'Pending') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (status.includes('Approved')) {
      return <Badge className="bg-success text-xs">{status}</Badge>;
    }
    if (status === 'Cancelled') {
      return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
    }
    if (status === 'No Stocks Available') {
      return <Badge className="bg-warning text-warning-foreground text-xs">No Stock</Badge>;
    }
    if (status === 'Petty Cash By Branch') {
      return <Badge className="bg-office text-white text-xs">Petty Cash</Badge>;
    }
    if (status === 'To Purchased') {
      return <Badge className="bg-special text-white text-xs">To Purchase</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <span className={isSpecial ? 'badge-special' : 'badge-office'}>
                {isSpecial ? 'Special' : 'Office'}
              </span>
              Branch: {group.branch}
            </DialogTitle>
          </DialogHeader>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 py-3 border-b border-border">
            {/* Batch Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className={`gap-2 ${isSpecial ? 'bg-special hover:bg-special/90' : 'gradient-primary'}`}
                  disabled={loading === 'batch'}
                >
                  {loading === 'batch' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Batch Actions
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Update All Items Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleBatchStatus(option.value)}
                    className="gap-2"
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print PDF
            </Button>
            {isSpecial ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={() => handleEmail('special')}
              >
                <Mail className="w-4 h-4" />
                Special Request Email
              </Button>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => handleEmail('received')}
                >
                  <Mail className="w-4 h-4" />
                  Received Email
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => handleEmail('claimed')}
                >
                  <Mail className="w-4 h-4" />
                  Claimed Email
                </Button>
              </>
            )}
          </div>

          {/* Items table */}
          <div className="flex-1 overflow-auto">
            <table className="table-dashboard">
              <thead>
                <tr>
                  <th className="w-16">Qty</th>
                  <th className="w-20">Unit</th>
                  <th>Description</th>
                  <th className="text-right w-28">Unit Price</th>
                  <th className="text-right w-28">Amount</th>
                  <th className="w-28">Status</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.qty}</td>
                    <td>{item.unit}</td>
                    <td>{item.description}</td>
                    <td className="text-right font-mono">{formatCurrency(item.uprice)}</td>
                    <td className="text-right font-mono font-semibold">{formatCurrency(item.amount)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn-edit p-2"
                          onClick={() => {
                            setEditingRow(item);
                            setEditQty(item.qty.toString());
                          }}
                          disabled={loading === item.id}
                          title="Edit quantity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn-approve p-2"
                          onClick={() => handleApproveRow(item)}
                          disabled={loading === item.id}
                          title="Approve"
                        >
                          {loading === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          className="btn-delete p-2"
                          onClick={() => setDeleteRow(item)}
                          disabled={loading === item.id}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td colSpan={4} className="text-right font-semibold">Total:</td>
                  <td className="text-right font-mono font-bold text-lg">{formatCurrency(totalAmount)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Qty Dialog */}
      <Dialog open={!!editingRow} onOpenChange={() => setEditingRow(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {editingRow?.description}
            </p>
            <Input
              type="number"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              min={1}
              className="input-form"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingRow(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditQty} disabled={loading === editingRow?.id}>
                {loading === editingRow?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRow?.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRow}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
