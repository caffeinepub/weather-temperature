import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";

const SESSION_KEY = "truetemp_session_token";

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string) {
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {
    // ignore
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export type AuthState = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  sessionToken: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<string | null>;
  register: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

export function useAuth(): AuthState {
  const { actor, isFetching } = useActor();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(
    getStoredToken,
  );
  const [username, setUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem("truetemp_username");
    } catch {
      return null;
    }
  });

  // On actor ready, validate stored session
  useEffect(() => {
    if (isFetching || !actor) return;

    const token = getStoredToken();
    if (!token) {
      setIsInitializing(false);
      setIsAuthenticated(false);
      return;
    }

    actor
      .isLoggedIn(token)
      .then((loggedIn) => {
        setIsAuthenticated(loggedIn);
        if (!loggedIn) {
          clearStoredToken();
          setSessionToken(null);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        clearStoredToken();
        setSessionToken(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [actor, isFetching]);

  const login = useCallback(
    async (user: string, password: string): Promise<string | null> => {
      if (!actor) return "Not ready. Please wait.";
      const err = await actor.loginWithAccountName(user, password);
      if (err) {
        if (err.__kind__ === "invalidCredentials")
          return "Invalid username or password.";
        if (err.__kind__ === "invalidAccountName") return "Invalid username.";
        if (err.__kind__ === "weakPassword") return "Password too weak.";
        return "Login failed. Please try again.";
      }
      // Use accountName as the session token key — get a fresh session token
      // The backend uses loginWithAccountName to set a session; we use username as the token
      const token = `${user}:${Date.now()}`;
      setStoredToken(token);
      setSessionToken(token);
      try {
        localStorage.setItem("truetemp_username", user);
      } catch {
        /* ignore */
      }
      setUsername(user);
      setIsAuthenticated(true);
      return null;
    },
    [actor],
  );

  const register = useCallback(
    async (user: string, password: string): Promise<string | null> => {
      if (!actor) return "Not ready. Please wait.";
      const err = await actor.createAccount(user, user, password);
      if (err) {
        if (err.__kind__ === "userAlreadyExists")
          return "Username already taken. Try a different one.";
        if (err.__kind__ === "weakPassword")
          return "Password too weak (min 8 chars).";
        if (err.__kind__ === "invalidAccountName")
          return "Invalid username. Use letters, numbers, and underscores only.";
        return "Registration failed. Please try again.";
      }
      // Auto-login after successful registration
      return login(user, password);
    },
    [actor, login],
  );

  const logout = useCallback(async () => {
    const token = getStoredToken();
    if (actor && token) {
      try {
        await actor.logout(token);
      } catch {
        // ignore
      }
    }
    clearStoredToken();
    try {
      localStorage.removeItem("truetemp_username");
    } catch {
      /* ignore */
    }
    setSessionToken(null);
    setUsername(null);
    setIsAuthenticated(false);
  }, [actor]);

  return {
    isAuthenticated,
    isInitializing,
    sessionToken,
    username,
    login,
    register,
    logout,
  };
}
