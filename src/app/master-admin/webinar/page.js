"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/src/Interceptor/Interceptor";
import { FiSearch, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { showSuccessToast, showErrorToast } from "@/Components/Toaster";
import DotLoader from "@/Components/DotLoader";
import moment from "moment";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

// Yup validation schema
const webinarSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  date: Yup.string().required("Date is required"),
  durationTimestamp: Yup.string()
    .required("Duration is required")
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      "Duration must be in HH:MM:SS format"
    ),
  description: Yup.string().optional(),
  speakers: Yup.string()
    .required("Speakers is required")
    .min(3, "Speakers must be at least 3 characters"),
  imageUrl: Yup.string().url("Must be a valid URL").optional(),
});

// Mock API services
const getAllWebinars = async () => {
  try {
    const response = await axiosInstance.get("/webinar");
    return response.data;
  } catch (error) {
    showErrorToast(error?.response?.data?.message || "An error occurred");
    throw error;
  }
};

const createWebinar = async (data) => {
  try {
    const response = await axiosInstance.post("/webinar", data);
    return response.data;
  } catch (error) {
    showErrorToast(error?.response?.data?.message || "An error occurred");
    throw error;
  }
};

const updateWebinar = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/webinar/${id}`, data);
    return response.data;
  } catch (error) {
    showErrorToast(error?.response?.data?.message || "An error occurred");
    throw error;
  }
};

const deleteWebinar = async (id) => {
  try {
    const response = await axiosInstance.delete(`/webinar/${id}`);
    return response.data;
  } catch (error) {
    showErrorToast(error?.response?.data?.message || "An error occurred");
    throw error;
  }
};

const getWebinarById = async (id) => {
  try {
    const response = await axiosInstance.get(`/webinar/${id}`);
    return response.data;
  } catch (error) {
    showErrorToast(error?.response?.data?.message || "An error occurred");
    throw error;
  }
};

export default function Webinar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    date: "",
    durationTimestamp: "",
    description: "",
    speakers: "",
    imageUrl: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [webinarToDelete, setWebinarToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webinars, setWebinars] = useState([]);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const filteredWebinars =
    webinars?.filter(
      (webinar) =>
        webinar?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        webinar?.speakers?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    ) || [];

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const response = await getAllWebinars();
      if (response) {
        setWebinars(response || []);
        showSuccessToast(response?.message || "Webinars loaded successfully");
      } else {
        showErrorToast(response?.message || "Failed to fetch webinars");
      }
    } catch (error) {
      console.error("Error fetching webinars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  useEffect(() => {
    const getToken = localStorage?.getItem("token");
    if (!getToken) {
      router.push("/master-admin-login");
    }
  }, []);

  const validateForm = async (data, isUpdate = false) => {
    try {
      await webinarSchema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleEditWebinar = (webinar) => {
    setUpdateFormData({
      _id: webinar._id,
      title: webinar.title,
      date: webinar.date,
      durationTimestamp: webinar.durationTimestamp,
      description: webinar.description,
      speakers: webinar.speakers,
      imageUrl: webinar.imageUrl,
    });
    setErrors({});
    setShowUpdateModal(true);
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e?.target || {};
    setUpdateFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e?.target || {};
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddWebinar = async (e) => {
    e.preventDefault();
    const isValid = await validateForm(addFormData);
    if (!isValid) return;

    try {
      setLoading(true);
      const newWebinarData = {
        title: addFormData.title,
        date: addFormData.date,
        durationTimestamp: addFormData.durationTimestamp,
        description: addFormData.description,
        speakers: addFormData.speakers,
        imageUrl: addFormData.imageUrl,
      };
      const response = await createWebinar(newWebinarData);
      if (response) {
        fetchWebinars();
        showSuccessToast("Webinar created successfully");
        setShowAddModal(false);
        setAddFormData({
          title: "",
          date: "",
          durationTimestamp: "",
          description: "",
          speakers: "",
          imageUrl: "",
        });
        setErrors({});
      } else {
        showErrorToast(response?.data?.message || "Failed to create webinar");
      }
    } catch (error) {
      console.error("Error creating webinar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebinar = async (e) => {
    e.preventDefault();
    if (!updateFormData) return;

    const isValid = await validateForm(updateFormData, true);
    if (!isValid) return;

    try {
      setLoading(true);
      const updatedWebinarData = {
        title: updateFormData.title,
        date: updateFormData.date,
        durationTimestamp: updateFormData.durationTimestamp,
        description: updateFormData.description,
        speakers: updateFormData.speakers,
        imageUrl: updateFormData.imageUrl,
      };
      const response = await updateWebinar(
        updateFormData._id,
        updatedWebinarData
      );
      if (response) {
        setWebinars((prevWebinars) =>
          prevWebinars.map((webinar) =>
            webinar._id === updateFormData._id
              ? {
                  ...webinar,
                  ...updatedWebinarData,
                  updatedAt: new Date().toISOString(),
                }
              : webinar
          )
        );
        showSuccessToast("Webinar updated successfully");
        fetchWebinars();
        setShowUpdateModal(false);
        setUpdateFormData(null);
        setErrors({});
      } else {
        showErrorToast(response?.data?.message || "Failed to update webinar");
      }
    } catch (error) {
      console.error("Error updating webinar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebinar = (webinar) => {
    setWebinarToDelete(webinar);
    setShowDeleteModal(true);
  };

  const confirmDeleteWebinar = async () => {
    if (!webinarToDelete) return;
    try {
      setLoading(true);
      const response = await deleteWebinar(webinarToDelete._id);
      if (response?.success) {
        setWebinars((prevWebinars) =>
          prevWebinars.filter((webinar) => webinar._id !== webinarToDelete._id)
        );
        showSuccessToast("Webinar deleted successfully");
        await fetchWebinars();
        if (selectedWebinar?._id === webinarToDelete._id)
          setSelectedWebinar(null);
      } else {
        showErrorToast(response?.message || "Failed to delete webinar");
      }
      setShowDeleteModal(false);
      setWebinarToDelete(null);
    } catch (error) {
      console.error("Error deleting webinar:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setWebinarToDelete(null);
  };

  return (
    <div>
      {loading ? (
        <DotLoader />
      ) : (
        <section className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-[#334155]">
              Webinar Management
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] text-[13px] font-bold focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
                  value={searchTerm || ""}
                  onChange={(e) => setSearchTerm(e?.target?.value || "")}
                />
              </div>
              <button
                className="w-full sm:w-auto px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold"
                onClick={() => setShowAddModal(true)}
                disabled={loading}
              >
                Add Webinar
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E2E8F0] overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#DDDAFA]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Speakers
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
                {filteredWebinars?.length > 0 ? (
                  filteredWebinars?.map((webinar) => (
                    <tr
                      key={webinar?._id}
                      className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">
                        {webinar?.title || "-"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {webinar?.date
                          ? moment(webinar.date).format("DD-MM-YYYY HH:mm")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {webinar?.durationTimestamp || "-"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {webinar?.speakers || "-"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {webinar?.createdAt
                          ? moment(webinar.createdAt).format("DD-MM-YYYY")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const response = await getWebinarById(
                                  webinar._id
                                );
                                if (response) {
                                  setSelectedWebinar(response);
                                } else {
                                  showErrorToast(
                                    response?.message ||
                                      "Failed to fetch webinar details"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Error fetching webinar details:",
                                  error
                                );
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="View Details"
                            aria-label="View webinar details"
                            disabled={loading}
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditWebinar(webinar)}
                            className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="Edit Webinar"
                            aria-label="Edit webinar"
                            disabled={loading}
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWebinar(webinar)}
                            className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="Delete Webinar"
                            aria-label="Delete webinar"
                            disabled={loading}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
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
                          No webinars found
                        </p>
                        <p className="text-[11px] mt-1 font-bold">
                          Add webinars using the Add Webinar button
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View Webinar Modal */}
          {selectedWebinar && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-[90vw] sm:max-w-[700px] shadow-xl">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                    Webinar Information
                  </h4>
                  <button
                    onClick={() => setSelectedWebinar(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                    disabled={loading}
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
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {selectedWebinar?.title || "-"}
                        </h3>
                        <p className="text-base sm:text-lg text-indigo-600 font-medium">
                          {selectedWebinar?.speakers || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Webinar Details
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Date
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedWebinar?.date
                              ? new Date(selectedWebinar.date).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Duration
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedWebinar?.durationTimestamp || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Description
                      </h5>
                      <p className="text-sm text-gray-900">
                        {selectedWebinar?.description || "-"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Image
                      </h5>
                      {selectedWebinar?.imageUrl ? (
                        <a
                          href={selectedWebinar.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          View Image
                        </a>
                      ) : (
                        <p className="text-sm text-gray-900">-</p>
                      )}
                    </div>

                    <div className="bg-gray-50/50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Metadata
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-gray-500">
                            Created At
                          </p>
                          <p className="text-gray-900 mt-1">
                            {selectedWebinar?.createdAt
                              ? new Date(
                                  selectedWebinar.createdAt
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-500">
                            Last Updated
                          </p>
                          <p className="text-gray-900 mt-1">
                            {selectedWebinar?.updatedAt
                              ? new Date(
                                  selectedWebinar.updatedAt
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Webinar Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-[90vw] sm:max-w-[900px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg sm:text-xl font-extrabold text-[#334155]">
                    Add Webinar
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setAddFormData({
                        title: "",
                        date: "",
                        durationTimestamp: "",
                        description: "",
                        speakers: "",
                        imageUrl: "",
                      });
                      setErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                    disabled={loading}
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
                  onSubmit={handleAddWebinar}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
                >
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Title:
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={addFormData.title}
                      onChange={handleAddFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Date:
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={addFormData.date}
                      onChange={handleAddFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Duration (HH:MM:SS):
                    </label>
                    <input
                      type="text"
                      name="durationTimestamp"
                      value={addFormData.durationTimestamp}
                      onChange={handleAddFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.durationTimestamp && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.durationTimestamp}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Speakers:
                    </label>
                    <input
                      type="text"
                      name="speakers"
                      value={addFormData.speakers}
                      onChange={handleAddFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.speakers && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.speakers}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Image URL:
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={addFormData.imageUrl}
                      onChange={handleAddFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                    {errors.imageUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.imageUrl}
                      </p>
                    )}
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <label className="text-[#334155] font-extrabold text-sm">
                      Description:
                    </label>
                    <textarea
                      name="description"
                      value={addFormData.description}
                      onChange={handleAddFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px] h-24 resize-none"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <div className="col-span-1 sm:col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setAddFormData({
                          title: "",
                          date: "",
                          durationTimestamp: "",
                          description: "",
                          speakers: "",
                          imageUrl: "",
                        });
                        setErrors({});
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all duration-200 text-sm font-bold"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Webinar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Update Webinar Modal */}
          {showUpdateModal && updateFormData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-[90vw] sm:max-w-[900px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg sm:text-xl font-extrabold text-[#334155]">
                    Update Webinar
                  </h4>
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateFormData(null);
                      setErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                    disabled={loading}
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
                  onSubmit={handleUpdateWebinar}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
                >
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Title:
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={updateFormData?.title || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Date:
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={
                        updateFormData?.date
                          ? new Date(updateFormData.date)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Duration (HH:MM:SS):
                    </label>
                    <input
                      type="text"
                      name="durationTimestamp"
                      value={updateFormData?.durationTimestamp || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.durationTimestamp && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.durationTimestamp}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Speakers:
                    </label>
                    <input
                      type="text"
                      name="speakers"
                      value={updateFormData?.speakers || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      required
                    />
                    {errors.speakers && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.speakers}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold text-sm">
                      Image URL:
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={updateFormData?.imageUrl || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                    {errors.imageUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.imageUrl}
                      </p>
                    )}
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <label className="text-[#334155] font-extrabold text-sm">
                      Description:
                    </label>
                    <textarea
                      name="description"
                      value={updateFormData?.description || ""}
                      onChange={handleUpdateFormChange}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px] h-24 resize-none"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <div className="col-span-1 sm:col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateModal(false);
                        setUpdateFormData(null);
                        setErrors({});
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                      disabled={loading}
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

          {/* Delete Confirmation Modal */}
          {showDeleteModal && webinarToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-[90vw] sm:max-w-[400px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-extrabold text-[#334155]">
                    Confirm Deletion
                  </h4>
                  <button
                    onClick={closeDeleteModal}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
                <p className="text-[#64748B] text-[13px] mb-6">
                  Are you sure you want to delete the webinar{" "}
                  <strong>{webinarToDelete?.title || ""}</strong>? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteWebinar}
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
