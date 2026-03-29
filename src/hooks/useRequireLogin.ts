import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireLogin() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  const requireLogin = useCallback(
    (targetPath: string) => {
      if (isAuthenticated) {
        return true;
      }

      setRedirectPath(targetPath);
      setIsLoginModalOpen(true);
      return false;
    },
    [isAuthenticated]
  );

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const moveToLogin = useCallback(() => {
    setIsLoginModalOpen(false);
    navigate("/login", {
      state: { redirectTo: redirectPath },
    });
  }, [navigate, redirectPath]);

  return {
    isAuthenticated,
    isLoginModalOpen,
    requireLogin,
    closeLoginModal,
    moveToLogin,
  };
}