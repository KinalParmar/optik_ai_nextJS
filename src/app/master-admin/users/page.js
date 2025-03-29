'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import { getAllCompany, updateCompany } from '@/src/Services/Master-Admin/Home';
import { showSuccessToast, showErrorToast } from '@/Components/Toaster';
import DotLoader from '@/Components/DotLoader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';

// Define the Yup validation schema for the user form
const userSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Email must be in a valid format')
    .required('Email is required'),
  password: Yup.string().when('editingUser', {
    is: (editingUser) => !editingUser,
    then: (schema) => schema.required('Password is required for new users'),
    otherwise: (schema) => schema.notRequired(),
  }),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .when('editingUser', {
      is: (editingUser) => !editingUser,
      then: (schema) => schema.required('Confirm Password is required for new users'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [leadsToggle, setLeadsToggle] = useState(false);
  const [usersToggle, setUsersToggle] = useState(false);
  const [leadsPermissions, setLeadsPermissions] = useState([]);
  const [usersPermissions, setUsersPermissions] = useState([]);

  const leadPermissionsList = [
    { name: 'read', label: 'Allow Read' },
    { name: 'update', label: 'Allow Update' },
    { name: 'delete', label: 'Allow Delete' },
    { name: 'create', label: 'Allow Create' },
  ];

  const userPermissionsList = [
    { name: 'read', label: 'Allow Read' },
    { name: 'update', label: 'Allow Update' },
    { name: 'delete', label: 'Allow Delete' },
    { name: 'create', label: 'Allow Create' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      editingUser: null,
    },
  });

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompany();
      if (data && Array.isArray(data)) {
        setUsers(data);
        showSuccessToast('Companies fetched successfully');
      } else {
        setUsers([]);
        showErrorToast('Failed to fetch companies');
      }
    } catch (err) {
      showErrorToast('Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update company (generic function for both admin details and permissions)
  const handleUpdateCompany = async (id, updatedData) => {
    try {
      setLoading(true);
      if (!id) {
        throw new Error('Company ID is undefined');
      }

      const response = await updateCompany(id, updatedData);

      if (response?.success) {
        await fetchCompanies();
        showSuccessToast(response?.message || 'Company updated successfully');
        resetForm();
      } else {
        // showErrorToast(response?.message || 'Failed to update company');
      }
    } catch (err) {
      // showErrorToast('Failed to update company');
      console.error('Error updating company:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update company admin details
  const onSubmitUserForm = async (data) => {
    try {
      setLoading(true);
      const company = editingUser;
      if (!company?._id) {
        throw new Error('Editing user ID is undefined');
      }

      const updatedData = {
        dbSlug: company.dbSlug,
        name: company.name,
        regNo: company.regNo,
        email: company.email,
        address: company.address,
        pincode: company.pincode,
        adminName: data.name,
        adminEmail: data.email,
        adminPassword: data.password || undefined, // Only include if provided
        adminPhoneNumber: company.admin.phoneNumber,
        adminCountryCode: company.admin.countryCode,
        isAdmin: company.admin.isAdmin,
        permissions: company.admin.permissions,
        totalUsersAllowed: company.totalUsersAllowed,
        isEnabled: company.isEnabled,
        paymentStatus: company.paymentStatus,
        paymentAmount: company.paymentAmount,
        nextPaymentDate: company.nextPaymentDate,
      };

      await handleUpdateCompany(company._id, updatedData);
    } catch (err) {
      // showErrorToast('Failed to update company admin');
      console.error('Error updating company admin:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update company permissions
  const handleUpdatePermissions = async (id) => {
    try {
      setLoading(true);
      if (!id) {
        throw new Error('Company ID is undefined in handleUpdatePermissions');
      }

      const company = users.find((user) => user._id === id);
      if (!company) {
        throw new Error('Company not found in users list');
      }

      const updatedData = {
        dbSlug: company.dbSlug,
        name: company.name,
        regNo: company.regNo,
        email: company.email,
        address: company.address || '',
        pincode: company.pincode || '',
        adminName: company.admin.name,
        adminEmail: company.admin.email,
        adminPassword: undefined, // Not included unless explicitly set
        adminPhoneNumber: company.admin.phoneNumber || '',
        adminCountryCode: company.admin.countryCode || '',
        isAdmin: company.admin.isAdmin,
        permissions: {
          leads: leadsToggle ? leadsPermissions : [],
          users: usersToggle ? usersPermissions : [],
        },
        totalUsersAllowed: company.totalUsersAllowed,
        isEnabled: company.isEnabled,
        paymentStatus: company.paymentStatus || '',
        paymentAmount: company.paymentAmount,
        nextPaymentDate: company.nextPaymentDate || '',
      };

      await handleUpdateCompany(id, updatedData);
    } catch (err) {
      showErrorToast('Failed to update permissions');
      console.error('Error updating permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleLeadsPermissionChange = (permission) => {
    setLeadsPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  };

  const handleUsersPermissionChange = (permission) => {
    setUsersPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setValue('name', user?.admin?.name || '');
    setValue('email', user?.admin?.email || '');
    setValue('password', '');
    setValue('confirmPassword', '');
    setValue('editingUser', user);
    setShowForm(true);
    setShowRoles(false);
  };

  const handleRoles = (user) => {
    setEditingUser(user);
    setLeadsPermissions(user?.admin?.permissions?.leads || []);
    setUsersPermissions(user?.admin?.permissions?.users || []);
    setLeadsToggle(!!user?.admin?.permissions?.leads?.length);
    setUsersToggle(!!user?.admin?.permissions?.users?.length);
    setShowRoles(true);
    setShowForm(false);
  };

  const resetForm = () => {
    reset();
    setEditingUser(null);
    setShowForm(false);
    setShowRoles(false);
    setLeadsToggle(false);
    setUsersToggle(false);
    setLeadsPermissions([]);
    setUsersPermissions([]);
  };

  const filteredUsers = users?.filter((user) =>
    (user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      user?.admin?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()))
  ) || [];

  useEffect(() => {
    const getToken = localStorage?.getItem('token');
    if (!getToken) {
      router.push('/master-admin-login');
    }
  }, []);

  return (
    <div>
      {loading ? <DotLoader /> : (
        <section className="px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[20px] font-bold text-[#334155]">Users</h1>
            {!showForm && !showRoles && (
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search Users..."
                    className="pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] w-[200px] text-[13px] font-medium focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {showForm && (
            <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-6">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h2 className="text-xl font-semibold text-gray-700">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmitUserForm)} className="w-80 mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  />
                  {errors?.name && (
                    <p className="text-red-500 text-xs mt-1">{errors?.name?.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  />
                  {errors?.email && (
                    <p className="text-red-500 text-xs mt-1">{errors?.email?.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    {...register('password')}
                    className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:opacity-90 transition-all duration-200"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
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
                  <h2 className="text-xl font-semibold text-gray-700">Permissions</h2>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdatePermissions(editingUser?._id);
                  }}
                  className="w-80 mx-auto space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm font-medium text-gray-700">Leads</label>
                      <input
                        type="checkbox"
                        checked={leadsToggle}
                        onChange={(e) => setLeadsToggle(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    {leadsToggle && (
                      <div className="space-y-2 ml-4">
                        {leadPermissionsList.map(({ name, label }) => (
                          <div key={name} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`leads-${name}`}
                              checked={leadsPermissions.includes(name)}
                              onChange={() => handleLeadsPermissionChange(name)}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label
                              htmlFor={`leads-${name}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm font-medium text-gray-700">Users</label>
                      <input
                        type="checkbox"
                        checked={usersToggle}
                        onChange={(e) => setUsersToggle(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    {usersToggle && (
                      <div className="space-y-2 ml-4">
                        {userPermissionsList.map(({ name, label }) => (
                          <div key={name} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`users-${name}`}
                              checked={usersPermissions?.includes(name)}
                              onChange={() => handleUsersPermissionChange(name)}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label
                              htmlFor={`users-${name}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !editingUser?._id}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:opacity-90 transition-all duration-200 text-sm font-semibold disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Permissions'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {!showForm && !showRoles && (
            <div className="bg-white rounded-[4px] border border-[#E2E8F0] overflow-auto">
              <table className="w-full">
                <thead className="bg-[#DDDAFA]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      DB Slug
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Admin Email
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user?._id}
                        className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{user?.name || '-'}</td>
                        <td className="px-4 py-3">{user?.dbSlug || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{user?.admin?.email || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* Uncomment if you want to re-enable Edit button */}
                            {/* <button
                              onClick={() => handleEdit(user)}
                              className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                              title="Edit Company Admin"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button> */}
                            <button
                              onClick={() => handleRoles(user)}
                              className="p-1.5 text-[#22C55E] hover:bg-[#22C55E] hover:bg-opacity-10 rounded transition-colors duration-200 text-[12px] font-bold"
                              title="Edit Permissions"
                            >
                              ROLES
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-[#64748B]">
                          <FiUserPlus className="w-8 h-8 text-[#E2E8F0] mb-2" />
                          <p className="text-[13px] font-bold">No companies found</p>
                          <p className="text-[12px] mt-1 text-[#94A3B8]">Companies will appear here</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}