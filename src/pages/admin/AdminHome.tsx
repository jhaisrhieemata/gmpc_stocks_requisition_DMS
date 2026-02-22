import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { BranchGroup, DashboardStats } from '@/types';
import { StatusPieChart } from '@/components/dashboard/StatusPieChart';
import { BranchRequestsTable } from '@/components/dashboard/BranchRequestsTable';
import { RequestModal } from '@/components/dashboard/RequestModal';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  FileText, 
  ClipboardList,
  Package
} from 'lucide-react';

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [officeRequests, setOfficeRequests] = useState<BranchGroup[]>([]);
  const [specialRequests, setSpecialRequests] = useState<BranchGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<BranchGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, officeData, specialData] = await Promise.all([
        api.getDashboardStats(),
        api.getOfficeRequests(),
        api.getSpecialRequests(),
      ]);
      setStats(statsData);
      setOfficeRequests(officeData);
      setSpecialRequests(specialData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const officeCount = officeRequests.reduce((sum, g) => sum + g.total, 0);
  const specialCount = specialRequests.reduce((sum, g) => sum + g.total, 0);

  // Calculate status counts for pie charts
  const officeStatusCounts: Record<string, number> = {
    'Approved': 0,
    'Pending': 0,
    'No Stocks': 0,
    'Petty Cash': 0,
    'Cancelled': 0,
  };
  
  officeRequests.forEach(group => {
    group.rows.forEach(row => {
      const status = row.status || 'Pending';
      if (status === 'Approved') officeStatusCounts['Approved']++;
      else if (status === 'Pending') officeStatusCounts['Pending']++;
      else if (status === 'No Stocks Available') officeStatusCounts['No Stocks']++;
      else if (status === 'Petty Cash By Branch') officeStatusCounts['Petty Cash']++;
      else if (status === 'Cancelled') officeStatusCounts['Cancelled']++;
    });
  });

  const specialStatusCounts: Record<string, number> = {
    'Approved (Purchasing)': 0,
    'Approved (Accounting)': 0,
    'Pending': 0,
    'Petty Cash': 0,
    'Cancelled': 0,
    'To Purchased': 0,
  };
  
  specialRequests.forEach(group => {
    group.rows.forEach(row => {
      const status = row.status || 'Pending';
      if (status === 'Approved By Purchasing') specialStatusCounts['Approved (Purchasing)']++;
      else if (status === 'Approved By Accounting') specialStatusCounts['Approved (Accounting)']++;
      else if (status === 'Pending') specialStatusCounts['Pending']++;
      else if (status === 'Petty Cash By Branch') specialStatusCounts['Petty Cash']++;
      else if (status === 'Cancelled') specialStatusCounts['Cancelled']++;
      else if (status === 'To Purchased') specialStatusCounts['To Purchased']++;
    });
  });

  // Filter out zero counts
  const filteredOfficeStatusCounts = Object.fromEntries(
    Object.entries(officeStatusCounts).filter(([_, v]) => v > 0)
  );
  const filteredSpecialStatusCounts = Object.fromEntries(
    Object.entries(specialStatusCounts).filter(([_, v]) => v > 0)
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Badges */}
          <span className={officeCount > 0 ? 'badge-office' : 'badge-success'}>
            Office: {officeCount}
          </span>
          <span className={specialCount > 0 ? 'badge-special' : 'badge-success'}>
            Special: {specialCount}
          </span>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Pie Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Office Supplies Pie Chart */}
          <div className="card-dashboard animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-office" />
              <h2 className="text-lg font-display font-semibold">Office Supplies Status</h2>
            </div>
            <StatusPieChart data={Object.keys(filteredOfficeStatusCounts).length > 0 ? filteredOfficeStatusCounts : (stats?.statusCounts || {})} />
          </div>

          {/* Special Request Pie Chart */}
          <div className="card-dashboard animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-special" />
              <h2 className="text-lg font-display font-semibold">Special Request Status</h2>
            </div>
            <StatusPieChart data={Object.keys(filteredSpecialStatusCounts).length > 0 ? filteredSpecialStatusCounts : (stats?.statusCounts || {})} />
          </div>
        </div>

        {/* Pending Requests Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Special Requests */}
          <div className="card-dashboard animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-special" />
              <h2 className="text-lg font-display font-semibold">Pending – Special Request</h2>
            </div>
            <BranchRequestsTable 
              groups={specialRequests} 
              type="special"
              onViewBranch={setSelectedGroup}
            />
          </div>

          {/* Office Supplies */}
          <div className="card-dashboard animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-office" />
              <h2 className="text-lg font-display font-semibold">Pending – Office Supplies</h2>
            </div>
            <BranchRequestsTable 
              groups={officeRequests} 
              type="office"
              onViewBranch={setSelectedGroup}
            />
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal 
        group={selectedGroup}
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onRefresh={fetchData}
      />
    </div>
  );
}