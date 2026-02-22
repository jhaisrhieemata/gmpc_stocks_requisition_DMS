import { BranchGroup } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface BranchRequestsTableProps {
  groups: BranchGroup[];
  type: 'office' | 'special';
  onViewBranch: (group: BranchGroup) => void;
}

export function BranchRequestsTable({ groups, type, onViewBranch }: BranchRequestsTableProps) {
  return (
    <table className="table-dashboard">
      <thead>
        <tr>
          <th>Branch</th>
          <th className="text-center">Total Items</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {groups.length === 0 ? (
          <tr>
            <td colSpan={3} className="text-center py-8 text-muted-foreground">
              No pending {type === 'office' ? 'office supplies' : 'special'} requests
            </td>
          </tr>
        ) : (
          groups.map((group) => (
            <tr key={group.branch} className="animate-fade-in">
              <td className="font-medium">{group.branch}</td>
              <td className="text-center">
                <span className={type === 'office' ? 'badge-office' : 'badge-special'}>
                  {group.total}
                </span>
              </td>
              <td className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewBranch(group)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
