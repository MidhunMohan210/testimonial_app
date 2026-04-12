import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            theme="dark"
            richColors
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  "border border-white/10 bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.85)]",
                title: "text-white",
                description: "text-slate-300",
                actionButton: "bg-white text-slate-950",
                cancelButton: "bg-slate-800 text-white",
              },
            }}
          />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
