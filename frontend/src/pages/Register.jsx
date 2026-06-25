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

  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  // Track which Logo Input Method is Active ('file' or 'url')
  const [logoMethod, setLogoMethod] = useState("file");

  // function tenantLoginUrl(tenantDomain, username) {
  //   const protocol = window.location.protocol;
  //   const port = window.location.port ? `:${window.location.port}` : "";
  //   const params = new URLSearchParams({ username });
  //   return `${protocol}//${tenantDomain}${port}/login?${params.toString()}`;
  // }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

     // Create a real FormData stream container right inside the handler
    const formData = new FormData();
    
    // Append all your primary scalar text metadata values
    formData.append("schema_name", schema);
    formData.append("business_name", business);
    formData.append("admin_username", adminUsername);
    formData.append("admin_email", adminEmail);
    formData.append("admin_password", adminPassword);

    // Conditionally append ONLY the active user option to keep the data payload clean
    if (logoMethod === "file" && logoFile) {
      formData.append("logo_file", logoFile); // Sends raw device binary file data [3]
    } else if (logoMethod === "url" && logoUrl) {
      formData.append("logo_url", logoUrl);   // Sends a plain text web address string [3]
    }

    try {
      const res = await publicApi.post("/tenants/register/", formData, {
        headers: {
          // Tell the browser to encode this as a multi-part boundary stream for files [3]
          "Content-Type": "multipart/form-data",
        },
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
      setLogoMethod("file");
      setLogoFile(null);
      setLogoUrl("");
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
      <Card className="w-full max-w-md shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register Tenant</CardTitle>
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
            {/* ADD: THE LOGO OPTION METHOD SWITCHER TABS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo Method</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
                <button
                  type="button" // CRITICAL: Prevents accidental form submissions on click
                  onClick={() => setLogoMethod("file")}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
                    logoMethod === "file" 
                      ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                  }`}
                >
                  <Image className="h-4 w-4" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoMethod("url")}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
                    logoMethod === "url" 
                      ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                  }`}
                >
                  <Link2 className="h-4 w-4" />
                  <span>Paste URL Link</span>
                </button>
              </div>
            </div>

            {/* ADD: THE CONDITIONAL LOGO FIELD CONTAINER */}
            <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg min-h-[76px] flex flex-col justify-center">
              {logoMethod === "file" ? (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Choose a local image file</label>
                  <input
                    type="file"
                    accept="image/*" // Optimises the native mobile overlay picker to focus strictly on photo galleries
                    onChange={(e) => setLogoFile(e.target.files[0])} // 🔑 CRITICAL FIX: Grabs the single, raw file object instead of the FileList array
                    disabled={loading}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100 disabled:opacity-50 transition-colors"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Paste web image address</label>
                  <Input 
                    type="url"
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)} 
                    placeholder="https://example.com" 
                    disabled={loading} 
                    className="bg-white"
                  />
                </div>
              )}
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

            {/* Feedback Messages */}
            {msg && <p className={`text-sm p-2 rounded ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{displayMsg}</p>}
            
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
