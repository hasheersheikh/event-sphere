import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "event_manager" | "admin" | "volunteer";
  isApproved: boolean;
  token: string;
  phoneNumber?: string;
  eventId?: string;
  gate?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    role?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; role?: string | null; message?: string }>;
  logout: () => void;
  isLoading: boolean;
  setAuthUser: (userData: User) => void;
}

// Session timeout: 30 minutes in milliseconds
const SESSION_TIMEOUT = 30 * 60 * 1000;
// Activity events to track for idle detection
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for timeout management
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Function to clear session timeout
  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  // Function to set session timeout
  const setSessionTimeout = useCallback(() => {
    clearSessionTimeout();
    sessionTimeoutRef.current = setTimeout(() => {
      console.log("Session expired due to inactivity");
      logout();
    }, SESSION_TIMEOUT);
  }, [clearSessionTimeout]);

  // Function to reset timer on user activity
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSessionTimeout();
  }, [setSessionTimeout]);

  // Logout function
  const logout = useCallback(() => {
    clearSessionTimeout();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    // Remove all activity event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, resetActivityTimer);
    });
  }, [clearSessionTimeout, resetActivityTimer]);

  // Check session expiry on mount and when user changes
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const lastActivity = localStorage.getItem("lastActivity");

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);

        // Check if session has expired
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
          if (timeSinceLastActivity > SESSION_TIMEOUT) {
            console.log("Session expired. Please login again.");
            localStorage.removeItem("user");
            localStorage.removeItem("lastActivity");
            setUser(null);
            setIsLoading(false);
            return;
          }
        }

        setUser(userData);

        // Set up activity listeners only if session is valid
        setSessionTimeout();
        ACTIVITY_EVENTS.forEach((event) => {
          window.addEventListener(event, resetActivityTimer);
        });

        // Update last activity time on mount
        localStorage.setItem("lastActivity", Date.now().toString());

        // The cached profile can go stale (e.g. isApproved flips after admin
        // action) — refresh it from the server without waiting on a re-login.
        api
          .get("/auth/me")
          .then(({ data }) => {
            const refreshed = { ...userData, ...data, token: userData.token };
            setUser(refreshed);
            localStorage.setItem("user", JSON.stringify(refreshed));
          })
          .catch(() => {});
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
      }
    }
    setIsLoading(false);

    // Cleanup function
    return () => {
      clearSessionTimeout();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetActivityTimer);
      });
    };
  }, [resetActivityTimer, setSessionTimeout, clearSessionTimeout]);

  // Update last activity timestamp whenever there's user activity
  useEffect(() => {
    if (user) {
      const updateActivity = () => {
        localStorage.setItem("lastActivity", Date.now().toString());
      };

      ACTIVITY_EVENTS.forEach((event) => {
        window.addEventListener(event, updateActivity);
      });

      return () => {
        ACTIVITY_EVENTS.forEach((event) => {
          window.removeEventListener(event, updateActivity);
        });
      };
    }
  }, [user]);

  const login = async (
    email: string,
    password: string,
    role: string = "user",
  ) => {
    try {
      const response = await api.post("/auth/login", { email, password, role });
      const data = response.data;

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("lastActivity", Date.now().toString());

      // Start session timeout
      setSessionTimeout();

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = "user",
  ) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const data = response.data;

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("lastActivity", Date.now().toString());

      // Start session timeout
      setSessionTimeout();

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      };
    }
  };

  const googleLogin = async (accessToken: string) => {
    try {
      const response = await api.post("/auth/google", { accessToken });
      const data = response.data;
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("lastActivity", Date.now().toString());
      localStorage.removeItem("store-owner");

      // Start session timeout
      setSessionTimeout();

      return { success: true, role: data.role as string };
    } catch (error: any) {
      return {
        success: false,
        role: null,
        message: error.response?.data?.message || "Google login failed.",
      };
    }
  };

  const setAuthUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("lastActivity", Date.now().toString());
    setSessionTimeout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        isLoading,
        setAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
