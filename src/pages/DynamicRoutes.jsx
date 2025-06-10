// src/routes/DynamicRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import componentMap from "./componentMap";

const DynamicRoutes = ({ menus }) => {
  return (
    <Routes>
      {menus.map((menu, idx) => (
        <Route
          key={idx}
          path={menu.path}
          element={componentMap[menu.component] || <componentMap.NotFound />}
        />
      ))}
    </Routes>
  );
};

export default DynamicRoutes;
