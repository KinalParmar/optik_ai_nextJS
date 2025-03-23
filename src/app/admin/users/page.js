'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import { createUser, updateUser, deleteUser, getUsers } from '../../../Services/Admin/Users';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { showSuccessToast, showErrorToast } from '@/Components/Toaster';
import DotLoader from '@/Components/DotLoader';
import { useRouter } from 'next/navigation';

// Define Yup validation schema
const userSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .trim()
    .notOneOf([''], 'Name cannot be empty'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string().when('$isEditing', (isEditing, schema) =>
    isEditing
      ? schema
      : schema
          .required('Password is required')
          .min(6, 'Password must be at least 6 characters')
  ),
  confirmPassword: Yup.string().when('$isEditing', (isEditing, schema) =>
    isEditing
      ? schema
      : schema
          .required('Confirm Password is required')
          .oneOf([Yup.ref('password')], 'Passwords must match')
  ),
});

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    permissions: {
      leads: [],
      newleads: [],
    },
  });
  const router = useRouter();
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '', type: 'error' });
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userPermissions = user?.permissions?.users || [];

  // Define permission checks
  const canRead = true || userPermissions?.includes('read');
  const canUpdate = true || userPermissions?.includes('update');
  const canDelete = true || userPermissions?.includes('delete');
  const canCreate = true || userPermissions?.includes('create');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(userSchema),
    context: { isEditing: !!editingUser?.id },
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const getToken = localStorage?.getItem("Admintoken");
    if (!getToken) {
      router.push('/admin-login');
    }
  },[])

  useEffect(() => {
    if (canRead) {
      fetchUsers();
    }
  }, [canRead]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response?.success) {
        setUsers(response?.data ?? []);
      } else {
        showErrorToast(response?.message);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred while fetching users';
      showErrorToast(errorMessage);
      console?.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target || {};
    if (type === 'checkbox') {
      const [section, permission] = name?.split('-') || [];
      setFormData((prev) => ({
        ...prev,
        permissions: {
          ...prev?.permissions,
          [section]: checked
            ? [...(prev?.permissions?.[section] || []), permission]
            : prev?.permissions?.[section]?.filter((p) => p !== permission) ?? [],
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setValue(name, value); // Update react-hook-form values
    }
  };

  const onSubmit = async (data) => {
    const submitData = {
      name: data?.name,
      email: data?.email,
      password: data?.password,
      permissions: formData?.permissions,
    };

    try {
      setLoading(true);
      if (editingUser?.id) {
        await updateUser(editingUser?.id, submitData);
        showSuccessToast('User updated successfully!');
      } else {
        await createUser(submitData);
        showSuccessToast('User created successfully!');
      }
      await fetchUsers();
      resetForm();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred while saving user';
      showErrorToast(errorMessage);
      console?.error('Failed to submit user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      confirmPassword: '',
      permissions: user?.permissions ?? { leads: [], newleads: [] },
    });
    setValue('name', user?.name ?? '');
    setValue('email', user?.email ?? '');
    setValue('password', '');
    setValue('confirmPassword', '');
    setShowForm(true);
    setShowRoles(false);
  };

  const handleRoles = (user) => {
    setEditingUser(user);
    setFormData({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      confirmPassword: '',
      permissions: user?.permissions ?? { leads: [], newleads: [] },
    });
    setShowRoles(true);
    setShowForm(false);
  };

  const handleDelete = (userId) => {
    setDeleteModal({ show: true, userId });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteUser(deleteModal?.userId);
      showSuccessToast('User deleted successfully!');
      await fetchUsers();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred while deleting user';
      showErrorToast(errorMessage);
      console?.error('Failed to delete user:', error);
    } finally {
      setLoading(false);
      setDeleteModal({ show: false, userId: null });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      permissions: { leads: [], newleads: [] },
    });
    setEditingUser(null);
    setShowForm(false);
    setShowRoles(false);
    reset();
  };

  const closeModal = () => {
    setModal({ show: false, message: '', type: 'error' });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, userId: null });
  };

  const filteredUsers = users?.filter(
    (user) =>
      user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  ) ?? [];

  const permissionOptions = ['create', 'read', 'update', 'delete'];

  return (
    <>
      {loading ? (
        <DotLoader />
      ) : (
        <>
          <section className="px-8 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-[20px] font-bold text-[#334155]">Users Management</h1>

              {!showForm && !showRoles && canCreate && (
                <div className="flex items-center gap-2.5">
                  {canRead && (
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] w-[200px] text-[13px] font-medium focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
                        value={searchTerm || ''}
                        onChange={(e) => setSearchTerm(e?.target?.value || '')}
                      />
                    </div>
                  )}
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

            {showForm && canCreate && (
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
                      {editingUser?.id ? 'Edit User' : 'Create User'}
                    </h2>
                  </div>

                  <div className="flex justify-center">
                    <form onSubmit={handleSubmit(onSubmit)} className="w-[320px] space-y-4">
                      <div>
                        <label className="block text-[13px] font-bold text-[#334155] mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          {...register('name')}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded border ${
                            errors?.name ? 'border-red-500' : 'border-[#E2E8F0]'
                          } focus:outline-none focus:border-[#6366F1] text-[13px]`}
                          placeholder="Enter name"
                        />
                        {errors?.name && (
                          <p className="text-red-500 text-sm mt-1">{errors?.name?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#334155] mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          {...register('email')}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded border ${
                            errors?.email ? 'border-red-500' : 'border-[#E2E8F0]'
                          } focus:outline-none focus:border-[#6366F1] text-[13px]`}
                          placeholder="Enter email"
                        />
                        {errors?.email && (
                          <p className="text-red-500 text-sm mt-1">{errors?.email?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#334155] mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          {...register('password')}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded border ${
                            errors?.password ? 'border-red-500' : 'border-[#E2E8F0]'
                          } focus:outline-none focus:border-[#6366F1] text-[13px]`}
                          placeholder="Enter new password"
                        />
                        {errors?.password && (
                          <p className="text-red-500 text-sm mt-1">{errors?.password?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#334155] mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          {...register('confirmPassword')}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded border ${
                            errors?.confirmPassword ? 'border-red-500' : 'border-[#E2E8F0]'
                          } focus:outline-none focus:border-[#6366F1] text-[13px]`}
                          placeholder="Confirm new password"
                        />
                        {errors?.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors?.confirmPassword?.message}
                          </p>
                        )}
                      </div>
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full px-3 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all duration-200 text-[13px] font-bold"
                        >
                          {editingUser?.id ? 'Update User' : 'Create User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {showRoles && (canUpdate || canCreate) && (
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
                    <form onSubmit={handleSubmit(onSubmit)} className="w-80 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">Leads Permissions</h3>
                        {permissionOptions?.map((permission) => (
                          <div key={`leads-${permission}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`leads-${permission}`}
                              name={`leads-${permission}`}
                              checked={formData?.permissions?.leads?.includes(permission) ?? false}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label
                              htmlFor={`leads-${permission}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {permission?.charAt(0)?.toUpperCase() + permission?.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">
                          New Leads Permissions
                        </h3>
                        {permissionOptions?.map((permission) => (
                          <div key={`newleads-${permission}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`newleads-${permission}`}
                              name={`newleads-${permission}`}
                              checked={
                                formData?.permissions?.newleads?.includes(permission) ?? false
                              }
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label
                              htmlFor={`newleads-${permission}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {permission?.charAt(0)?.toUpperCase() + permission?.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
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
              <>
                {canRead ? (
                  <div className="bg-white rounded-[4px] border border-[#E2E8F0] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#DDDAFA]">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers?.length > 0 ? (
                          filteredUsers?.map((user) => (
                            <tr
                              key={user?.id}
                              className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200"
                            >
                              <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">
                                {user?.name || '-'}
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#64748B]">
                                {user?.email || '-'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {(canUpdate || canCreate) && (
                                    <button
                                      onClick={() => handleRoles(user)}
                                      className="p-1.5 text-[#22C55E] hover:bg-[#22C55E] hover:bg-opacity-10 rounded transition-colors duration-200 text-[12px] font-bold"
                                      title="Edit Roles"
                                    >
                                      ROLES
                                    </button>
                                  )}
                                  {canUpdate && (
                                    <button
                                      onClick={() => handleEdit(user)}
                                      className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                                      title="Edit User"
                                    >
                                      <FiEdit2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      onClick={() => handleDelete(user?.id)}
                                      className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                                      title="Delete User"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  )}
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
                                <p className="text-[12px] mt-1 text-[#94A3B8]">
                                  Create a new user to get started
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-6 text-center">
                    <p className="text-[#64748B] text-[13px] font-bold">
                      You do not have permission to view users.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          {modal?.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`text-lg font-semibold ${
                      modal?.type === 'error' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {modal?.type === 'error' ? 'Error' : 'Success'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                </div>
                <p className="text-gray-700 mb-6">{modal?.message}</p>
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className={`px-4 py-2 rounded text-white ${
                      modal?.type === 'error'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteModal?.show && canDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Confirm Delete</h3>
                  <button onClick={closeDeleteModal} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                </div>
                <p className="text-gray-700 mb-6">Are you sure you want to delete this user?</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}