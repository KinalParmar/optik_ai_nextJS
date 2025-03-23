'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiTrendingUp, FiUsers, FiBriefcase } from 'react-icons/fi'; // Added new icons
import { getAllCompany, createNewCompany, updateCompany, deleteCompany, getAllNotificationsDetails } from '@/src/Services/Master-Admin/Home';
import { showSuccessToast, showErrorToast } from '@/Components/Toaster';
import DotLoader from '@/Components/DotLoader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';

// Define the Yup validation schema
const companySchema = Yup.object().shape({
  dbSlug: Yup.string().required('DB Slug is required'),
  name: Yup.string().required('Company name is required'),
  regNo: Yup.string().required('Registration number is required'),
  email: Yup.string()
    .email('Email must be in a valid format')
    .required('Email is required'),
  address: Yup.string().required('Address is required'),
  pincode: Yup.string().required('Pincode is required'),
  adminName: Yup.string().required('Admin name is required'),
  adminEmail: Yup.string()
    .email('Admin email must be in a valid format')
    .required('Admin email is required'),
  adminPassword: Yup.string().when('id', {
    is: (id) => !id,
    then: (schema) => schema.required('Password is required for new company'),
    otherwise: (schema) => schema.notRequired(),
  }),
  totalUsersAllowed: Yup.number()
    .required('Total users allowed is required')
    .min(1, 'Total users allowed must be at least 1'),
  paymentStatus: Yup.string().required('Payment status is required'),
  paymentAmount: Yup.number()
    .required('Payment amount is required')
    .min(0, 'Payment amount cannot be negative'),
  nextPaymentDate: Yup.string().required('Next payment date is required'),
  isAdmin: Yup.boolean(),
  isEnabled: Yup.boolean(),
});

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(companySchema),
    defaultValues: {
      id: '',
      dbSlug: '',
      name: '',
      regNo: '',
      email: '',
      address: '',
      pincode: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      isAdmin: true,
      permissions: {
        users: ['create', 'read', 'update', 'delete'],
        leads: ['create', 'read', 'update', 'delete'],
      },
      totalUsersAllowed: 10,
      isEnabled: true,
      paymentStatus: '',
      paymentAmount: 0,
      nextPaymentDate: '',
    },
  });

  const onSubmit = async (data) => {
    const companyData = {
      id: data?.id,
      name: data?.name,
      dbSlug: data?.dbSlug,
      regNo: data?.regNo,
      email: data?.email,
      address: data?.address,
      pincode: data?.pincode,
      adminName: data?.adminName,
      adminEmail: data?.adminEmail,
      adminPassword: data?.adminPassword,
      isAdmin: data?.isAdmin,
      permissions: data?.permissions,
      totalUsersAllowed: data?.totalUsersAllowed,
      isEnabled: data?.isEnabled,
      paymentStatus: data?.paymentStatus,
      paymentAmount: data?.paymentAmount,
      nextPaymentDate: data?.nextPaymentDate,
    };

    try {
      if (data?.id) {
        setLoading(true);
        const response = await updateCompany(data?.id, companyData);
        if (response?.success) {
          await getAllCompanyDetails();
          showSuccessToast(response?.message || 'Company updated successfully');
        } else {
          setLoading(false);
          showErrorToast(response || 'Failed to update company');
        }
      } else {
        setLoading(true);
        const response = await createNewCompany(companyData);
        if (response?.success) {
          await getAllCompanyDetails();
          showSuccessToast(response?.message || 'Company created successfully');
        } else {
          setLoading(false);
          showErrorToast(response?.message || 'Failed to create company');
        }
      }
      setLoading(false);
      reset();
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      showErrorToast(error || 'An error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    const getToken = localStorage?.getItem("token");
    if (!getToken) {
      router.push('/master-admin-login');
    }
  },[])

  const handleView = (company) => {
    setSelectedCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company) => {
    setValue('id', company?.id);
    setValue('dbSlug', company?.dbSlug);
    setValue('name', company?.name);
    setValue('regNo', company?.regNo);
    setValue('email', company?.email);
    setValue('address', company?.address);
    setValue('pincode', company?.pincode || '');
    setValue('adminName', company?.admin?.name);
    setValue('adminEmail', company?.admin?.email);
    setValue('adminPassword', '');
    setValue('isAdmin', company?.admin?.isAdmin);
    setValue('permissions', company?.admin?.permissions);
    setValue('totalUsersAllowed', company?.totalUsersAllowed);
    setValue('isEnabled', company?.isEnabled);
    setValue('paymentStatus', company?.paymentStatus);
    setValue('paymentAmount', company?.paymentAmount);
    setValue('nextPaymentDate', company?.nextPaymentDate);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setCompanyToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteCompany(companyToDelete);
      if (response?.success) {
        setLoading(false);
        await getAllCompanyDetails();
        showSuccessToast(response?.message || 'Company deleted successfully');
      } else {
        setLoading(false);
        showErrorToast(response?.message || 'Failed to delete company');
      }
      setShowDeleteModal(false);
      setCompanyToDelete(null);
    } catch (error) {
      setLoading(false);
      console.error('Error deleting company:', error);
      showErrorToast(error || 'An error occurred');
    }
  };

  useEffect(() => {
    getAllCompanyDetails();
    getAllNotifications();
  }, []);

  const getAllCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await getAllCompany();
      if (response) {
        setCompanies(response || []);
        showSuccessToast(response?.message || 'Companies fetched successfully');
      } else {
        setLoading(false);
        showErrorToast(response?.message || 'Failed to fetch companies');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching companies:', error);
      showErrorToast(error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAllNotifications = async () => {
    try {
      setLoading(true);
      const response = await getAllNotificationsDetails();
      if (response) {
        setNotifications(response?.notifications || []);
        showSuccessToast(response?.message || 'Notifications fetched successfully');
      } else {
        setLoading(false);
        showErrorToast(response?.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching notifications:', error);
      showErrorToast(error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <DotLoader />
      ) : (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { title: 'Total Leads', count: '245', icon: FiTrendingUp },
              { title: 'Users', count: '15', icon: FiUsers },
              { title: 'Companies', count: companies.length, icon: FiBriefcase },
            ].map((card, index) => {
              const Icon = card.icon; // Assign the icon component
              return (
                <div
                  key={index}
                  className="bg-[#DDDAFA] bg-opacity-50 rounded-lg p-6 text-center border border-[#DDDAFA] shadow-sm hover:shadow-md transition-shadow duration-300"
                  style={{ backdropFilter: 'blur(5px)' }}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-400" /> {/* Render the icon */}
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-800">{card.count}</p>
                </div>
              );
            })}
          </div>

          {/* Notification Area */}
          {notifications.length > 0 && (
            <div className="mb-6">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-2 rounded"
                >
                  {notification}
                </div>
              ))}
            </div>
          )}

          {/* Companies Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Companies</h3>
              <button
                onClick={() => setShowForm(true)}
                className="px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold flex items-center gap-1.5"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Company
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase text-gray-500 bg-[#DDDAFA]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      DB Slug
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Admin Name
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
                  {companies?.map((company) => (
                    <tr
                      key={company.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{company.dbSlug}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{company.name}</td>
                      <td className="px-4 py-3">{company.admin.name}</td>
                      <td className="px-4 py-3 text-gray-600">{company.admin.email}</td>
                      <td className="px-4 py-3 flex gap-3">
                        <button
                          onClick={() => handleView(company)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* View Company Modal */}
          {showViewModal && selectedCompany && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-extrabold text-[#334155]">Company Info</h4>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mb-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-extrabold text-[#334155]">
                        {selectedCompany.name}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">ID:</strong>{' '}
                        {selectedCompany.id || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">DB Slug:</strong>{' '}
                        {selectedCompany.dbSlug || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Register No:</strong>{' '}
                        {selectedCompany.regNo || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Email:</strong>{' '}
                        {selectedCompany.email || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Address:</strong>{' '}
                        {selectedCompany.address || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Pincode:</strong>{' '}
                        {selectedCompany.pincode || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Admin Name:</strong>{' '}
                        {selectedCompany.admin.name || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Admin Email:</strong>{' '}
                        {selectedCompany.admin.email || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Is Admin:</strong>{' '}
                        {selectedCompany.admin.isAdmin ? 'Yes' : 'No'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">
                          Total Users Allowed:
                        </strong>{' '}
                        {selectedCompany.totalUsersAllowed || '0'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Is Enabled:</strong>{' '}
                        {selectedCompany.isEnabled ? 'Yes' : 'No'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Payment Status:</strong>{' '}
                        {selectedCompany.paymentStatus || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Payment Amount:</strong>{' '}
                        ${selectedCompany.paymentAmount || '0'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">
                          Next Payment Date:
                        </strong>{' '}
                        {selectedCompany.nextPaymentDate || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Permissions:</strong>{' '}
                        Users: {selectedCompany.admin.permissions?.users?.join(', ') || '-'},
                        Leads: {selectedCompany.admin.permissions?.leads?.join(', ') || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Created At:</strong>{' '}
                        {selectedCompany.admin.createdAt || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Updated At:</strong>{' '}
                        {selectedCompany.admin.updatedAt || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New Company Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-4 top-0 bg-white z-10">
                  {errors.id?.value ? 'Edit Company' : 'Add New Company'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DB Slug</label>
                    <input
                      type="text"
                      {...register('dbSlug')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.dbSlug && (
                      <p className="text-red-500 text-xs mt-1">{errors.dbSlug.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Registration No
                    </label>
                    <input
                      type="text"
                      {...register('regNo')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.regNo && (
                      <p className="text-red-500 text-xs mt-1">{errors.regNo.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      {...register('email')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      {...register('address')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                      type="text"
                      {...register('pincode')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                    <input
                      type="text"
                      {...register('adminName')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.adminName && (
                      <p className="text-red-500 text-xs mt-1">{errors.adminName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                    <input
                      type="email"
                      {...register('adminEmail')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.adminEmail && (
                      <p className="text-red-500 text-xs mt-1">{errors.adminEmail.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      {...register('adminPassword')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.adminPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.adminPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Is Admin</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('isAdmin')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Users Allowed
                    </label>
                    <input
                      type="number"
                      {...register('totalUsersAllowed')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.totalUsersAllowed && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.totalUsersAllowed.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Is Enabled</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('isEnabled')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Status
                    </label>
                    <input
                      type="text"
                      {...register('paymentStatus')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.paymentStatus && (
                      <p className="text-red-500 text-xs mt-1">{errors.paymentStatus.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      {...register('paymentAmount')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.paymentAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.paymentAmount.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Next Payment Date
                    </label>
                    <input
                      type="date"
                      {...register('nextPaymentDate')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors.nextPaymentDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.nextPaymentDate.message}</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 bottom-0 bg-white pt-4 z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        reset();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:opacity-90 transition-all duration-200"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Confirm Deletion</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this company? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}