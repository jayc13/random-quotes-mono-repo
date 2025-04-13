import React from "react";
import {AuthBindings, Authenticated, Refine} from "@refinedev/core";
import {RefineKbarProvider} from "@refinedev/kbar";

import {ErrorComponent, ThemedLayoutV2, ThemedSiderV2, useNotificationProvider,} from "@refinedev/antd";

import {useAuth0} from "@auth0/auth0-react";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import {App as AntdApp} from "antd";
import axios from "axios";
import {BrowserRouter, Outlet, Route, Routes} from "react-router";
import {AppIcon} from "./components/app-icon";
import {Header} from "./components";
import {ColorModeContextProvider} from "./contexts/color-mode";
import {CategoryList} from "./pages/categories";
import {Login} from "./pages/login";
import "@refinedev/antd/dist/reset.css";

const API_URL = import.meta.env.VITE_API_URL as string;

function App() {
  const {isLoading, user, logout, getIdTokenClaims} = useAuth0();
  if (isLoading) {
    return <span>loading...</span>;
  }
  const authProvider: AuthBindings = {
    login: async () => {
      return {
        success: true,
      };
    },
    logout: async () => {
      await logout({logoutParams: {returnTo: window.location.origin}});
      return {
        success: true,
      };
    },
    onError: async (error) => {
      console.error(error);
      return {error};
    },
    check: async () => {
      try {
        const token = await getIdTokenClaims();
        if (!token) {
          return {
            authenticated: false,
            redirectTo: "/login",
            error: new Error("Token not found"),
          }
        }
        axios.defaults.headers.common = {
          Authorization: `Bearer ${token.__raw}`,
        };
        return {
          authenticated: true,
        };
      } catch {
        return {
          authenticated: false,
          redirectTo: "/login",
          error: new Error("Token not found"),
        }
      }
    },
    getPermissions: async (params) => {
      if (user && Object.keys(user).includes('random_quotes/roles')) {
        return user['random_quotes/roles'];
      }
      return [];
    },
    getIdentity: async () => {
      if (user) {
        return {
          ...user,
          avatar: user.picture,
          roles: user['random_quotes/roles'] ?? [],
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
              resources={[
                {
                  name: "categories",
                  list: "/categories",
                  create: "/categories/create",
                  edit: "/categories/edit/:id",
                  show: "/categories/show/:id",
                  meta: {
                    canDelete: true,
                  },
                },
              ]}
              options={{
                syncWithLocation: false,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                breadcrumb: true,
                title: {text: "Random Quotes Admin", icon: <AppIcon/>},
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"

                      fallback={<CatchAllNavigate to="/login"/>}
                    >
                      <ThemedLayoutV2
                        Header={Header}
                        Sider={() => <ThemedSiderV2 fixed render={({
                                                                     items,
                                                                   }) => <>
                          {items}
                        </>}/>}
                      >
                        <Outlet/>
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="categories"/>}
                  />
                  <Route path="/categories">
                    <Route index element={<CategoryList/>}/>
                  </Route>
                  <Route path="*" element={<ErrorComponent/>}/>
                </Route>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-outer"
                      fallback={<Outlet/>}
                    >
                      <NavigateToResource/>
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login/>}/>
                </Route>
              </Routes>

              <UnsavedChangesNotifier/>
              <DocumentTitleHandler/>
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
