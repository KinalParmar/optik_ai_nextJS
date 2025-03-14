'use client'
import { useState } from 'react'
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiArrowLeft } from 'react-icons/fi'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showRoles, setShowRoles] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    allowView: false,
    allowEdit: false,
    allowDelete: false,
    allowCreate: false,
  })
  const [editingUser, setEditingUser] = useState(null)

  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com',
      allowView: false,
      allowEdit: false,
      allowDelete: false,
      allowCreate: false 
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com',
      allowView: false,
      allowEdit: false,
      allowDelete: false,
      allowCreate: false 
    }
  ])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (editingUser) {
      // Update existing user
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ))
    } else {
      // Create new user
      const newUser = {
        id: users.length + 1,
        ...formData
      }
      setUsers([...users, newUser])
    }

    // Reset form
    resetForm()
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      allowView: user.allowView,
      allowEdit: user.allowEdit,
      allowDelete: user.allowDelete,
      allowCreate: user.allowCreate
    })
    setShowForm(true)
    setShowRoles(false)
  }

  const handleRoles = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      allowView: user.allowView,
      allowEdit: user.allowEdit,
      allowDelete: user.allowDelete,
      allowCreate: user.allowCreate
    })
    setShowRoles(true)
    setShowForm(false)
  }

  const handleDelete = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      allowView: false,
      allowEdit: false,
      allowDelete: false,
      allowCreate: false
    })
    setEditingUser(null)
    setShowForm(false)
    setShowRoles(false)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section className="px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-bold text-[#334155]">Users Management</h1>

        {!showForm && !showRoles && (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] w-[200px] text-[13px] font-medium focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold"
            >
              <FiUserPlus className="w-3.5 h-3.5" />
              Create User
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-[4px] border border-[#E2E8F0]">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={resetForm}
                className="p-2 hover:bg-[#F8FAFF] rounded-full transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5 text-[#64748B]" />
              </button>
              <h2 className="text-xl font-bold text-[#334155]">
                {editingUser ? 'Edit User' : 'Create User'}
              </h2>
            </div>

            <div className="flex justify-center">
              <form onSubmit={handleSubmit} className="w-[320px] space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#334155] mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded border border-[#E2E8F0] focus:outline-none focus:border-[#6366F1] text-[13px]"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#334155] mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded border border-[#E2E8F0] focus:outline-none focus:border-[#6366F1] text-[13px]"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#334155] mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded border border-[#E2E8F0] focus:outline-none focus:border-[#6366F1] text-[13px]"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#334155] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded border border-[#E2E8F0] focus:outline-none focus:border-[#6366F1] text-[13px]"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all duration-200 text-[13px] font-bold"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showRoles && (
        <div className="bg-white rounded-md border border-gray-300 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-xl font-semibold text-gray-700">User Roles</h2>
            </div>

            <div className="flex justify-center">
              <form onSubmit={handleSubmit} className="w-80 space-y-4">
                {[
                  { name: "allowView", label: "Allow View" },
                  { name: "allowEdit", label: "Allow Edit" },
                  { name: "allowDelete", label: "Allow Delete" },
                  { name: "allowCreate", label: "Allow Create" },
                ].map(({ name, label }) => (
                  <div key={name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={name}
                      name={name}
                      checked={formData[name]}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor={name} className="text-sm font-medium text-gray-700 cursor-pointer">
                      {label}
                    </label>
                  </div>
                ))}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:opacity-90 transition-all duration-200 text-sm font-semibold"
                  >
                    Save Roles
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {!showForm && !showRoles && (
        <div className="bg-white rounded-[4px] border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#DDDAFA]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Name</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Email</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">{user.name}</td>
                    <td className="px-4 py-3 text-[13px] text-[#64748B]">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRoles(user)}
                          className="p-1.5 text-[green] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                          title="Edit Roles"
                        >
                          ROLES
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                          title="Edit User"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                          title="Delete User"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-[#64748B]">
                      <FiUserPlus className="w-8 h-8 text-[#E2E8F0] mb-2" />
                      <p className="text-[13px] font-bold">No users found</p>
                      <p className="text-[12px] mt-1 text-[#94A3B8]">Create a new user to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}