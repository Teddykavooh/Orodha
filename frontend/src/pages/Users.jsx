import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers, createUser, deleteUser } from '../features/users/usersSlice'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select, SelectOption } from '../components/ui/Select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog'

/**
 * Users page: displays a table of users from Redux store and allows WHOLESALER_ADMIN to create/delete.
 * 
 * Data flow:
 * - Fetches users via Redux `fetchUsers` thunk on mount
 * - Creates users via `createUser` thunk with dialog modal
 * - Deletes users via `deleteUser` thunk with confirmation
 * - Only WHOLESALER_ADMIN can create/delete users
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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SALESPERSON");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch]);

  /**
   * Handle user creation via Redux thunk dispatch.
   * Validates required fields, dispatches createUser action, clears form and closes dialog.
   */
  async function handleCreateUser(e) {
    e.preventDefault();
    if (!username || !password) {
      alert("Username and password are required");
      return;
    }
    setLoading(true);
    try {
      const result = await dispatch(createUser({ username, password, email, role })).unwrap();
      // Reset form and close dialog on success
      setUsername("");
      setPassword("");
      setEmail("");
      setRole("SALESPERSON");
      setIsOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle user deletion via Redux thunk dispatch.
   * Shows confirmation dialog before deleting.
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
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        {authUser?.role === "WHOLESALER_ADMIN" && (
          <Button onClick={() => setIsOpen(true)} disabled={usersStatus === 'loading'}>Add User</Button>
        )}
      </div>

      {/* Error message display */}
      {usersError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {usersError}
        </div>
      )}

      {/* Create user dialog modal */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateUser} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <Input
              type="password"
              placeholder="min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
              <SelectOption value="SALES_MANAGER">SALES_MANAGER</SelectOption>
              <SelectOption value="SALESPERSON">SALESPERSON</SelectOption>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
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
                        u.role === 'WHOLESALER_ADMIN' ? 'bg-red-100 text-red-800' :
                        u.role === 'SALES_MANAGER' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {authUser?.role === "WHOLESALER_ADMIN" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
