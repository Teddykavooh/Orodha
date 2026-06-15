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
  const [name, setName] = useState("");
  const [schema, setSchema] = useState("");
  const [business, setBusiness] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/tenants/register/", { name, schema_name: schema, business_name: business });
      setMsg("Tenant registered. Check tenant domain to continue.");
      setName("");
      setSchema("");
      setBusiness("");
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schema (subdomain)</label>
              <Input value={schema} onChange={(e) => setSchema(e.target.value)} placeholder="e.g., acmecorp" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
              <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Full business name" disabled={loading} />
            </div>
            {msg && <p className={`text-sm p-2 rounded ${msg.includes('registered') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{String(msg)}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
