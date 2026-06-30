from django.contrib.auth import authenticate
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Read/write representation of a tenant user.

    This serializer intentionally does not include the password field. Use it
    when returning user details from endpoints such as /api/auth/me/ or when
    listing users inside a tenant schema.
    """

    hub_name = serializers.ReadOnlyField(source="hub.name")

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
            "hub_name",
        ]
        read_only_fields = ["id", "hub_name"]

    # Clean up updates to an existing profile
    def validate_username(self, value):
        normalized_value = value.strip().lower()
        if ' ' in normalized_value:
            raise serializers.ValidationError("Usernames cannot contain spaces.")
        
        # Check uniqueness manually against other users in this tenant schema
        user_id = self.instance.id if self.instance else None
        if UserProfile.objects.filter(username__iexact=normalized_value).exclude(id=user_id).exists():
            raise serializers.ValidationError("A user with that username already exists.")
            
        return normalized_value

    def validate_email(self, value):
        if not value:
            return value
        return value.strip().lower()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer used when creating a tenant user.

    Passwords must never be saved directly. The create() method below removes
    the plain text password from validated_data, hashes it with set_password(),
    and then saves the user. If login fails later, this is one of the first
    places to check.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    hub_name = serializers.ReadOnlyField(source="hub.name")
    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "hub",
            "hub_name",
        ]
        read_only_fields = ["id", "hub_name"]

    def validate_username(self, value):
        # 1. Lowercase and strip outer padding
        normalized_value = value.strip().lower()

        # 2. Block spacing bugs
        if ' ' in normalized_value:
            raise serializers.ValidationError("Usernames cannot contain spaces.")

        # 3. Ensure native character alignment
        username_validator = UnicodeUsernameValidator()
        try:
            username_validator(normalized_value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)

        # 4. Scope verification within the current active tenant schema database
        if UserProfile.objects.filter(username__iexact=normalized_value).exists():
            raise serializers.ValidationError("A user with that username already exists.")

        return normalized_value

    def validate_email(self, value):
        if not value:
            return value
        return value.strip().lower()

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

    organisation = serializers.CharField(required=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        """
        Attach the authenticated user to attrs for the view to consume.

        If this raises "Invalid username or password", confirm that the request
        is being sent to the correct tenant domain and that the user password
        was created through create_user() or set_password().
        """

        # 1. Safely extract and check the organization field
        organisation = attrs.get("organisation", "")
        if not organisation or not str(organisation).strip():
            raise serializers.ValidationError(
                {"organisation": "Organisation field cannot be blank."}
            )
        
        # 2. Clean the incoming credential strings before passing to authenticate()
        if "username" in attrs:
            attrs["username"] = attrs["username"].strip().lower()
        return attrs
