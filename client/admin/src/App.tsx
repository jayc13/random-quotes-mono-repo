import { HomeOutlined, MessageOutlined, TagsOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import { useNotificationProvider } from "@refinedev/antd";
import { type AuthBindings, Refine } from "@refinedev/core";
import { RefineKbarProvider } from "@refinedev/kbar";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { App as AntdApp, Layout, Spin } from 'antd';
import axios from "axios";
import React from "react";
import { BrowserRouter } from "react-router";
import { AppIcon } from "./components/app-icon";
import { ColorModeContextProvider } from "./contexts/color-mode";

import "@refinedev/antd/dist/reset.css";
import AppRouter from "./router";

const API_URL = import.meta.env.VITE_API_URL as string;

const NON_ADMIN_RESOURCES = ["home"];

function App() {
  const { isLoading, user, logout, getIdTokenClaims } = useAuth0();

  if (isLoading) {
    return <Layout
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin />
    </Layout>
  }
  const authProvider: AuthBindings = {
    login: async () => {
      return {
        success: true,
      };
    },
    logout: async () => {
      await logout({ logoutParams: { returnTo: window.location.origin } });
      return {
        success: true,
      };
    },
    onError: async (error) => {
      console.error(error);
      return { error };
    },
    check: async () => {
      try {
        const token = await getIdTokenClaims();
        if (!token) {
          return {
            authenticated: false,
            redirectTo: "/login",
            error: new Error("Token not found"),
          };
        }
        axios.defaults.headers.common = {
          Authorization: `Bearer ${token.__raw}`,
        };
        return {
          authenticated: true,
          redirectTo: "/",
        };
      } catch {
        return {
          authenticated: false,
          redirectTo: "/login",
          error: new Error("Token not found"),
        };
      }
    },
    getPermissions: async (params) => {
      if (user && Object.keys(user).includes("random_quotes/roles")) {
        return user["random_quotes/roles"];
      }
      return [];
    },
    getIdentity: async () => {
      if (user) {
        return {
          ...user,
          avatar: user.picture,
          roles: user["random_quotes/roles"] ?? [],
        };
      }
      return null;
    },
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Refine
              authProvider={authProvider}
              dataProvider={dataProvider(API_URL, axios)}
              notificationProvider={useNotificationProvider}
              routerProvider={routerBindings}
              accessControlProvider={{
                can: async ({ resource }) => {
                  const roles: string[] = user?.["random_quotes/roles"] ?? [];

                  if (
                    NON_ADMIN_RESOURCES.includes(resource ?? "") ||
                    roles.includes("Admin")
                  ) {
                    return { can: true };
                  }

                  return { can: false };
                },
              }}
              resources={[
                {
                  name: "home",
                  list: "/",
                  options: {
                    label: "Home",
                    icon: <HomeOutlined />,
                  },
                },
                {
                  name: "categories",
                  list: "/categories",
                  show: "/categories/:id",
                  options: {
                    label: "Categories",
                    icon: <TagsOutlined />,
                  },
                },
                {
                  name: "quotes",
                  list: "/quotes",
                  options: {
                    label: "Quotes",
                    icon: <MessageOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: false,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                breadcrumb: true,
                title: { text: "Random Quotes Admin", icon: <AppIcon /> },
              }}
            >
              <AppRouter />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
