import DashboardPage from "./DashboardPage";
import addUser from "./addUser";
import NotFound from "./NotFound";
import workFlow from "./workflow";
import Permission from "./permission";
import UserMenu from "./userMenu";
import UserMenuForm from "./UserMenuForm";
import UserPermissionForm from "./UserPermissionForm";
import Menu from "./Menu";
import CashBook from "./cashbook";
import cashPayment from "./normalPettycash";
import caseManagement from "./case";

const componentMap = {
  DashboardPage,
  addUser,
  NotFound,
  workFlow,
  Menu,
  Permission,
  UserMenu,
  UserMenuForm,
  UserPermissionForm,
  CashBook,
  cashPayment,
  caseManagement,
};

export default componentMap;
