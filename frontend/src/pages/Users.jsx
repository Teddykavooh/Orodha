import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Users as UsersIcon } from 'lucide-react';

import { fetchUsers, createUser, deleteUser, updateUser } from '../features/users/usersSlice'
import { fetchHubs } from '../features/hubs/hubsSlice'

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select, SelectOption } from '../components/ui/Select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog'

/**
 * Users page: displays a table of users from Redux store and allows ADMIN to create/delete.
 * 
 * Data flow:
 * - Fetches users via Redux `fetchUsers` thunk on mount
 * - Creates users via `createUser` thunk with dialog modal
 * - Deletes users via `deleteUser` thunk with confirmation
 * - Only ADMIN can create/delete users
 * 
 * UI:
 * - Shadcn Table component for responsive user list
 * - Dialog modal for creating new users
 * - Destructive red button for delete action
 */
export default function Users() {
  const dispatch = useDispatch()
  const users = useSelector(state => state.users.items)
  const usersStatus = useSelector(state => state.users.status)
  const usersError = useSelector(state => state.users.error)
  const authUser = useSelector(state => state.auth.user)
  const hubs = useSelector(state => state.hubs.items);

  // Form Field States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MERCHANDISER");
  const [showPassword, setShowPassword] = useState(false);
  const [hub, setHub] = useState("")
  
  // UI Flow Control States
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Added state to track current row editing profile

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchHubs());
  }, [dispatch]);

  // Open modal configured for a clean "Create User" session
  function openCreateModal() {
    setEditingUser(null)
    setUsername("")
    setPassword("")
    setEmail("")
    setRole("MERCHANDISER")
    setHub("")
    setIsOpen(true)
  }

  // Open modal pre-filled configured for "Edit User" session
  function openEditModal(user) {
    setEditingUser(user)
    setUsername(user.username || "")
    setPassword("") // Clear password field completely for safety
    setEmail(user.email || "")
    setRole(user.role || "MERCHANDISER")
    setHub(user.hub || "")
    setIsOpen(true)
  }

  // Cancel and reset dialog context cleanly
  function handleCloseModal() {
    setIsOpen(false)
    setEditingUser(null)
    setUsername("")
    setPassword("")
    setEmail("")
    setRole("MERCHANDISER")
    setHub("")
    setShowPassword(false)
  }

  /**
   * Combined handler that pipes submissions into Create or Update sequences conditionally.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation rules vary dynamically depending on configuration mode
    if (!editingUser && (!username || !password)) {
      alert("Username and password are required");
      return;
    }
    if (editingUser && !username) {
      alert("Username is required");
      return;
    }

    setLoading(true);

    // Build modern standard payload body mapping fields out cleanly
    const payload = { username, email, role, hub: hub || null };
    if (password) {
      payload.password = password; // Attach password mutation variables only if explicitly written
    }

    try {
      if (editingUser) {
        // Mode: Update Existing User
        await dispatch(updateUser({
          id: editingUser.id,
          data: payload
        })).unwrap();
      } else {
        // Mode: Create New User
        await dispatch(createUser(payload)).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      alert(err?.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle user deletion via Redux thunk dispatch.
   */
  async function handleDeleteUser(id) {
    if (!window.confirm("Delete user? This action cannot be undone.")) return;
    try {
      await dispatch(deleteUser(id)).unwrap();
    } catch (err) {
      alert(err?.message || "Failed to delete user");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex justify-start gap-3 items-center border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Users
          </h1>
          {/* Large, custom-branded blue dashboard icon */}
          <UsersIcon className="h-8 w-8 text-blue-600 transition-transform duration-200 hover:scale-110" />
        </div>
        {authUser?.role === "ADMIN" && (
          <Button onClick={openCreateModal} disabled={usersStatus === 'loading'}>
            Add User
          </Button>
        )}
      </div>

      {/* Error message display */}
      {usersError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {usersError}
        </div>
      )}

      {/* Shared Configuration Form Dialog Modal */}
      <Dialog isOpen={isOpen} onClose={handleCloseModal} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editingUser ? "Password (Leave blank to keep current)" : "Password *"}
            </label>
            {/* Relative wrapper keeps the button tracked inside the input bounds */}
            <div className="relative flex items-center">
              <Input
                type={showPassword ? "text" : "password"} // Switches input mask rules instantly
                placeholder="min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required={!editingUser} // Form rule changes depending on mode
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
              <SelectOption value="ADMIN">ADMIN</SelectOption>
              <SelectOption value="MANAGER">MANAGER</SelectOption>
              <SelectOption value="MERCHANDISER">MERCHANDISER</SelectOption>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Hub / Warehouse Location</label>
            <select 
              value={hub} 
              onChange={(e) => setHub(e.target.value)} 
              disabled={loading}
              className="w-full flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">No Hub Assignment (Global/Unassigned)</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          {usersStatus === 'loading' && <p className="p-6 text-gray-500 text-center">Loading users...</p>}
          {usersStatus === 'succeeded' && users.length === 0 && (
            <p className="p-6 text-gray-500 text-center">No users found.</p>
          )}
          {usersStatus === 'succeeded' && users.length > 0 && (
            <div className="w-full overflow-x-auto rounded-lg max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm">{u.id}</TableCell>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="text-sm text-gray-600">{u.email || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          u.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">
                          {u.hub_name || "Central Warehouse (Global)"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {authUser?.role === "ADMIN" && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(u)} // Connected missing Edit routing hook
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
