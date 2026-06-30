import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { fetchMe, login } from '../features/auth/authSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

/**
 * Login page: form to authenticate via Redux login thunk.
 * On success, redirects to /dashboard.
 * Shows error messages on failure.
 */
export default function Login() {
  const storedOrg = localStorage.getItem("organisation");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organisation, setOrganisation] = useState(storedOrg && storedOrg !== "null" && storedOrg !== "undefined" ? storedOrg : "");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [msg, setMsg] = useState(null);
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
      // console.log("This is me token: ", res.token);
      // console.log("This is me org: ", organisation);

      // localStorage.setItem("token", res.token);

      // localStorage.setItem("organisation", organisation)

      // setMsg(res.data.message);

      const roleRoutes = {
        ADMIN: "/dashboard",
        MANAGER: "/sales",
        MERCHANDISER: "/sales",
      };

      const destination =
        roleRoutes[res.user.role] || "/sales";

      const protocol = window.location.protocol;
      const port = window.location.port
        ? `:${window.location.port}`
        : "";
      const host = window.location.hostname

      window.location.href = `${protocol}//${host}${port}${destination}`;
      // dispatch(fetchMe())

      // setTimeout(() => {
      //   // console.log("Me link: ", `${destination}`)
      //   // console.log("GOTO link: ", `${protocol}//${organisation}.${host}${port}${destination}`)
      //   navigate(`${destination}`)
      // }, 1500);

    } catch (err) {
      // console.log("Log in err: ", err);
      setError(err?.detail || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Code</label>
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
              {/* Relative wrapper keeps the button tracked inside the input bounds */}
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"} // Switches input mask rules instantly
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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
