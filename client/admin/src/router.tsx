import {Outlet, Route, Routes} from "react-router";
import {Authenticated, CanAccess} from "@refinedev/core";
import {CatchAllNavigate, NavigateToResource} from "@refinedev/react-router";
import {ErrorComponent, ThemedLayoutV2, ThemedSiderV2} from "@refinedev/antd";
import {Header} from "./components";
import {CategoryList, CategoryShow,} from "./pages/categories";
import {QuoteList} from "./pages/quotes";
import Dashboard from "./pages/dashboard";
import {Login} from "./pages/login";
import React from "react";

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
              <ThemedSiderV2 fixed render={({items,}) => <>{items}</>}/>
            }
          >
            <CanAccess fallback={<Dashboard/>}><Outlet/></CanAccess>
          </ThemedLayoutV2>
        </Authenticated>
      }
    >
      <Route path=""
             element={<NavigateToResource resource="dashboard"/>}
      />
      <Route path="/categories">
        <Route index element={<CategoryList/>}/>
        <Route path=":id" element={<CategoryShow/>}/>
      </Route>
      <Route path="/quotes">
        <Route index element={<QuoteList/>}/>
      </Route>
      <Route path="/">
        <Route index element={<Dashboard/>}/>
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
};

export default AppRouter;