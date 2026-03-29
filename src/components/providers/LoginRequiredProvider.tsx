import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginRequiredModal } from "@/components/common/LoginRequiredModal";

type LoginRequiredContextType = {
  requireLogin: (targetPath: string) => boolean;
};

const LoginRequiredContext = createContext<LoginRequiredContextType | null>(null);

export function LoginRequiredProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  const requireLogin = useCallback(
    (targetPath: string) => {
      if (isAuthenticated) return true;

      setRedirectPath(targetPath);
      setOpen(true);
      return false;
    },
    [isAuthenticated]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    navigate("/login", {
      state: { redirectTo: redirectPath },
    });
  }, [navigate, redirectPath]);

  const value = useMemo(
    () => ({
      requireLogin,
    }),
    [requireLogin]
  );

  return (
    <LoginRequiredContext.Provider value={value}>
      {children}

      <LoginRequiredModal
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </LoginRequiredContext.Provider>
  );
}

export function useLoginRequired() {
  const context = useContext(LoginRequiredContext);

  if (!context) {
    throw new Error(
      "useLoginRequired must be used within LoginRequiredProvider"
    );
  }

  return context;
}