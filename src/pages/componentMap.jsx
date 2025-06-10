import React from "react";
import DashboardPage from "./DashboardPage";
import addUser  from "./addUser"
import NotFound from "./NotFound";

const componentMap={
    DashboardPage:<DashboardPage/>,
    addUser:<addUser/>,
    NotFound:<NotFound/>
}
export default componentMap;