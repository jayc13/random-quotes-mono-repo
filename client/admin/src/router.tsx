import { Outlet, Route, Routes } from "react-router";
import { Authenticated } from "@refinedev/core"; // Removed CanAccess
import { CatchAllNavigate } from "@refinedev/react-router"; // Removed NavigateToResource
import { ErrorComponent, ThemedLayoutV2, ThemedSiderV2 } from "@refinedev/antd";
import { Header } from "./components";
import { CategoryList, CategoryShow } from "./pages/categories";
import { QuoteList } from "./pages/quotes";
// Removed Dashboard import
import { Login } from "./pages/login";
import React from "react";
import { HomePage } from "./pages/home"; // Added HomePage import

const AppRouter = () => {

  return <Routes>
    <Route
      element={
        <Authenticated
          key="authenticated-inner"
          fallback={<CatchAllNavigate to="/login"/>}
        >
          <ThemedLayoutV2
            Header={Header}
            Sider={() =>
              <ThemedSiderV2 fixed render={({ items }) => <>{items}</>} />
            }
          >
            <Outlet /> 
          </ThemedLayoutV2>
        </Authenticated>
      }
    >
      {/* Removed NavigateToResource for dashboard */}
      <Route path="/categories">
        <Route index element={<CategoryList />} />
        <Route path=":id" element={<CategoryShow/>}/>
      </Route>
      <Route path="/quotes">
        <Route index element={<QuoteList />} />
      </Route>
      <Route path="/" element={<HomePage />} /> {/* Changed route to render HomePage */}
      <Route path="*" element={<ErrorComponent />} />
    </Route>
    <Route
      element={
        <Authenticated
          key="authenticated-outer"
          fallback={<Outlet />}
        >
          {/* Removed NavigateToResource */}
        </Authenticated>
      }
    >
      <Route path="/login" element={<Login/>}/>
    </Route>
  </Routes>
};

export default AppRouter;