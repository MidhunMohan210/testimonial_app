import { createContext, useState } from "react";

export const AuthContext = createContext(null);

const readStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage("testiflow_user"));
  const [business, setBusiness] = useState(() => readStorage("testiflow_business"));
  const [token, setToken] = useState(() => localStorage.getItem("testiflow_token"));

  const handleLogin = (payload) => {
    localStorage.setItem("testiflow_token", payload.token);
    localStorage.setItem("testiflow_user", JSON.stringify(payload.user));
    localStorage.setItem("testiflow_business", JSON.stringify(payload.business));

    setToken(payload.token);
    setUser(payload.user);
    setBusiness(payload.business);
  };

  const updateBusiness = (nextBusiness) => {
    localStorage.setItem("testiflow_business", JSON.stringify(nextBusiness));
    setBusiness(nextBusiness);
  };

  const logout = () => {
    localStorage.removeItem("testiflow_token");
    localStorage.removeItem("testiflow_user");
    localStorage.removeItem("testiflow_business");

    setToken(null);
    setUser(null);
    setBusiness(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    business,
    token,
    login: handleLogin,
    updateBusiness,
    logout,
    isAuthenticated: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
