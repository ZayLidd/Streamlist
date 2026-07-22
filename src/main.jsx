import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const application = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <App googleClientIdConfigured />
  </GoogleOAuthProvider>
) : (
  <App googleClientIdConfigured={false} />
);

createRoot(document.getElementById("root")).render(
  <StrictMode>{application}</StrictMode>
);
