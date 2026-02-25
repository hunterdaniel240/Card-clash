import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Send browser's cookie to server to check for a valid token
    async function checkToken() {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
        // No token was found
      } catch (error) {
        console.log(error);
        setUser(null);
      }

      setLoading(false);
    }

    checkToken();
  }, []);

  async function login(email, password) {
    // LOGIN SERVER REQUEST
    const res = await fetch(process.env.SERVER_URL + "/auth/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      throw new Error("Login Failed");
    }

    const data = await res.json();
    setUser(data.user);
  }

  // LOGOUT SERVER REQUEST
  async function logout() {
    await fetch(process.env.SERVER_URL + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
