import { RequestHandler } from "express";
import { Role } from "../user/user-model";

export const isAuthorized = (...roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: Please login" });
      return;
    }

    const userRole = req.user.role;
    const isSuper = userRole === Role.SUPER_ADMIN || req.user.email === "admin@saudibrand.com";

    // Super Admin has unrestricted access to all admin operations
    if (isSuper) {
      next();
      return;
    }

    // Only Super Admin can access routes explicitly restricted to Role.SUPER_ADMIN (e.g. user management)
    if (roles.includes(Role.SUPER_ADMIN) && !isSuper) {
      res.status(403).json({
        message: "عفواً، هذه الصفحة والعمليات مخصصة حصرياً للمدير العام (Super Admin)",
      });
      return;
    }

    // If route requires Role.ADMIN, and user has Role.ADMIN
    if (roles.includes(Role.ADMIN) && userRole === Role.ADMIN) {
      next();
      return;
    }

    if (roles.includes(userRole)) {
      next();
      return;
    }

    res.status(403).json({ message: "عفواً، لا تملك الصلاحية للقيام بهذا الإجراء" });
  };
};

export const requirePermission = (...requiredPermissions: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: Please login" });
      return;
    }

    const isSuper = req.user.role === Role.SUPER_ADMIN || req.user.email === "admin@saudibrand.com";
    if (isSuper) {
      next();
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasAccess = requiredPermissions.some((p) => userPermissions.includes(p));

    if (hasAccess) {
      next();
      return;
    }

    res.status(403).json({
      message: `عفواً، حسابك لا يملك الصلاحية المطلوبة للقيام بهذا الإجراء: (${requiredPermissions.join(', ')})`,
    });
  };
};