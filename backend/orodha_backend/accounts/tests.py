from django.test import TestCase

from django_tenants.test.cases import TenantTestCase
from django_tenants.test.client import TenantClient
from rest_framework.authtoken.models import Token
from orodha_backend.accounts.models import UserProfile

# Create your tests here.
class UserManagementTests(TenantTestCase):
    def setUp(self):
        super().setUp()
        self.client = TenantClient(self.tenant)
        self.admin = UserProfile.objects.create_user(
            username="wh_admin",
            password="adminpass123",
            role="WHOLESALER_ADMIN",
        )
        token, _ = Token.objects.get_or_create(user=self.admin)
        self.auth = {"HTTP_AUTHORIZATION": f"Token {token.key}"}

    def test_wholesaler_admin_can_create_and_delete_sales_manager(self):
        create_data = {
            "username": "sales_mgr_1",
            "password": "strongpass123",
            "role": "SALES_MANAGER",
        }
        resp = self.client.post("/api/users/", create_data, **self.auth)
        self.assertEqual(resp.status_code, 201)
        created_id = resp.json()["id"]
        self.assertTrue(UserProfile.objects.filter(id=created_id, role="SALES_MANAGER").exists())

        del_resp = self.client.delete(f"/api/users/{created_id}/", **self.auth)
        self.assertEqual(del_resp.status_code, 204)
        self.assertFalse(UserProfile.objects.filter(id=created_id).exists())

    def test_wholesaler_admin_can_update_sales_manager_via_put(self):
        # create sales manager first
        create_data = {
            "username": "sales_mgr_put",
            "password": "strongpass123",
            "role": "SALES_MANAGER",
        }
        resp = self.client.post("/api/users/", create_data, **self.auth)
        self.assertEqual(resp.status_code, 201)
        user_id = resp.json()["id"]

        # full update via PUT (include all writable fields)
        update_data = {
            "username": "sales_mgr_put",
            "email": "sm_put@example.com",
            "first_name": "Updated",
            "last_name": "Manager",
            "role": "SALES_MANAGER",
            "hub": None,
        }
        put_resp = self.client.put(
            f"/api/users/{user_id}/",
            update_data,
            content_type="application/json",
            **self.auth,
        )
        self.assertEqual(put_resp.status_code, 200)
        self.assertTrue(
            UserProfile.objects.filter(id=user_id, first_name="Updated", email="sm_put@example.com").exists()
        )

    def test_wholesaler_admin_can_get_sales_manager(self):
        create_data = {
            "username": "sales_mgr_get",
            "password": "strongpass123",
            "role": "SALES_MANAGER",
        }
        resp = self.client.post("/api/users/", create_data, **self.auth)
        self.assertEqual(resp.status_code, 201)
        user_id = resp.json()["id"]

        get_resp = self.client.get(f"/api/users/{user_id}/", **self.auth)
        self.assertEqual(get_resp.status_code, 200)
        data = get_resp.json()
        self.assertEqual(data["id"], user_id)
        self.assertEqual(data["username"], "sales_mgr_get")
        self.assertEqual(data["role"], "SALES_MANAGER")