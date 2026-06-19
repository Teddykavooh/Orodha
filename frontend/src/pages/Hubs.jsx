import React, {
  useEffect,
  useState
} from 'react'

import {
  useDispatch,
  useSelector
} from 'react-redux'

import {
  fetchHubs,
  createHub,
  updateHub,
  deleteHub
} from '../features/hubs/hubsSlice'

import HubForm from '../components/hubs/HubForm'
import HubTable from '../components/hubs/HubTable'

export default function Hubs() {

  const dispatch = useDispatch()

  const hubs = useSelector(
    state => state.hubs.items
  )

  const [editingHub, setEditingHub] =
    useState(null)

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

      <h1 className="text-2xl font-bold">
        Hubs
      </h1>

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

      <HubTable
        hubs={hubs}
        onEdit={setEditingHub}
        onDelete={handleDelete}
      />

    </div>
  )
}