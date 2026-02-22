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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Building2, PlusCircle, Save, Mail, MapPin, Tag } from 'lucide-react';
import { BRANCHES, BRANCH_EMAIL_MAP, BRANCH_CLASSIFICATIONS, BRANCH_CLASSIFICATION_MAP, BranchClassification } from '@/types';

interface NewBranch {
  name: string;
  email: string;
  location: string;
  classification: BranchClassification;
}

export default function AddBranch() {
  const [newBranch, setNewBranch] = useState<NewBranch>({
    name: '',
    email: '',
    location: '',
    classification: 'Multibrand',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBranch.name.trim() || !newBranch.email.trim()) {
      toast.error('Branch name and email are required');
      return;
    }

    // Check if branch already exists
    if (BRANCHES.includes(newBranch.name.toUpperCase())) {
      toast.error('Branch already exists');
      return;
    }

    setIsSubmitting(true);

    // TODO: Replace with actual PHP API call
    // await fetch('/api/add-branch.php', { method: 'POST', body: JSON.stringify(newBranch) })
    await new Promise((r) => setTimeout(r, 1000));

    toast.success(`Branch "${newBranch.name}" added successfully!`);
    
    setNewBranch({ name: '', email: '', location: '', classification: 'Multibrand' });
    setIsSubmitting(false);
  };

  const getClassificationBadge = (branch: string) => {
    const classification = BRANCH_CLASSIFICATION_MAP[branch] || 'Multibrand';
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
          <h1 className="text-2xl font-display font-bold text-foreground">Add Branch</h1>
          <p className="text-muted-foreground">Register a new branch to the system</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add Branch Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              New Branch
            </CardTitle>
            <CardDescription>
              Enter the details for the new branch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Branch Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="e.g., CEBU MAIN"
                    value={newBranch.name}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, name: e.target.value.toUpperCase() })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Branch Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="branch@example.com"
                    value={newBranch.email}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, email: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classification">
                  Branch Classification <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={newBranch.classification} 
                  onValueChange={(value: BranchClassification) =>
                    setNewBranch({ ...newBranch, classification: value })
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
                <Label htmlFor="location">Location / Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Branch address (optional)"
                    value={newBranch.location}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, location: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 gradient-primary"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Adding Branch...' : 'Add Branch'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Branches List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Existing Branches
            </CardTitle>
            <CardDescription>
              {BRANCHES.length} branches registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {BRANCHES.map((branch) => (
                    <TableRow key={branch}>
                      <TableCell>
                        <Badge variant="secondary">{branch}</Badge>
                      </TableCell>
                      <TableCell>
                        {getClassificationBadge(branch)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {BRANCH_EMAIL_MAP[branch]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
