import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ExcelData, DashboardFilters, DadosMensais, MarcoProjeto } from '@/types/dashboard';
import { generateMockData } from '@/utils/excel-parser';

interface DashboardContextType {
  data: ExcelData | null;
  filters: DashboardFilters;
  setData: (data: ExcelData) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  loadMockData: () => void;
  availableMonths: string[];
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [data, setData] = useState<ExcelData | null>(null);
  const [filters, setFiltersState] = useState<DashboardFilters>({
    selectedMonth: '',
    showAccumulated: false
  });

  const setFilters = (newFilters: Partial<DashboardFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const handleSetData = (newData: ExcelData) => {
    setData(newData);
    
    // Set default selected month to the latest month
    if (newData.dados_mensais.length > 0) {
      const sortedMonths = newData.dados_mensais
        .map(item => item.mes_ano)
        .sort()
        .reverse();
      
      setFilters({ selectedMonth: sortedMonths[0] });
    }
  };

  const loadMockData = () => {
    const mockData = generateMockData();
    handleSetData(mockData);
  };

  const availableMonths = data?.dados_mensais
    ? [...data.dados_mensais.map(item => item.mes_ano)].sort().reverse()
    : [];

  const value: DashboardContextType = {
    data,
    filters,
    setData: handleSetData,
    setFilters,
    loadMockData,
    availableMonths
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}