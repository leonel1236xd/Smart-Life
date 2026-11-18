import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { CalendarDays, FileDown } from 'lucide-react';
import {
  getTodayStringBolivia,
  getCurrentMonthStringBolivia,
  getDateRangeCustom,
} from '../../lib/timezone';
import { generateSalesReportPdf } from '../../lib/pdfReport';
import type { Sale } from '../../types';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DatePreset = 'today' | '7days' | 'thisMonth' | 'lastMonth' | 'custom';

export const SalesReportModal: React.FC<SalesReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const today = getTodayStringBolivia();
  const currentMonth = getCurrentMonthStringBolivia();

  // Estados del rango de fechas
  const [preset, setPreset] = useState<DatePreset>('thisMonth');
  const [startDate, setStartDate] = useState<string>(`${currentMonth}-01`);
  const [endDate, setEndDate] = useState<string>(today);
  const [generating, setGenerating] = useState<boolean>(false);

  // Manejar cambio de presets rápidos
  const handlePresetSelect = (selectedPreset: DatePreset) => {
    setPreset(selectedPreset);
    const todayDate = new Date(`${today}T12:00:00`);

    switch (selectedPreset) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;

      case '7days': {
        const past7Days = new Date(todayDate);
        past7Days.setDate(past7Days.getDate() - 6);
        const yyyy = past7Days.getFullYear();
        const mm = String(past7Days.getMonth() + 1).padStart(2, '0');
        const dd = String(past7Days.getDate()).padStart(2, '0');
        setStartDate(`${yyyy}-${mm}-${dd}`);
        setEndDate(today);
        break;
      }

      case 'thisMonth':
        setStartDate(`${currentMonth}-01`);
        setEndDate(today);
        break;

      case 'lastMonth': {
        const [yearStr, monthStr] = currentMonth.split('-');
        let prevYear = parseInt(yearStr, 10);
        let prevMonth = parseInt(monthStr, 10) - 1;
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear -= 1;
        }
        const prevMonthFormatted = String(prevMonth).padStart(2, '0');
        const lastDayOfPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
        setStartDate(`${prevYear}-${prevMonthFormatted}-01`);
        setEndDate(`${prevYear}-${prevMonthFormatted}-${String(lastDayOfPrevMonth).padStart(2, '0')}`);
        break;
      }

      case 'custom':
        // Mantiene las fechas que el usuario haya seleccionado
        break;
    }
  };

  const handleGeneratePdf = async () => {
    // 1. Validaciones
    if (!startDate) {
      toast.error('Fecha requerida', 'Por favor selecciona la fecha inicial');
      return;
    }
    if (!endDate) {
      toast.error('Fecha requerida', 'Por favor selecciona la fecha final');
      return;
    }
    if (startDate > endDate) {
      toast.error('Rango inválido', 'La fecha inicial no puede ser posterior a la fecha final');
      return;
    }

    try {
      setGenerating(true);

      // 2. Calcular rango UTC exacto de Bolivia
      const { startIso, endIso } = getDateRangeCustom(startDate, endDate);

      // 3. Consultar ventas en Supabase para el reporte
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          product_name,
          quantity,
          unit_price,
          total_amount,
          notes,
          employee_id,
          created_at,
          updated_at,
          profiles (
            id,
            full_name,
            email,
            role
          )
        `)
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: true }); // Orden cronológico para el reporte

      if (error) {
        throw error;
      }

      // Normalizar estructura
      const salesData: Sale[] = (data || []).map((item) => {
        const profileObj = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        return {
          ...item,
          profiles: profileObj,
        } as Sale;
      });

      // 4. Validar si existen ventas en ese rango
      if (salesData.length === 0) {
        toast.info(
          'Sin registros',
          'No se encontraron ventas registradas en el período seleccionado'
        );
        return;
      }

      // 5. Generar y descargar el PDF con jspdf y jspdf-autotable
      generateSalesReportPdf({
        sales: salesData,
        startDateStr: startDate,
        endDateStr: endDate,
        adminName: profile?.full_name || 'Administrador',
      });

      toast.success(
        'Reporte descargado',
        `Se exportaron ${salesData.length} ventas al archivo PDF correctamente`
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al generar el reporte PDF';
      toast.error('Error al generar PDF', msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Reporte de Ventas"
      subtitle="Exporta las ventas a un documento oficial en PDF con filtros por fecha"
    >
      <div className="space-y-4">
        {/* Presets rápidos de fechas (sin estrellitas) */}
        <div>
          <label className="text-xs font-semibold text-slate-300 tracking-wide mb-2 block">
            Períodos rápidos
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handlePresetSelect('today')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                preset === 'today'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/40'
                  : 'bg-[#0f1420] text-slate-400 border-[#1c2738] hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('7days')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                preset === '7days'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/40'
                  : 'bg-[#0f1420] text-slate-400 border-[#1c2738] hover:text-white'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('thisMonth')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                preset === 'thisMonth'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/40'
                  : 'bg-[#0f1420] text-slate-400 border-[#1c2738] hover:text-white'
              }`}
            >
              Este Mes
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('lastMonth')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                preset === 'lastMonth'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/40'
                  : 'bg-[#0f1420] text-slate-400 border-[#1c2738] hover:text-white'
              }`}
            >
              Mes Anterior
            </button>
          </div>
        </div>

        {/* Rango de fechas: Desde y Hasta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Input
            label="Fecha inicial (Desde)"
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPreset('custom');
            }}
            leftIcon={<CalendarDays className="w-4 h-4" />}
            required
          />

          <Input
            label="Fecha final (Hasta)"
            type="date"
            value={endDate}
            max={today}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPreset('custom');
            }}
            leftIcon={<CalendarDays className="w-4 h-4" />}
            required
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-2.5 sm:gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 min-h-[46px]"
            disabled={generating}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleGeneratePdf}
            loading={generating}
            icon={<FileDown className="w-4 h-4" />}
            className="flex-1 min-h-[46px]"
          >
            Descargar PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
