import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'
import { login } from '../features/auth/authSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

/**
 * Login page: form to authenticate via Redux login thunk.
 * On success, redirects to /dashboard.
 * Shows error messages on failure.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organisation, setOrganisation] = useState(localStorage.getItem("organisation") || "")
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await dispatch(login({ organisation, username, password })).unwrap()

      // console.log(res);
      // console.log("This is me domain: ", res.tenant.tenant_domain);

      localStorage.setItem("token", res.token);

      localStorage.setItem("tenant_domain", res.tenant.tenant_domain)

      const roleRoutes = {
        WHOLESALER_ADMIN: "/dashboard",
        SALES_MANAGER: "/inventory",
        SALESPERSON: "/sales",
      };

      const destination =
        roleRoutes[res.user.role] || "/";

      const protocol = window.location.protocol;
      const port = window.location.port
        ? `:${window.location.port}`
        : "";
      const host = window.location.hostname

      // console.log("me link: ", `${protocol}//${host}${port}${destination}`)
      // window.location.href = `${protocol}//${host}${port}${destination}`;
      // if (res.user.role === "WHOLESALER_ADMIN") {
      //   navigate("/dashboard");
      // }
      // else if (res.user.role === "SALES_MANAGER") {
      //   navigate("/inventory");
      // }
      // else {
      //   navigate("/sales");
      // }

      navigate(`${destination}`)
      // console.log("Me link: ", `${destination}`)

    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <Input
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                placeholder="Enter Domain e.g. acmecorp"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{String(error)}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
