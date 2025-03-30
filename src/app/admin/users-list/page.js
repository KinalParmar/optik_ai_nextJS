'use client';
import { useEffect, useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { BiUpload } from 'react-icons/bi';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { showSuccessToast, showErrorToast } from '@/Components/Toaster';
import DotLoader from '@/Components/DotLoader';
import moment from 'moment';
import { FiCheck } from "react-icons/fi";
import { useRouter } from 'next/navigation';
import { FiX } from "react-icons/fi";
import { uploadLeadAdmin, updateLeadAdmin, getAllLeadAdmin, deleteLeadAdmin } from '@/src/Services/Admin/Lead';

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [selectedLeadForRoles, setSelectedLeadForRoles] = useState(null);
  const [rolesFormData, setRolesFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const router = useRouter();

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : {};
  const leadPermissions = user?.permissions?.leads || [];
  const canRead = leadPermissions?.includes('read');
  const canUpdate = leadPermissions?.includes('update');
  const canDelete = leadPermissions?.includes('delete');
  const canCreate = leadPermissions?.includes('create');

  const permissionOptions = ['create', 'read', 'update', 'delete'];

  const handleEditLead = (lead) => {
    setUpdateFormData({
      id: lead?._id,
      firstName: lead?.firstName || '',
      lastName: lead?.lastName || '',
      email: lead?.email || '',
      jobTitle: lead?.jobTitle || '',
      company_linkedin: lead?.company_linkedin || '',
      company_name: lead?.company_name || '',
      linkedinUrl: lead?.linkedinUrl || '',
      phoneNumber: lead?.phoneNumber || '',
      tenureInRole: lead?.tenureInRole || '',
      territory: lead?.territory || '',
      industry: lead?.industry || '',
      jobRoleDescription: lead?.jobRoleDescription || ''
    });
    setShowUpdateModal(true);
  };

  const handleRolesLead = (lead) => {
    setSelectedLeadForRoles(lead);
    setRolesFormData({
      id: lead?._id,
      permissions: lead?.permissions || { leads: [], newleads: [] }
    });
    setShowRolesModal(true);
  };

  const handleRolesFormChange = (e) => {
    const { name, checked } = e?.target || {};
    const [section, permission] = name?.split('-') || [];
    setRolesFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev?.permissions,
        [section]: checked
          ? [...(prev?.permissions?.[section] || []), permission]
          : prev?.permissions?.[section]?.filter((p) => p !== permission) ?? []
      }
    }));
  };

  const handleUpdateRoles = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedLeadData = {
        permissions: rolesFormData?.permissions
      };
      const response = await updateLeadAdmin(rolesFormData?.id, updatedLeadData);
      if (response?.data?.success) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead?._id === rolesFormData?.id
              ? {
                ...lead,
                permissions: rolesFormData?.permissions,
                updatedAt: new Date().toISOString()
              }
              : lead
          )
        );
        await allLeads();
        showSuccessToast('Lead roles updated successfully');
      } else {
        showErrorToast(response?.data?.message || 'Failed to update lead roles');
      }
      setShowRolesModal(false);
      setSelectedLeadForRoles(null);
      setRolesFormData(null);
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to update lead roles');
      console?.error('Error updating lead roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e?.target || {};
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedLeadData = {
        firstName: updateFormData?.firstName,
        lastName: updateFormData?.lastName,
        email: updateFormData?.email,
        jobTitle: updateFormData?.jobTitle,
        company_linkedin: updateFormData?.company_linkedin,
        company_name: updateFormData?.company_name,
        linkedinUrl: updateFormData?.linkedinUrl,
        phoneNumber: updateFormData?.phoneNumber,
        tenureInRole: updateFormData?.tenureInRole,
        territory: updateFormData?.territory,
        industry: updateFormData?.industry,
        jobRoleDescription: updateFormData?.jobRoleDescription
      };
      const response = await updateLeadAdmin(updateFormData?.id, updatedLeadData);
      if (response?.success) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead?._id === updateFormData?.id
              ? {
                ...lead,
                ...updatedLeadData,
                updatedAt: new Date().toISOString()
              }
              : lead
          )
        );
        showSuccessToast('Lead updated successfully');
        await allLeads();
      } else {
        showErrorToast(response?.data?.message || 'Failed to update lead');
      }
      setShowUpdateModal(false);
      setUpdateFormData(null);
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to update lead');
      console?.error('Error updating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      setLoading(true);
      const response = await deleteLeadAdmin(leadToDelete?._id);
      if (response?.success) {
        setLeads((prevLeads) => prevLeads.filter((lead) => lead?._id !== leadToDelete?._id));
        showSuccessToast('Lead deleted successfully');
        await allLeads();
        if (selectedLead?._id === leadToDelete?._id) setSelectedLead(null);
      } else {
        showErrorToast(response?.message || 'Failed to delete lead');
      }
      setShowDeleteModal(false);
      setLeadToDelete(null);
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to delete lead');
      console?.error('Error deleting lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setLeadToDelete(null);
  };

  const closeRolesModal = () => {
    setShowRolesModal(false);
    setSelectedLeadForRoles(null);
    setRolesFormData(null);
  };

  const filteredLeads = leads?.filter(
    (lead) =>
      `${lead?.firstName || ''} ${lead?.lastName || ''}`
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase()) ||
      lead?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  ) || [];

  useEffect(() => {
    if (canRead) {
      allLeads();
    }
  }, [canRead]);

  const allLeads = async () => {
    try {
      setLoading(true);
      const response = await getAllLeadAdmin();
      if (response?.success) {
        setLeads(response?.leads || []);
        showSuccessToast(response?.message || 'Leads loaded successfully');
      } else {
        showErrorToast(response?.message || 'Failed to fetch leads');
      }
    } catch (error) {
      // showErrorToast(error?.response?.data?.message || 'Failed to fetch leads');
      console?.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData) => {
    try {
      setLoading(true);
      const response = await uploadLeadAdmin(formData);
      if (response?.success) {
        await allLeads();
        showSuccessToast('Leads uploaded successfully');
      } else {
        showErrorToast(response?.data?.message || 'Failed to upload leads');
      }
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to upload leads');
      console?.error('Error uploading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      handleUpload(formData);
    }
  };

  useEffect(() => {
    const getToken = localStorage?.getItem("Admintoken");
    if (!getToken) {
      router.push('/admin-login');
    }
  }, []);

  const downloadDummyCSV = () => {
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Job Title',
      'Company',
      'Company LinkedIn',
      'LinkedIn',
      'Phone Number',
      'Tenure In Role',
      'Territory',
      'Industry',
      'Job Role Description'
    ];

    const transformLeadToCSVRow = (lead) => {
      const row = [
        lead?.firstName || '',
        lead?.lastName || '',
        lead?.email || '',
        lead?.jobTitle || '',
        lead?.company_name || '',
        lead?.company_linkedin || '',
        lead?.linkedinUrl || '',
        lead?.phoneNumber || '',
        lead?.tenureInRole || '',
        lead?.territory || '',
        lead?.industry || '',
        lead?.jobRoleDescription || ''
      ];
      return row.map(field => `"${String(field).replace(/"/g, '""')}"`);
    };

    const sampleData = leads?.length > 0 ? leads.map(transformLeadToCSVRow) : [];

    const csvRows = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {loading ? (
        <DotLoader />
      ) : (
        <section className="px-8 py-6 max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[20px] font-bold text-[#334155]">Lead Management</h1>
            <div className="flex items-center gap-2.5">
              {canRead && (
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] w-[200px] text-[13px] font-bold focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm(e?.target?.value || '')}
                  />
                </div>
              )}
              {canCreate && (
                <>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="upload-leads"
                  />
                  <label
                    htmlFor="upload-leads"
                    className="flex items-center gap-1.5 px-3 py-[7px] rounded-[4px] bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F4F4FF] hover:text-[#6366F1] hover:border-[#6366F1] transition-colors duration-200 text-[13px] font-bold cursor-pointer"
                  >
                    <BiUpload className="w-3.5 h-3.5" />
                    <span>{loading ? 'Uploading...' : 'Upload Leads'}</span>
                  </label>
                </>
              )}
              <button
                className="px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold"
                onClick={downloadDummyCSV}
              >
                Download Dummy CSV
              </button>
            </div>
          </div>

          {canRead ? (
            <div className="bg-white rounded-[4px] border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#DDDAFA]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Job Title</th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Company</th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">LinkedIn</th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Summary</th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Created At</th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads?.length > 0 ? (
                    filteredLeads?.map((lead) => (
                      <tr key={lead?._id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200">
                        <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">{lead?.firstName && lead?.lastName ? `${lead.firstName} ${lead.lastName}` : '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead?.email || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead?.jobTitle || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-[#6366F1]">
                          {lead?.company_linkedin ? (
                            <a href={lead?.company_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" aria-label={`Visit company website for ${lead?.company_name || 'Company'}`}>
                              {lead?.company_name || 'Company'} <HiOutlineExternalLink className="w-3 h-3" />
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#6366F1]">
                          {lead?.linkedinUrl ? (
                            <a href={lead?.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" aria-label={`Visit LinkedIn profile for ${lead?.firstName || ''} ${lead?.lastName || ''}`}>
                              LinkedIn <HiOutlineExternalLink className="w-3 h-3" />
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#64748B]">
                          {lead?.summary ? (
                            <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                              <FiCheck className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                              <FiX className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead?.createdAt ? moment(lead?.createdAt).format('DD-MM-YYYY') : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {canRead && (
                              <button onClick={() => setSelectedLead(lead)} className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200" title="View Details" aria-label="View lead details">
                                <FiEye className="w-4 h-4" />
                              </button>
                            )}
                            {canUpdate && (
                              <button onClick={() => handleEditLead(lead)} className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200" title="Edit Lead" aria-label="Edit lead">
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => handleDeleteLead(lead)} className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200" title="Delete Lead" aria-label="Delete lead">
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-[#64748B]">
                          <svg width="48" height="31" viewBox="0 0 64 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.33333 0C2.388 0 0 2.388 0 5.33333V34.6667C0 37.612 2.388 40 5.33333 40H58.6667C61.612 40 64 37.612 64 34.6667V5.33333C64 2.388 61.612 0 58.6667 0H5.33333ZM5.33333 5.33333H58.6667V34.6667H5.33333V5.33333ZM13.3333 10.6667V16H18.6667V10.6667H13.3333ZM24 10.6667V16H29.3333V10.6667H24ZM34.6667 10.6667V16H40V10.6667H34.6667ZM13.3333 21.3333V26.6667H18.6667V21.3333H13.3333ZM24 21.3333V26.6667H29.3333V21.3333H24ZM34.6667 21.3333V26.6667H40V21.3333H34.6667Z" fill="#E2E8F0" />
                          </svg>
                          <p className="mt-3 text-[13px] font-bold">No leads found</p>
                          <p className="text-[11px] mt-1 font-bold">Upload leads using CSV or add them manually</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-6 text-center">
              <p className="text-[#64748B] text-[13px] font-bold">You do not have permission to view leads.</p>
            </div>
          )}

          {/* View Lead Modal */}
          {canRead && selectedLead && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-extrabold text-[#334155]">Information</h4>
                    <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold">×</button>
                  </div>
                  <div className="mb-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-extrabold text-[#334155]">{selectedLead?.firstName && selectedLead?.lastName ? `${selectedLead.firstName} ${selectedLead.lastName}` : '-'}</h3>
                      <p className="text-[#64748B] font-bold">{selectedLead?.jobTitle || '-'}</p>
                    </div>
                    <div className="space-y-4">
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">First Name:</strong> {selectedLead?.firstName || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Last Name:</strong> {selectedLead?.lastName || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Email:</strong> {selectedLead?.email || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Job Title:</strong> {selectedLead?.jobTitle || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Company Name:</strong> {selectedLead?.company_name || '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">Company LinkedIn:</strong>{' '}
                        {selectedLead?.company_linkedin ? (
                          <a href={selectedLead?.company_linkedin} target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:text-[#5457E5]">{selectedLead?.company_linkedin}</a>
                        ) : '-'}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">LinkedIn:</strong>{' '}
                        {selectedLead?.linkedinUrl ? (
                          <a href={selectedLead?.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:text-[#5457E5]">{selectedLead?.linkedinUrl}</a>
                        ) : '-'}
                      </p>
                      {/* Add other fields if they exist in the response */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Update Lead Modal */}
          {canUpdate && showUpdateModal && updateFormData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-extrabold text-[#334155]">Update Lead</h4>
                  <button onClick={() => { setShowUpdateModal(false); setUpdateFormData(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold">×</button>
                </div>
                <form onSubmit={handleUpdateLead} className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-[#334155] font-extrabold">First Name:</label>
                    <input
                      type="text"
                      name="firstName"
                      value={updateFormData?.firstName || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Last Name:</label>
                    <input
                      type="text"
                      name="lastName"
                      value={updateFormData?.lastName || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={updateFormData?.email || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Job Title:</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={updateFormData?.jobTitle || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Company Name:</label>
                    <input
                      type="text"
                      name="company_name"
                      value={updateFormData?.company_name || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Company LinkedIn:</label>
                    <input
                      type="url"
                      name="company_linkedin"
                      value={updateFormData?.company_linkedin || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">LinkedIn:</label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={updateFormData?.linkedinUrl || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Phone Number:</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={updateFormData?.phoneNumber || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Tenure In Role:</label>
                    <input
                      type="text"
                      name="tenureInRole"
                      value={updateFormData?.tenureInRole || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Territory:</label>
                    <input
                      type="text"
                      name="territory"
                      value={updateFormData?.territory || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">Industry:</label>
                    <input
                      type="text"
                      name="industry"
                      value={updateFormData?.industry || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[#334155] font-extrabold">Job Role Description:</label>
                    <textarea
                      name="jobRoleDescription"
                      value={updateFormData?.jobRoleDescription || ''}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px] h-24 resize-none"
                    />
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowUpdateModal(false); setUpdateFormData(null); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all duration-200 text-sm font-bold"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Roles Modal */}
          {(canUpdate || canCreate) && showRolesModal && selectedLeadForRoles && rolesFormData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[400px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-extrabold text-[#334155]">Lead Roles</h4>
                  <button onClick={closeRolesModal} className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold">×</button>
                </div>
                <form onSubmit={handleUpdateRoles} className="space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-[#334155] mb-2">Leads Permissions</h5>
                    {permissionOptions?.map((permission) => (
                      <div key={`leads-${permission}`} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`leads-${permission}`}
                          name={`leads-${permission}`}
                          checked={rolesFormData?.permissions?.leads?.includes(permission) ?? false}
                          onChange={handleRolesFormChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor={`leads-${permission}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                          {permission?.charAt(0)?.toUpperCase() + permission?.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#334155] mb-2">New Leads Permissions</h5>
                    {permissionOptions?.map((permission) => (
                      <div key={`newleads-${permission}`} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`newleads-${permission}`}
                          name={`newleads-${permission}`}
                          checked={rolesFormData?.permissions?.newleads?.includes(permission) ?? false}
                          onChange={handleRolesFormChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor={`newleads-${permission}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                          {permission?.charAt(0)?.toUpperCase() + permission?.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeRolesModal}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all duration-200 text-sm font-bold"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Roles'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {canDelete && showDeleteModal && leadToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[400px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-extrabold text-[#334155]">Confirm Deletion</h4>
                  <button onClick={closeDeleteModal} className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold">×</button>
                </div>
                <p className="text-[#64748B] text-[13px] mb-6">
                  Are you sure you want to delete the lead <strong>{leadToDelete?.firstName || ''} {leadToDelete?.lastName || ''}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold">Cancel</button>
                  <button onClick={confirmDeleteLead} className="px-4 py-2 bg-[#EF4444] text-white rounded hover:bg-[#DC2626] transition-all duration-200 text-sm font-bold" disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}