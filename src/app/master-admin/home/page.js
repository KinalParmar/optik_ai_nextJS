'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { getAllCompany, createNewCompany, updateCompany, deleteCompany, dashStats, getAllNotificationsDetails } from '@/src/Services/Master-Admin/Home';
import { ImOffice } from "react-icons/im";
import { MdLeaderboard } from "react-icons/md";
import { showSuccessToast, showErrorToast } from '@/Components/Toaster';
import DotLoader from '@/Components/DotLoader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';
import 'react-phone-number-input/style.css';

// Define the Yup validation schema
const companySchema = Yup.object().shape({
  dbSlug: Yup.string().required('DB Slug is required'),
  name: Yup.string().required('Company name is required'),
  regNo: Yup.string().required('Registration number is required'),
  email: Yup.string()
    .email('Email must be in a valid format')
    .required('Email is required'),
  address: Yup.string().required('Address is required'),
  pincode: Yup.string()
    .required('Postal code is required')
    .matches(/^[0-9]{6}$/, 'Postal code must be exactly 6 digits'),
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
    .typeError('Total users allowed must be a number')
    .required('Total users allowed is required')
    .min(0, 'Total users allowed cannot be negative'),
  paymentStatus: Yup.string().required('Payment status is required'),
  paymentAmount: Yup.number()
    .typeError('Payment amount must be a number')
    .required('Payment amount is required')
    .min(0, 'Payment amount cannot be negative'),
  nextPaymentDate: Yup.string().required('Next payment date is required'),
  isAdmin: Yup.boolean(),
  isEnabled: Yup.boolean(),
  adminCountryCode: Yup.string().required('Country code is required'),
  adminPhoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{7,15}$/, 'Phone number must be between 7 and 15 digits'),
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
  const [stats, setStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
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
      totalUsersAllowed: '',
      isEnabled: true,
      paymentStatus: '',
      paymentAmount: '',
      nextPaymentDate: '',
      adminCountryCode: '',
      adminPhoneNumber: '',
    },
  });

  const id = watch('id');
  const adminCountryCode = watch('adminCountryCode');

  const countryList = getCountries();
  if (!countryList || countryList.length === 0) {
    console.error('Error: No countries found from getCountries()');
  }

  const countries = countryList
    .map((country) => ({
      code: `+${getCountryCallingCode(country)}`,
      countryCode: country,
      name: en[country] || country,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalLeads = stats.reduce((sum, stat) => sum + (stat.leadsCount || 0), 0);
  const totalUsers = stats.reduce((sum, stat) => sum + (stat.userCount || 0), 0);

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
      adminCountryCode: data?.adminCountryCode,
      adminPhoneNumber: data?.adminPhoneNumber,
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
        }
      } else {
        setLoading(true);
        const response = await createNewCompany(companyData);
        if (response?.success) {
          await getAllCompanyDetails();
          showSuccessToast(response?.message || 'Company created successfully');
        } else {
          setLoading(false);
        }
      }
      setLoading(false);
      reset();
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const getToken = localStorage?.getItem("token");
    if (!getToken) {
      router?.push('/master-admin-login');
    }
  }, []);

  const handleView = (company) => {
    setSelectedCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company) => {
    setValue('id', company?._id || '');
    setValue('dbSlug', company?.dbSlug || '');
    setValue('name', company?.name || '');
    setValue('regNo', company?.regNo || '');
    setValue('email', company?.email || '');
    setValue('address', company?.address || '');
    setValue('pincode', company?.pincode || '');
    setValue('adminName', company?.admin?.name || '');
    setValue('adminEmail', company?.admin?.email || '');
    setValue('adminPassword', ''); // Reset password field for edit
    setValue('isAdmin', company?.admin?.isAdmin ?? true);
    setValue('permissions', company?.admin?.permissions || {
      users: ['create', 'read', 'update', 'delete'],
      leads: ['create', 'read', 'update', 'delete'],
    });
    setValue('totalUsersAllowed', company?.totalUsersAllowed || '');
    setValue('isEnabled', company?.isEnabled ?? true);
    setValue('paymentStatus', company?.paymentStatus || '');
    setValue('paymentAmount', company?.paymentAmount || '');
    setValue('nextPaymentDate', company?.nextPaymentDate
      ? new Date(company?.nextPaymentDate).toISOString().split('T')[0]
      : '');
    setValue('adminCountryCode', company?.admin?.countryCode || '');
    setValue('adminPhoneNumber', company?.admin?.phoneNumber || '');
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
      showErrorToast(error?.message || 'An error occurred');
    }
  };

  useEffect(() => {
    getAllCompanyDetails();
    getAllNotifications();
    getAllDashStats();
  }, []);

  const getAllCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await getAllCompany();
      if (response) {
        const uniqueCompanies = Array.isArray(response) ? response.filter(
          (company, index, self) => company?._id && self.findIndex(c => c._id === company._id) === index
        ) : [];
        setCompanies(uniqueCompanies);
        setLoading(false);
        localStorage.setItem('companies', JSON.stringify(uniqueCompanies));
        showSuccessToast(response?.message || 'Companies fetched successfully');
      } else {
        setLoading(false);
        showErrorToast(response?.message || 'Failed to fetch companies');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching companies:', error);
      showErrorToast(error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAllDashStats = async () => {
    try {
      setLoading(true);
      const response = await dashStats();
      if (response) {
        setStats(response || []);
        showSuccessToast(response?.message || 'Stats fetched successfully');
      } else {
        setLoading(false);
        showErrorToast(response?.message || 'Failed to fetch stats');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching stats:', error);
      showErrorToast(error?.message || 'An error occurred');
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
      } else {
        setLoading(false);
        showErrorToast(response?.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching notifications:', error);
      showErrorToast(error?.message || 'An error occurred');
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
              { title: 'Total Leads', count: totalLeads, icon: MdLeaderboard },
              { title: 'Users', count: totalUsers, icon: FiUsers },
              { title: 'Companies', count: companies?.length, icon: ImOffice },
            ].map((card) => {
              const Icon = card?.icon;
              return (
                <div
                  key={card.title}
                  className="bg-[#DDDAFA] bg-opacity-50 rounded-lg p-6 text-center border border-[#DDDAFA] shadow-sm hover:shadow-md transition-shadow duration-300"
                  style={{ backdropFilter: 'blur(5px)' }}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {card?.title}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-800">{card?.count}</p>
                </div>
              );
            })}
          </div>

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
                  {companies?.length > 0 ? (
                    companies.map((company) => (
                      <tr
                        key={company?._id || Math.random().toString(36).substr(2, 9)}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{company?.dbSlug || '-'}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{company?.name || '-'}</td>
                        <td className="px-4 py-3">{company?.admin?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{company?.admin?.email || '-'}</td>
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
                            onClick={() => handleDelete(company?._id)}
                            className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                        No companies found
                      </td>
                    </tr>
                  )}
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
                    <h4 className="text-xl font-extrabold text-[#334155]">Information</h4>
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
                        {selectedCompany?.name || '-'}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">DB Slug:</strong>{' '}
                        {selectedCompany?.dbSlug || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Registration No:</strong>{' '}
                        {selectedCompany?.regNo || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Email:</strong>{' '}
                        {selectedCompany?.email || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Address:</strong>{' '}
                        {selectedCompany?.address || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Postal Code:</strong>{' '}
                        {selectedCompany?.pincode || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Admin Name:</strong>{' '}
                        {selectedCompany?.admin?.name || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Admin Email:</strong>{' '}
                        {selectedCompany?.admin?.email || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Phone Number:</strong>{' '}
                        {selectedCompany?.admin?.countryCode && selectedCompany?.admin?.phoneNumber
                          ? `${selectedCompany.admin.countryCode} ${selectedCompany.admin.phoneNumber}`
                          : '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Permissions:</strong>{' '}
                        Users: {selectedCompany?.admin?.permissions?.users?.join(', ') || '-'}, 
                        Leads: {selectedCompany?.admin?.permissions?.leads?.join(', ') || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Total Users Allowed:</strong>{' '}
                        {selectedCompany?.totalUsersAllowed || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Enabled:</strong>{' '}
                        {selectedCompany?.isEnabled !== undefined ? selectedCompany.isEnabled.toString() : '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Payment Status:</strong>{' '}
                        {selectedCompany?.paymentStatus || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Payment Amount:</strong>{' '}
                        {selectedCompany?.paymentAmount || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Next Payment Date:</strong>{' '}
                        {selectedCompany?.nextPaymentDate
                          ? new Date(selectedCompany.nextPaymentDate).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New/Edit Company Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-full max-w-4xl shadow-lg">
                <h3 className="text-xl font-medium text-gray-800 mb-6">
                  {id ? 'Edit Company' : 'Add New Company'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      DB Slug
                    </label>
                    <input
                      type="text"
                      {...register('dbSlug')}
                      disabled={!!id} // Disable if editing
                      className={`mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 text-gray-800 p-2 
                        focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50
                        ${id ? 'cursor-not-allowed bg-gray-200 text-gray-500' : ''}`}
                    />
                    {errors?.dbSlug && (
                      <p className="text-red-500 text-xs mt-1">{errors?.dbSlug?.message}</p>
                    )}
                  </div>
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
                    <label className="block text-sm font-medium text-gray-700">Registration No</label>
                    <input
                      type="text"
                      {...register('regNo')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.regNo && (
                      <p className="text-red-500 text-xs mt-1">{errors?.regNo?.message}</p>
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
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      {...register('address')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.address && (
                      <p className="text-red-500 text-xs mt-1">{errors?.address?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      {...register('pincode')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.pincode && (
                      <p className="text-red-500 text-xs mt-1">{errors?.pincode?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                    <input
                      type="text"
                      {...register('adminName')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.adminName && (
                      <p className="text-red-500 text-xs mt-1">{errors?.adminName?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                    <input
                      type="email"
                      {...register('adminEmail')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.adminEmail && (
                      <p className="text-red-500 text-xs mt-1">{errors?.adminEmail?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                    <input
                      type="password"
                      {...register('adminPassword')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.adminPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors?.adminPassword?.message}</p>
                    )}
                  </div>
                  {/* Admin Phone Number with Country Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Phone Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24">
                        <Select
                          value={adminCountryCode || ''}
                        >
                          <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50">
                            <SelectValue placeholder="+XX">
                              {adminCountryCode ? (
                                <div className="flex items-center gap-2">
                                  <span className="react-phone-number-input__icon">
                                    <img
                                      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${
                                        countries.find((c) => c.code === adminCountryCode)?.countryCode
                                      }.svg`}
                                      alt="flag"
                                      className="w-5 h-3"
                                    />
                                  </span>
                                  <span>{adminCountryCode}</span>
                                </div>
                              ) : (
                                '+XX'
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <Command>
                              <CommandInput
                                placeholder="Search country..."
                                value={searchQuery}
                                onValueChange={(value) => setSearchQuery(value || '')}
                                className="h-9"
                              />
                              <CommandList className="max-h-60 overflow-y-auto">
                                <CommandEmpty>No country found.</CommandEmpty>
                                {countries.map((country) => (
                                  <CommandItem
                                    key={country.countryCode}
                                    value={`${country.name} ${country.code}`}
                                    onSelect={() => {
                                      setValue('adminCountryCode', country.code);
                                      setSearchQuery('');
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="react-phone-number-input__icon">
                                        <img
                                          src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country.countryCode}.svg`}
                                          alt={`${country.countryCode} flag`}
                                          className="w-5 h-3"
                                        />
                                      </span>
                                      <span>{country.name}</span>
                                      <span>({country.code})</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                          </SelectContent>
                        </Select>
                        {errors?.adminCountryCode && (
                          <p className="text-red-500 text-xs mt-1">{errors?.adminCountryCode?.message}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register('adminPhoneNumber')}
                          className="h-9 text-sm block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                          placeholder="Enter a phone number"
                        />
                        {errors?.adminPhoneNumber && (
                          <p className="text-red-500 text-xs mt-1">{errors?.adminPhoneNumber?.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Users Allowed</label>
                    <input
                      type="number"
                      {...register('totalUsersAllowed')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.totalUsersAllowed && (
                      <p className="text-red-500 text-xs mt-1">{errors?.totalUsersAllowed?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Enabled</label>
                    <label className="relative inline-flex items-center cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        {...register('isEnabled')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <input
                      type="text"
                      {...register('paymentStatus')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.paymentStatus && (
                      <p className="text-red-500 text-xs mt-1">{errors?.paymentStatus?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
                    <input
                      type="number"
                      {...register('paymentAmount')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.paymentAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors?.paymentAmount?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Next Payment Date</label>
                    <input
                      type="date"
                      {...register('nextPaymentDate')}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.nextPaymentDate && (
                      <p className="text-red-500 text-xs mt-1">{errors?.nextPaymentDate?.message}</p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="col-span-3 flex justify-end gap-4 mt-6">
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