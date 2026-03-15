import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "./useActor";

const SESSION_KEY = "truetemp_session_token";
const PENDING_REGISTRATION_KEY = "truetemp_pending_registration";

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
  registrationError: string | null;
  clearRegistrationError: () => void;
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
  // Stores a deferred error from optimistic registration
  const [registrationError, setRegistrationError] = useState<string | null>(
    () => {
      try {
        const err = localStorage.getItem(PENDING_REGISTRATION_KEY);
        if (err) {
          localStorage.removeItem(PENDING_REGISTRATION_KEY);
          return err;
        }
      } catch {
        /* ignore */
      }
      return null;
    },
  );
  const actorRef = useRef(actor);
  actorRef.current = actor;

  const clearRegistrationError = useCallback(() => {
    setRegistrationError(null);
  }, []);

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

      // --- Optimistic: set auth state immediately and navigate to the app ---
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

      // --- Backend call in background ---
      actor
        .createAccount(user, user, password)
        .then((err) => {
          if (!err) return; // success – nothing to do

          // Revert optimistic auth
          clearStoredToken();
          try {
            localStorage.removeItem("truetemp_username");
          } catch {
            /* ignore */
          }

          let msg = "Registration failed. Please try again.";
          if (err.__kind__ === "userAlreadyExists")
            msg = "Username already taken. Try a different one.";
          else if (err.__kind__ === "weakPassword")
            msg = "Password must be at least 8 characters.";
          else if (err.__kind__ === "invalidAccountName")
            msg =
              "Invalid username. Use letters, numbers, and underscores only.";

          // Persist the error so LoginPage can show it after re-mount
          try {
            localStorage.setItem(PENDING_REGISTRATION_KEY, msg);
          } catch {
            /* ignore */
          }
          setRegistrationError(msg);
          setSessionToken(null);
          setUsername(null);
          setIsAuthenticated(false);
        })
        .catch(() => {
          // Network error – revert silently, user will see login page again
          clearStoredToken();
          try {
            localStorage.removeItem("truetemp_username");
          } catch {
            /* ignore */
          }
          const msg = "Registration failed. Please try again.";
          try {
            localStorage.setItem(PENDING_REGISTRATION_KEY, msg);
          } catch {
            /* ignore */
          }
          setRegistrationError(msg);
          setSessionToken(null);
          setUsername(null);
          setIsAuthenticated(false);
        });

      return null; // always succeeds immediately
    },
    [actor],
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
    registrationError,
    clearRegistrationError,
    login,
    register,
    logout,
  };
}
