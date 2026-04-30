import { createContext, useContext, useEffect, useState } from "react";
const server_url =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_SERVER_URL
    : process.env.NEXT_PUBLIC_DEV_SERVER_URL;

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Send browser's cookie to server to check for a valid token
    async function checkToken() {
      try {
        const res = await fetch(`${server_url}/api/auth/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("user", JSON.stringify(data.user)); // adding this for socket usage
          setUser(data.user);
        }
        // No token was found
      } catch (error) {
        localStorage.removeItem("user");
        setUser(null);
      }

      setLoading(false);
    }

    checkToken();
  }, []);

  // REGISTER SERVER REQUEST
  async function register(name, email, password, role) {
    try {
      const res = await fetch(`${server_url}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data.user)); // adding this for socket usage
      setUser(data.user);

      return data.user;
    } catch (error) {
      console.log("Registering user error: ", error);
    }
  }

  // LOGIN SERVER REQUEST
  async function login(email, password) {
    try {
      const res = await fetch(`${server_url}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Login Failed");
      }
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data.user)); // adding this for socket usage
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.log("Login user error: ", error);
    }
  }

  // LOGOUT SERVER REQUEST
  async function logout() {
    try {
      const res = await fetch(`${server_url}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log out");
      localStorage.removeItem("user");
      setUser(null);
      setLoading(true);
    } catch (error) {
      console.log("Logout user error: ", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth not used within AuthProvider");
  }

  return context;
}
