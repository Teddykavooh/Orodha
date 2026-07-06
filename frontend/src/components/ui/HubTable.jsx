import React from 'react'
import { Button } from './Button'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from './Table' // Adjust this path based on your folder structure

export default function HubTable({ hubs = [], onEdit, onDelete }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 max-h-[450px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {hubs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No hubs available.
              </TableCell>
            </TableRow>
          ) : (
            hubs.map((hub) => (
              <TableRow key={hub.id}>
                <TableCell className="font-medium">{hub.name}</TableCell>
                <TableCell>{hub.address}</TableCell>
                <TableCell>
                  {new Date(hub.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(hub)}
                    className="mr-2"
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(hub.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
