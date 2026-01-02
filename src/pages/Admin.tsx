import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const AdminContent = () => {
  const { isAuthenticated, loading, authError, revalidate } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <AdminLogin />
        {authError && (
          <div className="max-w-md mx-auto mt-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-900">
            <div className="font-semibold mb-2">Session validation failed</div>
            <pre className="whitespace-pre-wrap text-xs">{authError}</pre>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => revalidate()}>Retry</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <AdminDashboard />;
};

const Admin = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <AdminContent />
      </ProductProvider>
    </AuthProvider>
  );
};

export default Admin;
