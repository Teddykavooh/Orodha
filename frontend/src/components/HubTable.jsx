import React from 'react'

export default function HubTable({
  hubs,
  onEdit,
  onDelete
}) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Name</th>
          <th>Address</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {hubs.map((hub) => (
          <tr key={hub.id}>
            <td>{hub.name}</td>

            <td>{hub.address}</td>

            <td>
              {new Date(
                hub.created_at
              ).toLocaleDateString()}
            </td>

            <td>
              <button
                onClick={() => onEdit(hub)}
                className="mr-2"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(hub.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}