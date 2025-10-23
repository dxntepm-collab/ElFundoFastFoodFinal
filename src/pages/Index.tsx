import { FirebaseAuthProvider, useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import LoginForm from '@/components/LoginForm';
import WaiterPanel from '@/components/WaiterPanel';
import KitchenPanel from '@/components/KitchenPanel';
import AdminPanel from '@/components/AdminPanel';

function AppContent() {
  const { user, isAuthenticated, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando El Fundo Fast Food...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  switch (user?.role) {
    case 'admin':
      return <AdminPanel />;
    case 'waiter':
      return <WaiterPanel />;
    case 'kitchen':
      return <KitchenPanel />;
    default:
      return <LoginForm />;
  }
}

export default function Index() {
  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <FirebaseAuthProvider>
        <AppContent />
      </FirebaseAuthProvider>
    </div>
  );
}