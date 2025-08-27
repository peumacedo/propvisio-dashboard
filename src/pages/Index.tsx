import { DashboardProvider } from '@/contexts/DashboardContext';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
};

export default Index;
