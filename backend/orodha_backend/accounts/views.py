from django.contrib.auth import authenticate
from django_tenants.utils import tenant_context

from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from ..tenants.models import Client

from .models import UserProfile
from .permissions import UserManagementPermission
from .serializers import LoginSerializer, UserCreateSerializer, UserProfileSerializer


class LoginView(APIView):
    """
    Exchange valid credentials for a DRF auth token.

    Request body:
        {
            "username": "admin",
            "password": "secret-password"
        }

    Response body includes the token and a compact user profile. Send the token
    on protected requests as:
        Authorization: Token <token>
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Validate credentials, create/reuse a token, and return login data."""

        # serializer = LoginSerializer(
        #     data=request.data,
        #     context={"request": request},
        # )
        # serializer.is_valid(raise_exception=True)
        # user = serializer.validated_data["user"]
        # token, _ = Token.objects.get_or_create(user=user)

        # return Response(
        #     {
        #         "token": token.key,
        #         "user": UserProfileSerializer(user).data,
        #     }
        # )

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organisation = serializer.validated_data["organisation"]
        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        try:
            tenant = Client.objects.get(
                schema_name=organisation
            )
        except Client.DoesNotExist:
            return Response(
                {
                    "detail": "Organisation not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
        with tenant_context(tenant):
            user = authenticate(
                request=request,
                username=username,
                password=password,
            )

            if not user:
                return Response(
                    {
                        "detail": "Invalid username or password."
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            token, _ = Token.objects.get_or_create(
                user=user
            )

            return Response(
                {
                    "token": token.key,
                    "tenant": {
                        "schema_name": tenant.schema_name,
                        "business_name": tenant.business_name,
                    },
                    "user": UserProfileSerializer(user).data
                }
            )


class LogoutView(APIView):
    """
    Delete the current user's auth token.

    This logs out the current token-based session. A later login will create a
    new token for the same user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Remove all tokens belonging to the authenticated user."""

        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """
    Return the currently authenticated user.

    This is useful for frontend bootstrapping: after loading a saved token, call
    this endpoint to confirm the token is valid and discover the user's role.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Serialize request.user from the active tenant schema."""

        return Response(UserProfileSerializer(request.user).data)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for users inside the current tenant.

    The router exposes /api/users/. This operates in the tenant schema selected
    by django-tenants middleware, so each wholesaler gets its own users.
    """

    queryset = UserProfile.objects.all().order_by("id")
    permission_classes = [permissions.IsAuthenticated, UserManagementPermission]

    def get_queryset(self):
        queryset = UserProfile.objects.all().order_by("id")
        user = self.request.user
        if getattr(user, "role", None) == "WHOLESALER_ADMIN":
            return queryset
        if getattr(user, "hub_id", None):
            return queryset.filter(hub_id=user.hub_id)
        return queryset.none()

    def get_serializer_class(self):
        """Use the password-aware serializer only when creating users."""

        if self.action == "create":
            return UserCreateSerializer
        return UserProfileSerializer
