from rest_framework import permissions


def _user_role(user):
    return getattr(user, "role", None)


def _is_admin(user):
    return _user_role(user) == "ADMIN"


def _is_manager(user):
    return _user_role(user) == "MANAGER"


def _is_merchandiser(user):
    return _user_role(user) == "MERCHANDISER"


class SaleLogPermission(permissions.BasePermission):
    """
    Allow MANAGER and MERCHANDISER to create sales and view sales data.

    Only ADMIN may modify or delete sale records.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method == 'POST':
            return _is_admin(request.user) or _is_admin(request.user) or _is_merchandiser(request.user)

        if request.method in permissions.SAFE_METHODS:
            return True

        return _is_admin(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return _is_admin(request.user)
