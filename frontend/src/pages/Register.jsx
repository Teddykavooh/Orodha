import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { publicApi } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

/**
 * Tenant registration page.
 * Registers a new tenant with display name, schema (subdomain), and business name.
 * On success, shows confirmation message.
 */
export default function Register() {
  const navigate = useNavigate();
  const [schema, setSchema] = useState("");
  const [business, setBusiness] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const isSuccess = typeof msg === "string" && msg.includes("success");
  const displayMsg = typeof msg === "string" ? msg : JSON.stringify(msg);

  // function tenantLoginUrl(tenantDomain, username) {
  //   const protocol = window.location.protocol;
  //   const port = window.location.port ? `:${window.location.port}` : "";
  //   const params = new URLSearchParams({ username });
  //   return `${protocol}//${tenantDomain}${port}/login?${params.toString()}`;
  // }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await publicApi.post("/tenants/register/", {
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

      setTimeout(() => {
        // window.location.href = res.data.login_url
        navigate("/login");
      }, 1500)

      setSchema("");
      setBusiness("");
      setAdminUsername("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (err) {
      const errorData = err?.response?.data;
      const simpleMessage = 
        errorData?.message ||                           // 1. Checks for custom message keys
        errorData?.detail ||                            // 2. Checks for standard DRF detail keys
        (typeof errorData === 'string' ? errorData : '') || // 3. Checks if data is a direct error string
        Object.values(errorData || {})[0]?.[0] ||       // 4. Extracts the first serializer error array item
        err?.message ||                                 // 5. Fallback to native browser error message
        "An unexpected error occurred.";                // 6. Hard safety fallback
      setMsg(String(simpleMessage).substring(0, 150)); // Keeps it short and strips huge text dumps
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
              {/* Relative wrapper keeps the button tracked inside the input bounds */}
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"} // Switches input mask rules instantly
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={loading}
                  className="pr-10" // Extra padding-right stops text running underneath the icon button
                />
                <button
                  type="button" // CRITICAL: Must be type="button" so it doesn't accidentally trigger form submit
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
