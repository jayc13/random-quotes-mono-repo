import {AuthBindings, Authenticated, Refine,} from "@refinedev/core";
import {RefineKbar, RefineKbarProvider} from "@refinedev/kbar";

import {ErrorComponent, ThemedLayoutV2, ThemedSiderV2, useNotificationProvider,} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

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
import {CategoryCreate, CategoryEdit, CategoryList, CategoryShow,} from "./pages/categories";
import {Login} from "./pages/login";

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
        if (token) {
          axios.defaults.headers.common = {
            Authorization: `Bearer ${token.__raw}`,
          };
          return {
            authenticated: true,
          };
        } else {
          return {
            authenticated: false,
            error: {
              message: "Check failed",
              name: "Token not found",
            },
            redirectTo: "/login",
            logout: true,
          };
        }
      } catch (error: any) {
        return {
          authenticated: false,
          error: new Error(error),
          redirectTo: "/login",
          logout: true,
        };
      }
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      if (user) {
        return {
          ...user,
          avatar: user.picture,
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
                syncWithLocation: true,
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
                        Sider={(props) => <ThemedSiderV2 {...props} fixed/>}
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
                    <Route path="create" element={<CategoryCreate/>}/>
                    <Route path="edit/:id" element={<CategoryEdit/>}/>
                    <Route path="show/:id" element={<CategoryShow/>}/>
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

              <RefineKbar/>
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
