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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Search, Edit, Trash2, Save, Shield, Eye, EyeOff, Tag } from 'lucide-react';
import { BRANCHES, BRANCH_EMAIL_MAP, BRANCH_CLASSIFICATIONS, BRANCH_CLASSIFICATION_MAP, BranchClassification } from '@/types';

interface Branch {
  name: string;
  email: string;
  location?: string;
  status: 'active' | 'inactive';
  classification: BranchClassification;
}

export default function ManageBranches() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [showDeletePermission, setShowDeletePermission] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert static data to editable format
  const [branches, setBranches] = useState<Branch[]>(
    BRANCHES.map((name) => ({
      name,
      email: BRANCH_EMAIL_MAP[name] || '',
      status: 'active' as const,
      classification: BRANCH_CLASSIFICATION_MAP[name] || 'Multibrand',
    }))
  );

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (branch: Branch) => {
    setEditingBranch({ ...branch });
  };

  const handleSaveEdit = async () => {
    if (!editingBranch) return;

    setIsSubmitting(true);
    // TODO: Replace with actual PHP API call
    await new Promise((r) => setTimeout(r, 500));

    setBranches((prev) =>
      prev.map((b) => (b.name === editingBranch.name ? editingBranch : b))
    );
    toast.success(`Branch "${editingBranch.name}" updated successfully!`);
    setEditingBranch(null);
    setIsSubmitting(false);
  };

  const handleDeleteRequest = (branch: Branch) => {
    setDeletingBranch(branch);
    setShowDeletePermission(true);
    setDeletePassword('');
  };

  const handleConfirmDelete = async () => {
    // Hidden delete permission - requires admin password
    if (deletePassword !== 'ADMIN@DELETE') {
      toast.error('Invalid permission password');
      return;
    }

    if (!deletingBranch) return;

    setIsSubmitting(true);
    // TODO: Replace with actual PHP API call
    await new Promise((r) => setTimeout(r, 500));

    setBranches((prev) => prev.filter((b) => b.name !== deletingBranch.name));
    toast.success(`Branch "${deletingBranch.name}" deleted successfully!`);
    setDeletingBranch(null);
    setShowDeletePermission(false);
    setDeletePassword('');
    setIsSubmitting(false);
  };

  const toggleStatus = async (branch: Branch) => {
    const newStatus = branch.status === 'active' ? 'inactive' : 'active';
    setBranches((prev) =>
      prev.map((b) => (b.name === branch.name ? { ...b, status: newStatus } : b))
    );
    toast.success(`Branch "${branch.name}" is now ${newStatus}`);
  };

  const getClassificationBadge = (classification: BranchClassification) => {
    const colors: Record<BranchClassification, string> = {
      'Multibrand': 'bg-primary',
      'Yamaha 3S': 'bg-special',
      'Parts & Accessories': 'bg-warning text-warning-foreground',
      'Service Center': 'bg-success',
    };
    return <Badge className={colors[classification]}>{classification}</Badge>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Manage Branches</h1>
          <p className="text-muted-foreground">Edit, update, and manage branch settings</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display">All Branches</CardTitle>
            <CardDescription>{filteredBranches.length} branches found</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.name}>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {branch.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getClassificationBadge(branch.classification)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {branch.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={branch.status === 'active' ? 'default' : 'outline'}
                        className={branch.status === 'active' ? 'bg-success' : ''}
                      >
                        {branch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(branch)}
                          title={branch.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {branch.status === 'active' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(branch)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRequest(branch)}
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
      <Dialog open={!!editingBranch} onOpenChange={() => setEditingBranch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input value={editingBranch?.name || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={editingBranch?.email || ''}
                onChange={(e) =>
                  setEditingBranch((prev) => (prev ? { ...prev, email: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Classification</Label>
              <Select 
                value={editingBranch?.classification || 'Multibrand'}
                onValueChange={(value: BranchClassification) =>
                  setEditingBranch((prev) => (prev ? { ...prev, classification: value } : null))
                }
              >
                <SelectTrigger>
                  <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCH_CLASSIFICATIONS.map((classification) => (
                    <SelectItem key={classification} value={classification}>
                      {classification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={editingBranch?.location || ''}
                onChange={(e) =>
                  setEditingBranch((prev) => (prev ? { ...prev, location: e.target.value } : null))
                }
                placeholder="Branch address (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBranch(null)}>
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
              Deleting a branch is a restricted action. Please enter the admin permission
              password to proceed with deleting "{deletingBranch?.name}".
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
              Delete Branch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}