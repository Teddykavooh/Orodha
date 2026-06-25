# myBook

*Ufanisi wa Kiratiba, Utaratibu Sahihi.*

## Dev thingies

* `pylint orodha_backend/` - run `pylint`
* Migrations(**in this order**):
  * `.\.venv\Scripts\python.exe manage.py makemigrations`
  * `.\.venv\Scripts\python.exe manage.py migrate_schemas`

## Endpoints

* Tenant registration endpoint: `POST /api/tenants/register/`

* Auth endpoints:
  * `POST` `/api/auth/login/`
  * `POST /api/auth/logout/`
  * `GET /api/auth/me/`

* CRUD endpoints for:
  * `/api/users/`
  * `/api/hubs/`
  * `/api/products/`
  * `/api/book-items/`
  * `/api/inventory-movements/`
  * `/api/sales/`

## Role Mode

* `ADMIN`
  * full tenant CRUD on all resources
  * create/update/delete hubs, products, users, inventory, sale logs

* `MANAGER`
  * read access to their own hub data
  * can create sales like MERCHANDISER
  * can view hub users
  * can view sales records for their hub

* `MERCHANDISER`
  * can create sales
  * can view their own sales
  * can view inventory and movement data for their hub
