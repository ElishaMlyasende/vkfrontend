import React from "react";
import { Routes, Route } from "react-router-dom";
import componentMap from "./componentMap";

const DynamicRoutes = ({ menus }) => {
  return (
    <Routes>
      {menus.map((menu, idx) => {
        const Component = componentMap[menu.component] || componentMap.NotFound;
        return (
          <Route key={idx} path={menu.path} element={<Component />} />
        );
      })}
    </Routes>
  );
};

export default DynamicRoutes;
