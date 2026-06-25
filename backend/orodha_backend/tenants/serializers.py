import os

from django.contrib.auth import get_user_model
from django.db import transaction
from django_tenants.utils import tenant_context
from rest_framework import serializers

from .models import Client, Domain


class TenantRegistrationSerializer(serializers.Serializer):
    """
    Create a new tenant, primary domain, and first admin user.

    This serializer is intentionally not a ModelSerializer because one request
    creates records in two different places:
    - public schema: Client and Domain
    - new tenant schema: the first UserProfile admin

    If tenant registration fails halfway, transaction.atomic helps roll back
    the public-schema records.
    """

    schema_name = serializers.SlugField(max_length=63)
    # name = serializers.CharField(max_length=255)
    business_name = serializers.CharField(max_length=255)
    logo = serializers.CharField(max_length=255, required=False, allow_blank=True)
    # for later
    # logo = serializers.ImageField(
    #     required=False,
    #     allow_null=True
    # )
    tagline = serializers.CharField(max_length=255, required=False, allow_blank=True)
    primary_color = serializers.CharField(max_length=7, required=False)
    secondary_color = serializers.CharField(max_length=7, required=False)
    accent_color = serializers.CharField(max_length=7, required=False)
    admin_username = serializers.CharField(max_length=150)
    admin_email = serializers.EmailField(required=False, allow_blank=True)
    admin_password = serializers.CharField(write_only=True, min_length=8)

    def validate_schema_name(self, value):
        """
        Ensure the PostgreSQL schema name is unique.

        schema_name becomes the tenant schema in the database, so it must be
        stable and URL/identifier friendly. SlugField keeps it simple.
        """

        if Client.objects.filter(schema_name=value).exists():
            raise serializers.ValidationError("A tenant with this schema already exists.")
        return value

    # def validate_name(self, value):
    #     """Ensure the tenant display/internal name is unique."""

    #     if Client.objects.filter(name=value).exists():
    #         raise serializers.ValidationError("A tenant with this name already exists.")
    #     return value

    # def validate_domain(self, value):
    #     """
    #     Normalize and validate the tenant domain.

    #     django-tenants uses Domain.domain to decide which schema a request
    #     belongs to. Duplicate domains would make routing ambiguous.
    #     """

    #     value = value.lower().strip()

    #     full_domain = f"{value}.{os.getenv('TENANT_BASE_DOMAIN')}"

    #     if Domain.objects.filter(domain=full_domain).exists():
    #         raise serializers.ValidationError("This domain is already registered.")
    #     return value

    @transaction.atomic
    def create(self, validated_data):
        """
        Create tenant infrastructure and the initial tenant admin.

        The Client and Domain are saved in the public schema. The admin user is
        created inside tenant_context(tenant), which switches the database
        connection to the new tenant schema for the duration of the block.
        """

        admin_username = validated_data.pop("admin_username")
        admin_email = validated_data.pop("admin_email", "")
        admin_password = validated_data.pop("admin_password")
        # automate domain registration
        domain_slug =  validated_data.get("schema_name")
        domain_name = (
            f"{domain_slug}.{os.getenv('TENANT_BASE_DOMAIN')}"
        )
        


        tenant = Client.objects.create(**validated_data)
        domain = Domain.objects.create(
            domain=domain_name,
            tenant=tenant,
            is_primary=True,
        )

        # schema switching
        User = get_user_model()
        with tenant_context(tenant):
            admin = User.objects.create_user(
                username=admin_username,
                email=admin_email,
                password=admin_password,
                role="ADMIN",
                is_staff=True,
                # let role-based permissions control access, no full Django superuser privileges
                is_superuser=False,
            )

        return {
            "tenant": tenant,
            "domain": domain,
            "admin": admin,
        }

    def to_representation(self, instance):
        """
        Shape the response after create().

        create() returns a small dict of model instances instead of a single
        model. This method converts that dict into clean JSON for the API.
        """

        tenant = instance["tenant"]
        domain = instance["domain"]
        admin = instance["admin"]

        return {
            "message": "Registration successful",
            # "login_url": f"{os.getenv("FRONTEND_PROTOCOL")}://{domain.domain}:{os.getenv("FRONTEND_PORT")}/login",
            "tenant": {
                "id": tenant.id,
                "schema_name": tenant.schema_name,
                "business_name": tenant.business_name,
                "domain": domain.domain,
            },
            "admin": {
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "role": admin.role,
            },
        }


class TenantSerializer(serializers.ModelSerializer):
    """
    Read-only representation of registered tenants.

    This is mainly for admin/debug views. Normal tenant users should usually
    interact with their tenant domain, not list all tenants.
    """

    domains = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Client
        fields = [
            "id",
            "schema_name",
            "business_name",
            "logo",
            "tagline",
            "primary_color",
            "secondary_color",
            "accent_color",
            "paid_until",
            "on_trial",
            "created_on",
            "domains",
        ]
        read_only_fields = ["id", "created_on", "domains"]
