import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ExcelData, DashboardFilters, DadosMensais, MarcoProjeto } from '@/types/dashboard';
import { generateMockData, generateMultipleVersions } from '@/utils/excel-parser';

interface DashboardContextType {
  data: ExcelData | null;
  filters: DashboardFilters;
  setData: (data: ExcelData) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  loadMockData: () => void;
  availableMonths: string[];
  dataHistory: ExcelData[];
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [data, setData] = useState<ExcelData | null>(null);
  const [dataHistory, setDataHistory] = useState<ExcelData[]>([]);
  const [filters, setFiltersState] = useState<DashboardFilters>({
    selectedMonth: '',
    showAccumulated: false
  });

  const setFilters = (newFilters: Partial<DashboardFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const handleSetData = (newData: ExcelData) => {
    // Add version info if not present
    if (!newData.projeto_info?.versao) {
      const versionNumber = dataHistory.length + 1;
      newData.projeto_info = {
        ...newData.projeto_info,
        versao: versionNumber.toString(),
        data_criacao: new Date().toISOString().split('T')[0]
      };
    }
    
    setData(newData);
    
    // Add to history if it's a new version
    const existingVersion = dataHistory.find(d => d.projeto_info?.versao === newData.projeto_info?.versao);
    if (!existingVersion) {
      setDataHistory(prev => [...prev, newData]);
    }
    
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
    const versions = generateMultipleVersions();
    // Load all versions into history
    setDataHistory(versions);
    // Set current data to latest version
    handleSetData(versions[versions.length - 1]);
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
    availableMonths,
    dataHistory
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