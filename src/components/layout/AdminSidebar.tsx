import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  Building2,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  Truck,
  Package,
  FileCheck,
  Boxes,
} from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Home', icon: Home },
  { path: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { path: '/admin/stock-suppliers', label: 'Stock Suppliers', icon: Truck },
  { path: '/admin/manage-stock-suppliers', label: 'Manage Stocks', icon: Package },
  { path: '/admin/office-supplies', label: 'Office Supplies', icon: FileText },
  { path: '/admin/special-requests', label: 'Special Requests', icon: FileCheck },
  { path: '/admin/add-branch', label: 'Add Branch', icon: PlusCircle },
  { path: '/admin/manage-branches', label: 'Manage Branches', icon: Settings },
  { path: '/admin/branches', label: 'Branches Calendar', icon: Building2 },
  { path: '/admin/manage-users', label: 'Manage Users', icon: Users },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/branch-reports', label: 'Branch Reports', icon: TrendingUp },
  { path: '/admin/low-stocks', label: 'Low Stocks', icon: AlertTriangle },
];

export function AdminSidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-display font-bold text-foreground truncate">
                Giant Moto Pro
              </h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
              'hover:bg-primary/10 hover:text-primary',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-border">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            collapsed && 'justify-center px-2'
          )}
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <div className="hidden md:block p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 h-screen bg-card border-r border-border z-50',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[70px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}