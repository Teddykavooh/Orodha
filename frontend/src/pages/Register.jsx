import React, { useState } from "react";
import api from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

/**
 * Tenant registration page.
 * Registers a new tenant with display name, schema (subdomain), and business name.
 * On success, shows confirmation message.
 */
export default function Register() {
  const [schema, setSchema] = useState("");
  const [business, setBusiness] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const isSuccess = typeof msg === "string" && msg.includes("registered");
  const displayMsg = typeof msg === "string" ? msg : JSON.stringify(msg);

  function tenantLoginUrl(tenantDomain, username) {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const params = new URLSearchParams({ username });
    return `${protocol}//${tenantDomain}${port}/login?${params.toString()}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/tenants/register/", {
        schema_name: schema,
        business_name: business,
        logo: "",
        admin_username: adminUsername,
        admin_email: adminEmail,
        admin_password: adminPassword,
      });
      // const tenantDomain = res.data?.tenant?.domain || domain;
      // window.location.assign(tenantLoginUrl(tenantDomain, adminUsername));

      // after registration save organisation or domain for login
      localStorage.setItem("organisation", schema);

      setMsg(res.data.message);

      // navigate("/login");
      setTimeout(() => {
        window.location.href = res.data.login_url
      }, 1500)

      setSchema("");
      setBusiness("");
      setAdminUsername("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (err) {
      setMsg(err?.response?.data || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Code</label>
              <Input value={schema} onChange={(e) => setSchema(e.target.value)} placeholder="e.g., acmecorp" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
              <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Full business name" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin username</label>
              <Input value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="e.g., admin" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin email</label>
              <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin password</label>
              <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="At least 8 characters" disabled={loading} />
            </div>
            {msg && <p className={`text-sm p-2 rounded ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{displayMsg}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
