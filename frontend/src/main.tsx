import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { registerSW } from 'virtual:pwa-register'

// Register service worker
registerSW({ immediate: true })

// Google's SDK throws synchronously on mount if client_id is empty (not just on login click),
// which crashes the whole /auth page. A placeholder keeps the page usable until a real
// VITE_GOOGLE_CLIENT_ID is configured — Google login itself will fail gracefully via onError.
createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "000000000000-placeholder.apps.googleusercontent.com"}>
    <ThemeProvider defaultTheme="dark" attribute="class" enableSystem={false}>
      <App />
    </ThemeProvider>
  </GoogleOAuthProvider>
);
