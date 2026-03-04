import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { backend } from '../lib/backendMock';
import { getCurrentUser, type AuthUser } from '../lib/auth';
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser?: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
  signInMock?: (provider: 'facebook' | 'linkedin') => Promise<void>;
  signInAsDev?: (role: 'student' | 'advisor' | 'admin') => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const loadUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUser(user);
        setLoading(false);
        return;
      }
      let currentUser = await getCurrentUser();
      if (!currentUser && import.meta?.env?.DEV) {
        const mod = await import('../lib/auth');
        if (typeof mod.getCurrentUserDevFallback === 'function') {
          currentUser = await mod.getCurrentUserDevFallback();
        }
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUser();
      const { data: { subscription } } = backend.auth.onAuthStateChange(() => {
      (async () => {
        await loadUser();
      })();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const refreshUser = async () => {
    await loadUser();
  };
  const signInMock = async (provider: 'facebook' | 'linkedin') => {
    if (!import.meta.env.DEV) {
      throw new Error('signInMock is only available in development');
    }
    const fakeUser: AuthUser = {
      id: `dev-${provider}-user`,
      email: `test+${provider}@example.com`,
      role: 'student',
      profileId: `dev-${provider}-profile`,
      fullName: `${provider[0].toUpperCase() + provider.slice(1)} Test User`
    };
    await new Promise((res) => setTimeout(res, 200));
    setUser(fakeUser);
    setLoading(false);
  };
  const signInAsDev = async (role: 'student' | 'advisor' | 'admin') => {
    if (!import.meta.env.DEV) {
      throw new Error('signInAsDev is only available in development');
    }
    const fakeUser: AuthUser = {
      id: `dev-${role}-user`,
      email: `dev+${role}@example.com`,
      role,
      profileId: `dev-${role}-profile`,
      fullName: `${role[0].toUpperCase() + role.slice(1)} (dev)`
    };
    await new Promise((res) => setTimeout(res, 100));
    setUser(fakeUser);
    setLoading(false);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        refreshUser,
        ...(import.meta.env.DEV ? { signInMock, signInAsDev } : {}),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
