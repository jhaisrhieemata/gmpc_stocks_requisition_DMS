import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RequisitionForm from "./pages/RequisitionForm";
import NotFound from "./pages/NotFound";

// Admin pages with layout
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import InventoryPage from "./pages/admin/InventoryPage";
import StockSuppliers from "./pages/admin/StockSuppliers";
import ManageStockSuppliers from "./pages/admin/ManageStockSuppliers";
import OfficeSuppliesPage from "./pages/admin/OfficeSuppliesPage";
import SpecialRequestPage from "./pages/admin/SpecialRequestPage";
import BranchesDashboard from "./pages/admin/BranchesDashboard";
import AddBranch from "./pages/admin/AddBranch";
import ManageBranches from "./pages/admin/ManageBranches";
import ManageUsers from "./pages/admin/ManageUsers";
import Reports from "./pages/admin/Reports";
import BranchReports from "./pages/admin/BranchReports";
import LowStocksReport from "./pages/admin/LowStocksReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes with sidebar layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="stock-suppliers" element={<StockSuppliers />} />
              <Route path="manage-stock-suppliers" element={<ManageStockSuppliers />} />
              <Route path="office-supplies" element={<OfficeSuppliesPage />} />
              <Route path="special-requests" element={<SpecialRequestPage />} />
              <Route path="branches" element={<BranchesDashboard />} />
              <Route path="add-branch" element={<AddBranch />} />
              <Route path="manage-branches" element={<ManageBranches />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="reports" element={<Reports />} />
              <Route path="branch-reports" element={<BranchReports />} />
              <Route path="low-stocks" element={<LowStocksReport />} />
            </Route>

            <Route path="/requisition" element={<RequisitionForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;