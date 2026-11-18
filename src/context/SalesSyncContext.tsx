import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Sale } from '../types';

interface SalesSyncContextType {
  syncVersion: number;
  triggerRefresh: () => void;
  // Modal de éxito tras registrar venta
  successSale: Sale | null;
  showSuccessModal: boolean;
  openSuccessModal: (sale: Sale) => void;
  closeSuccessModal: () => void;
  // Modal de detalle de venta
  detailSale: Sale | null;
  showDetailModal: boolean;
  openDetailModal: (sale: Sale) => void;
  closeDetailModal: () => void;
  // Modal para registrar venta
  isRegisterModalOpen: boolean;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  // Modal para modificar venta
  editSale: Sale | null;
  showEditModal: boolean;
  openEditModal: (sale: Sale) => void;
  closeEditModal: () => void;
}

const SalesSyncContext = createContext<SalesSyncContextType | undefined>(undefined);

export const SalesSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncVersion, setSyncVersion] = useState<number>(0);

  // Estados de modales
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const triggerRefresh = useCallback(() => {
    setSyncVersion((prev) => prev + 1);
  }, []);

  const openSuccessModal = useCallback((sale: Sale) => {
    setSuccessSale(sale);
    setShowSuccessModal(true);
  }, []);

  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    setSuccessSale(null);
  }, []);

  const openDetailModal = useCallback((sale: Sale) => {
    setDetailSale(sale);
    setShowDetailModal(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setDetailSale(null);
  }, []);

  const openRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(false);
  }, []);

  const openEditModal = useCallback((sale: Sale) => {
    setEditSale(sale);
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditSale(null);
  }, []);

  return (
    <SalesSyncContext.Provider
      value={{
        syncVersion,
        triggerRefresh,
        successSale,
        showSuccessModal,
        openSuccessModal,
        closeSuccessModal,
        detailSale,
        showDetailModal,
        openDetailModal,
        closeDetailModal,
        isRegisterModalOpen,
        openRegisterModal,
        closeRegisterModal,
        editSale,
        showEditModal,
        openEditModal,
        closeEditModal,
      }}
    >
      {children}
    </SalesSyncContext.Provider>
  );
};

export const useSalesSync = (): SalesSyncContextType => {
  const context = useContext(SalesSyncContext);
  if (!context) {
    throw new Error('useSalesSync debe ser utilizado dentro de un SalesSyncProvider');
  }
  return context;
};
