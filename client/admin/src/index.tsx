import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN as string}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID as string}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/`,
        scope:
          "openid profile email read:current_user update:current_user_metadata update:users_app_metadata delete:current_user",
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
