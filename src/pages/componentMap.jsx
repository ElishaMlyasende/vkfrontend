import DashboardPage from "./DashboardPage";
import AddUser from "./AddUser";
import NotFound from "./NotFound";
import workFlow from "./workflow";
import Permission from "./permission";
import UserMenu from "./userMenu";
import UserMenuForm from "./UserMenuForm";
import UserPermissionForm from "./UserPermissionForm";
import Menu from "./Menu";
import CashBook from "./cashbook";
import CashPayment from "./NormalPettyCash";
import CaseManagement from "./Case";

const componentMap = {
  DashboardPage,
  AddUser,
  NotFound,
  workFlow,
  Menu,
  Permission,
  UserMenu,
  UserMenuForm,
  UserPermissionForm,
  CashBook,
  CashPayment,
  caseManagement,
};

export default componentMap;
