import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/UI/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { EditSessionPage } from './pages/EditSessionPage';
import { HistoryPage } from './pages/HistoryPage';
import { MacrocyclePage } from './pages/MacrocyclePage';
import { NewSessionPage } from './pages/NewSessionPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { WeekPage } from './pages/WeekPage';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/week" replace />} />
          <Route path="/week" element={<WeekPage />} />
          <Route path="/new" element={<NewSessionPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          <Route path="/sessions/:id/edit" element={<EditSessionPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/macrocycle" element={<MacrocyclePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
