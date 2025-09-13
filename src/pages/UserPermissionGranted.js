import { jwtDecode } from "jwt-decode";
export const getPermissions = () => {
    const token = localStorage.getItem("token");
    if (!token) return [];
    const decoded = jwtDecode(token);
    return decoded.permissions || [];
  };
  
  export const hasPermission = (perm) => getPermissions().includes(perm);