import { useState } from 'react';
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
  DialogDescription,
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
import { Users, Search, Edit, Trash2, Save, Shield, PlusCircle, Key, Mail, Check, X } from 'lucide-react';
import { User, UserRole, BRANCHES, BRANCH_ROLES, ROLE_LABELS } from '@/types';

// Mock users data with password reset requests
interface UserWithRequest extends User {
  hasPasswordResetRequest?: boolean;
  requestDate?: string;
}

const mockUsers: UserWithRequest[] = [
  { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'manager@lagtang.com', name: 'John Dela Cruz', role: 'branch_manager', branch: 'LAGTANG', hasPasswordResetRequest: true, requestDate: '2024-01-20' },
  { id: '3', email: 'cashier@bacayan.com', name: 'Maria Santos', role: 'cashier', branch: 'BACAYAN' },
  { id: '4', email: 'accountant@toledo.com', name: 'Pedro Garcia', role: 'accountant', branch: 'TOLEDO', hasPasswordResetRequest: true, requestDate: '2024-01-19' },
];

export default function ManageUsers() {
  const [users, setUsers] = useState<UserWithRequest[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserWithRequest | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithRequest | null>(null);
  const [showDeletePermission, setShowDeletePermission] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'branch_manager' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetUser, setResetUser] = useState<UserWithRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const allRoles: UserRole[] = ['admin', ...BRANCH_ROLES];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Count password reset requests
  const resetRequestCount = users.filter(u => u.hasPasswordResetRequest).length;

  const handleEdit = (user: UserWithRequest) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    toast.success(`User "${editingUser.name}" updated successfully!`);
    setEditingUser(null);
    setIsSubmitting(false);
  };

  const handleDeleteRequest = (user: UserWithRequest) => {
    setDeletingUser(user);
    setShowDeletePermission(true);
    setDeletePassword('');
  };

  const handleConfirmDelete = async () => {
    if (deletePassword !== 'ADMIN@DELETE') {
      toast.error('Invalid permission password');
      return;
    }

    if (!deletingUser) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    toast.success(`User "${deletingUser.name}" deleted successfully!`);
    setDeletingUser(null);
    setShowDeletePermission(false);
    setDeletePassword('');
    setIsSubmitting(false);
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (newUser.role !== 'admin' && !newUser.branch) {
      toast.error('Please select a branch');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const user: UserWithRequest = {
      id: crypto.randomUUID(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as UserRole,
      branch: newUser.role !== 'admin' ? newUser.branch : undefined,
    };

    setUsers([...users, user]);
    toast.success(`User "${user.name}" added successfully!`);
    setShowAddUser(false);
    setNewUser({ role: 'branch_manager' });
    setIsSubmitting(false);
  };

  const handlePasswordResetOpen = (user: UserWithRequest) => {
    setResetUser(user);
    setShowPasswordReset(true);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordReset = async () => {
    if (!resetUser) return;
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    // Update user and remove reset request
    setUsers(prev => 
      prev.map(u => 
        u.id === resetUser.id 
          ? { ...u, hasPasswordResetRequest: false, requestDate: undefined }
          : u
      )
    );

    toast.success(`Password updated for "${resetUser.name}"`);
    setShowPasswordReset(false);
    setResetUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setIsSubmitting(false);
  };

  const handleDismissRequest = async (user: UserWithRequest) => {
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id 
          ? { ...u, hasPasswordResetRequest: false, requestDate: undefined }
          : u
      )
    );
    toast.info(`Password reset request dismissed for "${user.name}"`);
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === 'admin') {
      return <Badge className="bg-primary">Admin</Badge>;
    }
    return <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground">Add, edit, and manage user accounts</p>
        </div>
      </div>

      {/* Password Reset Requests Alert */}
      {resetRequestCount > 0 && (
        <Card className="mb-6 border-warning bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-warning">
              <Key className="w-5 h-5" />
              Password Reset Requests ({resetRequestCount})
            </CardTitle>
            <CardDescription>
              The following users have requested a password reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.filter(u => u.hasPasswordResetRequest).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email} • Requested: {user.requestDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissRequest(user)}
                      className="gap-1"
                    >
                      <X className="w-4 h-4" />
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePasswordResetOpen(user)}
                      className="gap-1"
                    >
                      <Key className="w-4 h-4" />
                      Update Password
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="font-display">User Accounts</CardTitle>
            <CardDescription>{filteredUsers.length} users found</CardDescription>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {allRoles.map(r => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddUser(true)} className="gap-2 gradient-primary">
              <PlusCircle className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.branch ? (
                        <Badge variant="outline">{user.branch}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.hasPasswordResetRequest && (
                        <Badge variant="secondary" className="bg-warning/20 text-warning gap-1">
                          <Key className="w-3 h-3" />
                          Reset Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.hasPasswordResetRequest && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePasswordResetOpen(user)}
                            className="text-warning hover:bg-warning/10"
                            title="Update Password"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRequest(user)}
                          className="text-destructive hover:bg-destructive/10"
                          disabled={user.role === 'admin'}
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

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="John Doe"
                value={newUser.name || ''}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newUser.email || ''}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(v) => setNewUser({ ...newUser, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  {BRANCH_ROLES.map(r => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newUser.role !== 'admin' && (
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select
                  value={newUser.branch || ''}
                  onValueChange={(v) => setNewUser({ ...newUser, branch: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isSubmitting} className="gap-2">
              <Save className="w-4 h-4" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editingUser?.name || ''}
                onChange={(e) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editingUser?.email || ''}
                onChange={(e) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={editingUser?.role}
                onValueChange={(v) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, role: v as UserRole } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  {BRANCH_ROLES.map(r => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingUser?.role !== 'admin' && (
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select
                  value={editingUser?.branch || ''}
                  onValueChange={(v) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, branch: v } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Update Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for {resetUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm"><strong>User:</strong> {resetUser?.name}</p>
              <p className="text-sm"><strong>Email:</strong> {resetUser?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>New Password *</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordReset(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordReset} disabled={isSubmitting} className="gap-2">
              <Check className="w-4 h-4" />
              Update Password
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
              Deleting a user account is a restricted action. Please enter the admin permission
              password to proceed with deleting "{deletingUser?.name}".
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
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
