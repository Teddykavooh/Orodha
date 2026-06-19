import React, { useState, useEffect } from 'react'

export default function HubForm({
  initialData,
  onSubmit,
  onCancel
}) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setAddress(initialData.address)
    }
  }, [initialData])

  function handleSubmit(e) {
    e.preventDefault()

    onSubmit({
      name,
      address,
    })

    if (!initialData) {
      setName('')
      setAddress('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        className="w-full border rounded p-2"
        placeholder="Hub Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <textarea
        className="w-full border rounded p-2"
        placeholder="Address"
        value={address}
        onChange={(e)=>setAddress(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Save
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}