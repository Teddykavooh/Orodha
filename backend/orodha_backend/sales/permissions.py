from rest_framework import permissions


def _user_role(user):
    return getattr(user, "role", None)


def _is_wholesaler_admin(user):
    return _user_role(user) == "WHOLESALER_ADMIN"


def _is_sales_manager(user):
    return _user_role(user) == "SALES_MANAGER"


def _is_salesperson(user):
    return _user_role(user) == "SALESPERSON"


class SaleLogPermission(permissions.BasePermission):
    """
    Allow SALES_MANAGER and SALESPERSON to create sales and view sales data.

    Only WHOLESALER_ADMIN may modify or delete sale records.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method == 'POST':
            return _is_wholesaler_admin(request.user) or _is_sales_manager(request.user) or _is_salesperson(request.user)

        if request.method in permissions.SAFE_METHODS:
            return True

        return _is_wholesaler_admin(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return _is_wholesaler_admin(request.user)
