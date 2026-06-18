from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Read/write representation of a tenant user.

    This serializer intentionally does not include the password field. Use it
    when returning user details from endpoints such as /api/auth/me/ or when
    listing users inside a tenant schema.
    """

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "hub",
        ]
        read_only_fields = ["id"]


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer used when creating a tenant user.

    Passwords must never be saved directly. The create() method below removes
    the plain text password from validated_data, hashes it with set_password(),
    and then saves the user. If login fails later, this is one of the first
    places to check.
    """

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "hub",
            "password",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        """
        Create a user with a hashed password.

        validated_data contains fields that passed serializer validation. The
        password is popped out so it is not assigned directly to the model.
        """

        password = validated_data.pop("password")
        user = UserProfile(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Validate username/password credentials for token login.

    authenticate() uses Django's configured authentication backends and the
    current tenant connection. In a django-tenants project, login should be
    called on the tenant domain/subdomain so Django checks users from the
    correct schema.
    """

    organisation = serializers.CharField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Attach the authenticated user to attrs for the view to consume.

        If this raises "Invalid username or password", confirm that the request
        is being sent to the correct tenant domain and that the user password
        was created through create_user() or set_password().
        """

        # shield serializer from shema info

        # user = authenticate(
        #     request=self.context.get("request"),
        #     username=attrs["username"],
        #     password=attrs["password"],
        # )

        # if not user:
        #     raise serializers.ValidationError("Invalid username or password.")

        # if not user.is_active:
        #     raise serializers.ValidationError("This account is inactive.")

        # attrs["user"] = user
        # return attrs

        if not attrs["organisation"].strip():
            raise serializers.ValidationError(
                {"organisation": "Organisation is required."}
            )
        
        return attrs
