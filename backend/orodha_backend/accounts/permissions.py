from rest_framework import permissions


def _user_role(user):
    return getattr(user, "role", None)


def _is_wholesaler_admin(user):
    return _user_role(user) == "WHOLESALER_ADMIN"


def _is_sales_manager(user):
    return _user_role(user) == "SALES_MANAGER"


class UserManagementPermission(permissions.BasePermission):
    """
    Allow WHOLESALER_ADMIN full user management.

    SALES_MANAGER can read users in their hub, but cannot create/update/delete.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return _is_wholesaler_admin(request.user) or _is_sales_manager(request.user)

        return _is_wholesaler_admin(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return _is_wholesaler_admin(request.user) or _is_sales_manager(request.user)

        return _is_wholesaler_admin(request.user)
