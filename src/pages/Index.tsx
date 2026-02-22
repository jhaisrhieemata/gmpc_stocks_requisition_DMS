import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Shield, Building2, Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Auto-redirect based on user role
    if (!isLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/requisition');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-4">
            <Package className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Stocks & Requisitions
          </h1>
          <p className="text-muted-foreground mt-2">
            Dashboard Management System V2
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
                onClick={() => navigate('/auth')}>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Admin Access</CardTitle>
              <CardDescription>
                Manage inventory, approve requests, and view dashboard analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View all pending requisitions</li>
                <li>• Approve or reject requests</li>
                <li>• Manage office stocks inventory</li>
                <li>• Send email notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-office/50"
                onClick={() => navigate('/auth')}>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-office/10 flex items-center justify-center mb-2">
                <Building2 className="w-6 h-6 text-office" />
              </div>
              <CardTitle className="text-lg">Branch User</CardTitle>
              <CardDescription>
                Submit requisition requests for office supplies and special items
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Submit office supplies requests</li>
                <li>• Submit special requests</li>
                <li>• Add e-signature</li>
                <li>• Generate PDF documents</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="gap-2 gradient-primary"
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Connect to your PHP/MySQL backend to enable full functionality
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
