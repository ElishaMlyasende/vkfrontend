import React from "react";
import DashboardPage from "./DashboardPage";
import addUser  from "./addUser"
import NotFound from "./NotFound";
import workFlow from "./workflow";

const componentMap={
    DashboardPage:<DashboardPage/>,
    addUser:<addUser/>,
    NotFound:<NotFound/>,
    workFlow:<workFlow/>
}
export default componentMap;