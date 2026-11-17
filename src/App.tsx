import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { SalesSyncProvider, useSalesSync } from './context/SalesSyncContext';
import { AppLayout, type AppView } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SaleFormModal } from './components/sales/SaleFormModal';
import { SaleSuccessModal } from './components/sales/SaleSuccessModal';
import { SaleDetailModal } from './components/sales/SaleDetailModal';
import { useSales } from './hooks/useSales';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import logoImg from './assets/logo.jpg';

const AuthenticatedAppContent: React.FC = () => {
  const { isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  const {
    isRegisterModalOpen,
    openRegisterModal,
    closeRegisterModal,
    showSuccessModal,
    successSale,
    openSuccessModal,
    closeSuccessModal,
    showDetailModal,
    detailSale,
    closeDetailModal,
  } = useSalesSync();

  const { createSale, deleteSale, submitting } = useSales();

  // Renderizado con control de acceso por roles y fallback 404
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'history':
        return <SalesHistoryPage />;
      case 'employees':
        // Protección estricta: solo administradores pueden acceder a este módulo
        if (!isAdmin) {
          return (
            <NotFoundPage
              title="Acceso restringido"
              description="El módulo de gestión de empleados está reservado exclusivamente para cuentas con rol de administrador."
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          );
        }
        return <EmployeesPage />;
      default:
        return (
          <NotFoundPage
            title="Página no encontrada"
            description="La sección que intentas consultar no existe en el sistema."
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        );
    }
  };

  return (
    <>
      <AppLayout
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewSale={openRegisterModal}
      >
        {renderCurrentView()}
      </AppLayout>

      {/* Modal para registrar venta */}
      <SaleFormModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onSubmit={createSale}
        onSuccess={(created) => openSuccessModal(created)}
        submitting={submitting}
      />

      {/* Modal atractivo de confirmación y comprobante tras venta */}
      <SaleSuccessModal
        isOpen={showSuccessModal}
        sale={successSale}
        onClose={closeSuccessModal}
        onRegisterAnother={() => {
          closeSuccessModal();
          openRegisterModal();
        }}
      />

      {/* Modal atractivo para ver detalle completo de cualquier venta */}
      <SaleDetailModal
        isOpen={showDetailModal}
        sale={detailSale}
        onClose={closeDetailModal}
        canDelete={isAdmin}
        onDelete={deleteSale}
      />
    </>
  );
};

const AuthenticatedApp: React.FC = () => {
  return (
    <SalesSyncProvider>
      <AuthenticatedAppContent />
    </SalesSyncProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Pantalla de carga profesional con el isotipo de Smart Life
  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#0b0e14]">
        <img
          src={logoImg}
          alt="Smart Life"
          className="w-16 h-16 rounded-2xl object-cover mb-4 shadow-lg shadow-blue-950/40 animate-pulse"
        />
        <Loader2 className="w-5 h-5 animate-spin text-[#0084FF]" />
      </div>
    );
  }

  // Protección de rutas: si no está autenticado o la cuenta está inhabilitada, mostrar siempre Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ErrorBoundary>
      <AuthenticatedApp />
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
