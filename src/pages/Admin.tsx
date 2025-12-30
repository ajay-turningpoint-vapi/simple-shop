import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
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
