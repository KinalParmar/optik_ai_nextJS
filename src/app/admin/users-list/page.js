"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/src/Interceptor/AdminInterceptor";
import Select from "react-select";
import { getUsers } from "@/src/Services/Admin/Users";

const dbSlug =
  typeof window !== "undefined" ? localStorage?.getItem("dbSlug") || "" : "";
import { FiSearch, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { BiUpload } from "react-icons/bi";
import { HiOutlineExternalLink } from "react-icons/hi";
import { showSuccessToast, showErrorToast } from "@/Components/Toaster";
import DotLoader from "@/Components/DotLoader";
import moment from "moment";
import { FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import {
  uploadLeadAdmin,
  updateLeadAdmin,
  getAllLeadAdmin,
  deleteLeadAdmin,
} from "@/src/Services/Admin/Lead";
import { generateSummaryLeadById } from "@/src/Services/Admin/NewLead";

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState("");
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
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const router = useRouter();

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : {};
  const leadPermissions = user?.permissions?.leads || [];
  const canRead = leadPermissions?.includes("read");
  const canUpdate = leadPermissions?.includes("update");
  const canDelete = leadPermissions?.includes("delete");
  const canCreate = leadPermissions?.includes("create");

  const permissionOptions = ["create", "read", "update", "delete"];

  const leadStages = [
    "Meeting booked",
    "Meeting completed",
    "POC in Progress",
    "Closed Won",
    "No show / Reschedule",
    "Add New",
    "Add Closed Lost",
  ];

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case "meeting booked":
        return "bg-blue-100 text-blue-800";
      case "meeting completed":
        return "bg-indigo-100 text-indigo-800";
      case "poc in progress":
        return "bg-purple-100 text-purple-800";
      case "closed won":
        return "bg-green-100 text-green-800";
      case "no show / reschedule":
        return "bg-orange-100 text-orange-800";
      case "add new":
        return "bg-gray-100 text-gray-800";
      case "add closed lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEditLead = (lead) => {
    // Set selected users based on lead's sharedTo
    if (lead.sharedTo && lead.sharedTo.length > 0) {
      const selectedUserOptions = users.filter((user) =>
        lead.sharedTo.includes(user.value)
      );
      setSelectedUsers(selectedUserOptions);
    } else {
      setSelectedUsers([]);
    }
    setUpdateFormData({
      stage: lead?.stage || "",
      id: lead?._id,
      firstName: lead?.firstName || "",
      lastName: lead?.lastName || "",
      email: Array.isArray(lead?.email)
        ? lead.email
        : [lead?.email].filter(Boolean),
      jobTitle: lead?.jobTitle || "",
      company_linkedin: lead?.company_linkedin || "",
      company_name: lead?.company_name || "",
      linkedinUrl: lead?.linkedinUrl || "",
      phoneNumber: Array.isArray(lead?.phoneNumber)
        ? lead.phoneNumber
        : [lead?.phoneNumber].filter(Boolean),
      tenureInRole: lead?.tenureInRole || "",
      territory: lead?.territory || "",
      industry: lead?.industry || "",
      jobRoleDescription: lead?.jobRoleDescription || "",
    });
    setShowUpdateModal(true);
  };

  const handleRolesLead = (lead) => {
    setSelectedLeadForRoles(lead);
    setRolesFormData({
      id: lead?._id,
      permissions: lead?.permissions || { leads: [], newleads: [] },
    });
    setShowRolesModal(true);
  };

  const handleRolesFormChange = (e) => {
    const { name, checked } = e?.target || {};
    const [section, permission] = name?.split("-") || [];
    setRolesFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev?.permissions,
        [section]: checked
          ? [...(prev?.permissions?.[section] || []), permission]
          : prev?.permissions?.[section]?.filter((p) => p !== permission) ?? [],
      },
    }));
  };

  const handleUpdateRoles = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedLeadData = {
        permissions: rolesFormData?.permissions,
      };
      const response = await updateLeadAdmin(
        rolesFormData?.id,
        updatedLeadData
      );
      if (response?.data?.success) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead?._id === rolesFormData?.id
              ? {
                  ...lead,
                  permissions: rolesFormData?.permissions,
                  updatedAt: new Date().toISOString(),
                }
              : lead
          )
        );
        await allLeads();
        showSuccessToast("Lead roles updated successfully");
      } else {
        showErrorToast(
          response?.data?.message || "Failed to update lead roles"
        );
      }
      setShowRolesModal(false);
      setSelectedLeadForRoles(null);
      setRolesFormData(null);
    } catch (error) {
      showErrorToast(
        error?.response?.data?.message || "Failed to update lead roles"
      );
      console?.error("Error updating lead roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e?.target || {};

    if (name === "email" || name === "phoneNumber") {
      // Split by comma and trim whitespace
      const arrayValue = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      setUpdateFormData((prev) => ({
        ...prev,
        [name]: arrayValue,
      }));
    } else {
      setUpdateFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
        jobRoleDescription: updateFormData?.jobRoleDescription,
        stage: updateFormData?.stage,
        sharedTo: selectedUsers.map((user) => user.value),
      };
      const response = await updateLeadAdmin(
        updateFormData?.id,
        updatedLeadData
      );
      if (response?.success) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead?._id === updateFormData?.id
              ? {
                  ...lead,
                  ...updatedLeadData,
                  updatedAt: new Date().toISOString(),
                }
              : lead
          )
        );
        showSuccessToast("Lead updated successfully");
        await allLeads();
      } else {
        showErrorToast(response?.data?.message || "Failed to update lead");
      }
      setShowUpdateModal(false);
      setUpdateFormData(null);
    } catch (error) {
      showErrorToast(error?.response?.data?.message || "Failed to update lead");
      console?.error("Error updating lead:", error);
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
        setLeads((prevLeads) =>
          prevLeads.filter((lead) => lead?._id !== leadToDelete?._id)
        );
        showSuccessToast("Lead deleted successfully");
        await allLeads();
        if (selectedLead?._id === leadToDelete?._id) setSelectedLead(null);
      } else {
        showErrorToast(response?.message || "Failed to delete lead");
      }
      setShowDeleteModal(false);
      setLeadToDelete(null);
    } catch (error) {
      showErrorToast(error?.response?.data?.message || "Failed to delete lead");
      console?.error("Error deleting lead:", error);
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

  const filteredLeads =
    leads?.filter(
      (lead) =>
        `${lead?.firstName || ""} ${lead?.lastName || ""}`
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        lead?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    ) || [];

  console.log(filteredLeads);

  useEffect(() => {
    if (canRead) {
      allLeads();
    }
  }, [canRead]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        const formattedUsers = data.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        showErrorToast("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  const allLeads = async () => {
    try {
      setLoading(true);
      const response = await getAllLeadAdmin();
      if (response?.success) {
        setLeads(response?.leads || []);
        showSuccessToast(response?.message || "Leads loaded successfully");
      } else {
        showErrorToast(response?.message || "Failed to fetch leads");
      }
    } catch (error) {
      // showErrorToast(error?.response?.data?.message || 'Failed to fetch leads');
      console?.error("Error fetching leads:", error);
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
        showSuccessToast("Leads uploaded successfully");
      } else {
        showErrorToast(response?.data?.message || "Failed to upload leads");
      }
    } catch (error) {
      showErrorToast(
        error?.response?.data?.message || "Failed to upload leads"
      );
      console?.error("Error uploading leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      handleUpload(formData);
    }
  };

  useEffect(() => {
    const getToken = localStorage?.getItem("Admintoken");
    if (!getToken) {
      router.push("/admin-login");
    }
  }, []);

  const downloadDummyCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Job Title",
      "Company",
      "Company LinkedIn",
      "LinkedIn",
      "Phone Number",
      "Tenure In Role",
      "Territory",
      "Industry",
      "Job Role Description",
    ];

    const transformLeadToCSVRow = (lead) => {
      const row = [
        lead?.firstName || "",
        lead?.lastName || "",
        lead?.email || "",
        lead?.jobTitle || "",
        lead?.company_name || "",
        lead?.company_linkedin || "",
        lead?.linkedinUrl || "",
        lead?.phoneNumber || "",
        lead?.tenureInRole || "",
        lead?.territory || "",
        lead?.industry || "",
        lead?.jobRoleDescription || "",
      ];
      return row.map((field) => `"${String(field).replace(/"/g, '""')}"`);
    };

    const sampleData =
      leads?.length > 0 ? leads.map(transformLeadToCSVRow) : [];

    const csvRows = [
      headers.join(","),
      ...sampleData.map((row) => row.join(",")),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads_template.csv");
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
            <h1 className="text-[20px] font-bold text-[#334155]">
              Lead Management
            </h1>
            <div className="flex items-center gap-2.5">
              {canRead && (
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] w-[200px] text-[13px] font-bold focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
                    value={searchTerm || ""}
                    onChange={(e) => setSearchTerm(e?.target?.value || "")}
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
                    <span>{loading ? "Uploading..." : "Upload Leads"}</span>
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
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Phone number
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      LinkedIn
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Lead Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads?.length > 0 ? (
                    filteredLeads?.map((lead) => {
                      console.log(lead, "leaddddddddddd");
                      return (
                        <tr
                          key={lead?._id}
                          className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">
                            {lead?.firstName && lead?.lastName
                              ? `${lead.firstName} ${lead.lastName}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#64748B]">
                            {Array.isArray(lead?.email)
                              ? lead.email[0]
                              : lead?.email || "-"}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#64748B]">
                            {Array.isArray(lead?.phoneNumber)
                              ? lead.phoneNumber[0]
                              : lead?.phoneNumber || "-"}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#64748B]">
                            {lead?.jobTitle || "-"}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#6366F1]">
                            {lead?.company_linkedin ? (
                              <a
                                href={lead?.company_linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                                aria-label={`Visit company website for ${
                                  lead?.company_name || "Company"
                                }`}
                              >
                                {lead?.company_name || "Company"}{" "}
                                <HiOutlineExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#6366F1]">
                            {lead?.linkedinUrl ? (
                              <a
                                href={lead?.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                                aria-label={`Visit LinkedIn profile for ${
                                  lead?.firstName || ""
                                } ${lead?.lastName || ""}`}
                              >
                                LinkedIn{" "}
                                <HiOutlineExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-[13px]">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStageColor(
                                  lead?.stage
                                )}`}
                              >
                                {lead?.stage || "No Stage"}
                              </span>
                              {lead?.summary ? (
                                <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                                  <FiCheck className="w-4 h-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                                  <FiX className="w-4 h-4 text-red-600" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#64748B]">
                            {lead?.createdAt
                              ? moment(lead?.createdAt).format("DD-MM-YYYY")
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {canRead && (
                                <button
                                  onClick={async () => {
                                    console.log("lead", lead);
                                    try {
                                      setLoading(true);
                                      const response = await axiosInstance.get(
                                        `/tenant/leads/${lead._id}`,
                                        {
                                          headers: {
                                            "x-tenant": dbSlug,
                                            "Content-Type": "application/json",
                                          },
                                        }
                                      );
                                      if (response?.data?.success) {
                                        console.log(response.data, "response");
                                        setSelectedLead(response.data.lead);
                                      } else {
                                        showErrorToast(
                                          response?.data?.message ||
                                            "Failed to fetch lead details"
                                        );
                                      }
                                    } catch (error) {
                                      showErrorToast(
                                        error?.response?.data?.message ||
                                          "Failed to fetch lead details"
                                      );
                                      console.error(
                                        "Error fetching lead details:",
                                        error
                                      );
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                  className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                                  title="View Details"
                                  aria-label="View lead details"
                                >
                                  <FiEye className="w-4 h-4" />
                                </button>
                              )}
                              {canUpdate && (
                                <button
                                  onClick={() => handleEditLead(lead)}
                                  className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                                  title="Edit Lead"
                                  aria-label="Edit lead"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteLead(lead)}
                                  className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                                  title="Delete Lead"
                                  aria-label="Delete lead"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-[#64748B]">
                          <svg
                            width="48"
                            height="31"
                            viewBox="0 0 64 41"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.33333 0C2.388 0 0 2.388 0 5.33333V34.6667C0 37.612 2.388 40 5.33333 40H58.6667C61.612 40 64 37.612 64 34.6667V5.33333C64 2.388 61.612 0 58.6667 0H5.33333ZM5.33333 5.33333H58.6667V34.6667H5.33333V5.33333ZM13.3333 10.6667V16H18.6667V10.6667H13.3333ZM24 10.6667V16H29.3333V10.6667H24ZM34.6667 10.6667V16H40V10.6667H34.6667ZM13.3333 21.3333V26.6667H18.6667V21.3333H13.3333ZM24 21.3333V26.6667H29.3333V21.3333H24ZM34.6667 21.3333V26.6667H40V21.3333H34.6667Z"
                              fill="#E2E8F0"
                            />
                          </svg>
                          <p className="mt-3 text-[13px] font-bold">
                            No leads found
                          </p>
                          <p className="text-[11px] mt-1 font-bold">
                            Upload leads using CSV or add them manually
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
                You do not have permission to view leads.
              </p>
            </div>
          )}

          {/* View Lead Modal */}
          {canRead && selectedLead && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-[700px] max-h-[85vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900">
                    Lead Information
                  </h4>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="bg-indigo-100 rounded-full p-3">
                        <svg
                          className="w-6 h-6 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {selectedLead?.firstName && selectedLead?.lastName
                            ? `${selectedLead.firstName} ${selectedLead.lastName}`
                            : "-"}
                        </h3>
                        <p className="text-lg text-indigo-600 font-medium">
                          {selectedLead?.jobTitle || "-"}
                        </p>
                      </div>
                    </div>
                    {selectedLead?.stage && (
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium uppercase ${getStageColor(
                            selectedLead.stage
                          )}`}
                        >
                          {selectedLead.stage}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Contact Information
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Email
                          </p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {selectedLead?.email?.map((email, index) => (
                              <li key={index} className="text-sm text-gray-900">
                                {email}
                              </li>
                            )) || <li className="text-sm text-gray-900">-</li>}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Phone Number
                          </p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {selectedLead?.phoneNumber?.map((phone, index) => (
                              <li key={index} className="text-sm text-gray-900">
                                {phone}
                              </li>
                            )) || <li className="text-sm text-gray-900">-</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Company Details
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Company Name
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedLead?.company_name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Industry
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedLead?.industry || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Territory
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedLead?.territory || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Tenure in Role
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedLead?.tenureInRole || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Professional Details
                      </h5>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Job Role Description
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedLead?.jobRoleDescription || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            LinkedIn Profiles
                          </p>
                          <div className="mt-1 space-y-2">
                            <a
                              href={selectedLead?.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                              <span className="group-hover:underline">
                                Personal Profile
                              </span>
                            </a>
                            <a
                              href={selectedLead?.company_linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                              <span className="group-hover:underline">
                                Company Profile
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Summary
                      </h5>
                      <div
                        className="text-sm text-gray-900 bg-white rounded p-3 border border-gray-200"
                        dangerouslySetInnerHTML={{
                          __html:
                            selectedLead?.summary
                              ?.replace(
                                /<([^>]+)>/g,
                                '<h4 class="font-bold text-lg mt-4 mb-2">$1</h4>'
                              )
                              .replace(
                                /\[([^\]]+)\]:/g,
                                '<strong class="text-indigo-600">$1:</strong>'
                              )
                              .replace(
                                /(https?:\/\/[^\s]+)/g,
                                '<a href="$1" target="_blank" class="text-blue-600 hover:underline">$1</a>'
                              )
                              .replace(/\n/g, "<br>") || "-",
                        }}
                      />
                    </div>

                    {/* Metadata */}
                    <div className="bg-gray-50/50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Metadata
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-gray-500">
                            Created At
                          </p>
                          <p className="text-gray-900 mt-1">
                            {new Date(selectedLead?.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-500">
                            Last Updated
                          </p>
                          <p className="text-gray-900 mt-1">
                            {new Date(selectedLead?.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <button
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const res = await generateSummaryLeadById(
                            selectedLead?._id
                          );
                          if (res?.success) {
                            setLoading(false);
                            showSuccessToast(res?.message);
                            setSelectedLead(null);
                            router?.push("/admin/users-list");
                          } else {
                            setLoading(false);
                          }
                        } catch (error) {
                          setLoading(false);
                          console?.error(error);
                        }
                      }}
                      className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Regenerate Summary</span>
                        </>
                      )}
                    </button>
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
                  <h4 className="text-xl font-extrabold text-[#334155]">
                    Update Lead
                  </h4>
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateFormData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <form
                  onSubmit={handleUpdateLead}
                  className="grid grid-cols-3 gap-6"
                >
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      First Name:
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={updateFormData?.firstName || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Last Name:
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={updateFormData?.lastName || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Email:
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={
                        Array.isArray(updateFormData?.email)
                          ? updateFormData.email.join(", ")
                          : updateFormData?.email || ""
                      }
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Job Title:
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={updateFormData?.jobTitle || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Company Name:
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={updateFormData?.company_name || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Company LinkedIn:
                    </label>
                    <input
                      type="url"
                      name="company_linkedin"
                      value={updateFormData?.company_linkedin || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      LinkedIn:
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={updateFormData?.linkedinUrl || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Phone Number:
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={
                        Array.isArray(updateFormData?.phoneNumber)
                          ? updateFormData.phoneNumber.join(", ")
                          : updateFormData?.phoneNumber || ""
                      }
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Tenure In Role:
                    </label>
                    <input
                      type="text"
                      name="tenureInRole"
                      value={updateFormData?.tenureInRole || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Territory:
                    </label>
                    <input
                      type="text"
                      name="territory"
                      value={updateFormData?.territory || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Industry:
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={updateFormData?.industry || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Share with Users:
                    </label>
                    <Select
                      isMulti
                      options={users}
                      value={selectedUsers}
                      onChange={setSelectedUsers}
                      className="text-[13px]"
                      placeholder="Select users to share with"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Lead Status:
                    </label>
                    <select
                      name="stage"
                      value={updateFormData?.stage || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px] uppercase"
                      required
                    >
                      <option value="">Select Lead Status</option>
                      {leadStages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="text-[#334155] font-extrabold">
                      Job Role Description:
                    </label>
                    <textarea
                      name="jobRoleDescription"
                      value={updateFormData?.jobRoleDescription || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px] h-24 resize-none"
                    />
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateModal(false);
                        setUpdateFormData(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all duration-200 text-sm font-bold"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Roles Modal */}
          {(canUpdate || canCreate) &&
            showRolesModal &&
            selectedLeadForRoles &&
            rolesFormData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-[400px] p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-extrabold text-[#334155]">
                      Lead Roles
                    </h4>
                    <button
                      onClick={closeRolesModal}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleUpdateRoles} className="space-y-4">
                    <div>
                      <h5 className="text-sm font-bold text-[#334155] mb-2">
                        Leads Permissions
                      </h5>
                      {permissionOptions?.map((permission) => (
                        <div
                          key={`leads-${permission}`}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            id={`leads-${permission}`}
                            name={`leads-${permission}`}
                            checked={
                              rolesFormData?.permissions?.leads?.includes(
                                permission
                              ) ?? false
                            }
                            onChange={handleRolesFormChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`leads-${permission}`}
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            {permission?.charAt(0)?.toUpperCase() +
                              permission?.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#334155] mb-2">
                        New Leads Permissions
                      </h5>
                      {permissionOptions?.map((permission) => (
                        <div
                          key={`newleads-${permission}`}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            id={`newleads-${permission}`}
                            name={`newleads-${permission}`}
                            checked={
                              rolesFormData?.permissions?.newleads?.includes(
                                permission
                              ) ?? false
                            }
                            onChange={handleRolesFormChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`newleads-${permission}`}
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            {permission?.charAt(0)?.toUpperCase() +
                              permission?.slice(1)}
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
                        {loading ? "Saving..." : "Save Roles"}
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
                  <h4 className="text-lg font-extrabold text-[#334155]">
                    Confirm Deletion
                  </h4>
                  <button
                    onClick={closeDeleteModal}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[#64748B] text-[13px] mb-6">
                  Are you sure you want to delete the lead{" "}
                  <strong>
                    {leadToDelete?.firstName || ""}{" "}
                    {leadToDelete?.lastName || ""}
                  </strong>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteLead}
                    className="px-4 py-2 bg-[#EF4444] text-white rounded hover:bg-[#DC2626] transition-all duration-200 text-sm font-bold"
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
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
