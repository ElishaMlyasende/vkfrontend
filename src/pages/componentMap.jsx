import DashboardPage from "./DashboardPage";
import AddUser from "./AddUser";
import NotFound from "./NotFound";
import WorkFlow from "./workflow";
import Permission from "./permission";
import UserMenu from "./userMenu";
import UserMenuForm from "./UserMenuForm";
import UserPermissionForm from "./RolePermissionForm";
import Menu from "./Menu";
import CashBook from "./cashbook";
import CashPayment from "./NormalPettycash";
import CaseManagement from "./case";
import ReceptionManager from "./ReceptionManager";
import RolePermission from "./Role";

const componentMap = {
  DashboardPage,
  AddUser,
  NotFound,
  WorkFlow,
  Menu,
  Permission,
  UserMenu,
  UserMenuForm,
  UserPermissionForm,
  CashBook,
  CashPayment,
  CaseManagement,
  ReceptionManager,
  RolePermission
};

export default componentMap;
