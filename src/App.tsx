import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import LeadsPage from '@/pages/LeadsPage'
import ImoveisPage from '@/pages/ImoveisPage'
import EquipePage from '@/pages/EquipePage'
import AtividadesPage from '@/pages/AtividadesPage'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
          <Route path="/imoveis" element={<ProtectedRoute><ImoveisPage /></ProtectedRoute>} />
          <Route path="/equipe" element={<ProtectedRoute><EquipePage /></ProtectedRoute>} />
          <Route path="/atividades" element={<ProtectedRoute><AtividadesPage /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#111d35', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '14px' } }} />
      </AuthProvider>
    </BrowserRouter>
  )
}
