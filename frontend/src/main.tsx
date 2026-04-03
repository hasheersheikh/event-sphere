import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { registerSW } from 'virtual:pwa-register'

// Register service worker
registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
    <ThemeProvider defaultTheme="light" attribute="class">
      <App />
    </ThemeProvider>
  </GoogleOAuthProvider>
);
