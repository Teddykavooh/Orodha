from rest_framework import permissions


def _user_role(user):
    return getattr(user, "role", None)


def _is_admin(user):
    return _user_role(user) == "ADMIN"


class AdminOrReadOnly(permissions.BasePermission):
    """
    Allow safe methods for any authenticated tenant user.

    Non-safe methods require ADMIN.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and _is_admin(request.user))


class CanDeleteInventory(permissions.BasePermission):
    """
    Allow any authenticated tenant user to read inventory data.

    Only ADMIN may create/update/delete inventory resources.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and _is_admin(request.user))

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and _is_admin(request.user))
