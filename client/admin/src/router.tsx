import { ErrorComponent, ThemedLayoutV2, ThemedSiderV2 } from "@refinedev/antd";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";
import React from "react";
import { Outlet, Route, Routes } from "react-router";
import { Header } from "./components";
import { CategoryList, CategoryShow } from "./pages/categories";
import { HomePage } from "./pages/home";
import { Login } from "./pages/login";
import { QuoteList } from "./pages/quotes";

const AppRouter = () => {
  return (
    <Routes>
      <Route
        element={
          <Authenticated
            key='authenticated-inner'
            fallback={<CatchAllNavigate to='/login' />}
          >
            <ThemedLayoutV2
              Header={Header}
              Sider={() => (
                <ThemedSiderV2 fixed render={({ items }) => <>{items}</>} />
              )}
            >
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route path='/categories'>
          <Route index element={<CategoryList />} />
          <Route path=':id' element={<CategoryShow />} />
        </Route>
        <Route path='/quotes'>
          <Route index element={<QuoteList />} />
        </Route>
        <Route path='/' element={<HomePage />} />
        <Route path='*' element={<ErrorComponent />} />
      </Route>
      <Route
        element={
          <Authenticated key='authenticated-outer' fallback={<Outlet />} />
        }
      >
        <Route path='/login' element={<Login />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
