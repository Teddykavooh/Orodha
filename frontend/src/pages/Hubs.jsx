import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHubs, createHub, updateHub, deleteHub } from '../features/hubs/hubsSlice'
import HubForm from '../components/ui/HubForm'
import HubTable from '../components/ui/HubTable'
import { Building2 } from 'lucide-react'

export default function Hubs() {

  const dispatch = useDispatch()
  const authUser = useSelector(state => state.auth.user)
  const usersStatus = useSelector(state => state.users.status)
  const hubs = useSelector(state => state.hubs.items)

  const [editingHub, setEditingHub] = useState(null)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    dispatch(fetchHubs())
  }, [dispatch])

  async function handleCreate(data) {
    await dispatch(
      createHub(data)
    ).unwrap()
  }

  async function handleUpdate(data) {
    await dispatch(
      updateHub({
        id: editingHub.id,
        data
      })
    ).unwrap()

    setEditingHub(null)
  }

  async function handleDelete(id) {

    if (
      !window.confirm(
        'Delete this hub?'
      )
    ) return

    await dispatch(
      deleteHub(id)
    ).unwrap()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-start gap-3 items-center border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Hubs
          </h1>
          {/* Large, custom-branded blue dashboard icon */}
          <Building2 className="h-8 w-8 text-blue-600 transition-transform duration-200 hover:scale-110" />
        </div>
        {/* Button Trigger to open the Dialog Modal */}
        <button 
          onClick={() => setHidden(false)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {editingHub ? 'Modify Hub' : 'Add New Hub'}
        </button>
      </div>

      {!hidden && (
        <div className="border p-4 rounded">

          <h2 className="font-semibold mb-4">

            {editingHub
              ? 'Edit Hub'
              : 'Create Hub'}

          </h2>

          <HubForm
            initialData={editingHub}
            onSubmit={
              editingHub
                ? handleUpdate
                : handleCreate
            }
            onCancel={() =>
              setEditingHub(null)
            }
          />

        </div>
      )}

      <HubTable
        hubs={hubs}
        onEdit={setEditingHub}
        onDelete={handleDelete}
      />

    </div>
  )
}