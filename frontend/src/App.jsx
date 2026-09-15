import { AuthProvider } from './context/AuthContext.jsx';
import { FlashProvider } from './context/FlashContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <FlashProvider>
        <AppRoutes />
      </FlashProvider>
    </AuthProvider>
  );
}
