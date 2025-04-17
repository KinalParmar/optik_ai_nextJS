"use client";
import React, { useEffect, useState } from "react";
import { FiSearch, FiEye, FiTrash2, FiEdit2 } from "react-icons/fi";
import {
  getAllContact,
  editContact,
  deleteContact,
} from "@/src/Services/Master-Admin/contact";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DotLoader from "@/Components/DotLoader";
import { showSuccessToast, showErrorToast } from "@/Components/Toaster";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const schema = yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .max(100, "Max 100 characters"),
    email: yup.string().required("Email is required").email("Invalid email"),
    subject: yup
      .string()
      .required("Subject is required")
      .max(200, "Max 200 characters"),
    message: yup
      .string()
      .required("Message is required")
      .max(5000, "Max 5000 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      _id: null,
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data) => {
    const contactData = { ...data };
    try {
      setLoading(true);
      if (isEditing && data._id) {
        const response = await editContact(contactData);
        if (response) {
          setContacts(
            contacts.map((contact) =>
              contact._id === data._id ? response : contact
            )
          );
          setIsEditing(false);
          showSuccessToast(response?.message || "Contact updated successfully");
        }
      } else {
        const response = await editContact(contactData); // Assuming editContact handles both create and update
        if (response) {
          setContacts([...contacts, response]);
          showSuccessToast(response?.message || "Contact added successfully");
        }
      }
      reset();
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error?.response?.data?.message || error.message);
      showErrorToast(
        error?.response?.data?.message || error.message || "An error occurred"
      );
    } finally {
      setLoading(false);
      getData();
    }
  };

  const handleDeleteContact = async (_id) => {
    try {
      setLoading(true);
      const response = await deleteContact(_id);
      if (response) {
        setContacts(contacts.filter((contact) => contact._id !== _id));
        showSuccessToast(response?.message || "Contact deleted successfully");
      }
    } catch (error) {
      console.error("Error:", error?.response?.data?.message || error.message);
      showErrorToast(
        error?.response?.data?.message || error.message || "An error occurred"
      );
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  const handleEditContact = (contact) => {
    setValue("_id", contact._id);
    setValue("name", contact.name);
    setValue("email", contact.email);
    setValue("subject", contact.subject);
    setValue("message", contact.message);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await getAllContact();
      if (response) {
        setContacts(response);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      showErrorToast("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <DotLoader />
      ) : (
        <section className="px-8 py-6 max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[20px] font-bold text-[#334155]">
              Contact Management
            </h1>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] w-[200px] text-[13px] font-bold focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

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
                    Subject
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">
                        {contact.name}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {contact.email}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {contact.subject}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {contact.message.substring(0, 50) +
                          (contact.message.length > 50 ? "..." : "")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="View Details"
                            aria-label="View contact details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="Edit Contact"
                            aria-label="Edit contact"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contact)}
                            className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="Delete Contact"
                            aria-label="Delete contact"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center">
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
                          No Contact found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View Contact Modal */}
          {selectedContact && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-[700px] max-h-[85vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900">
                    Contact Details
                  </h4>
                  <button
                    onClick={() => setSelectedContact(null)}
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
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Contact Information
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Name
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedContact.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Email
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedContact.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Subject
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedContact.subject}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Message
                      </h5>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Contact Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-extrabold text-[#334155]">
                    {isEditing ? "Edit Contact" : "Add New Contact"}
                  </h4>
                  <button
                    onClick={() => {
                      reset();
                      setShowModal(false);
                      setIsEditing(false);
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
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid grid-cols-3 gap-6"
                >
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Name:
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Email:
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Subject:
                    </label>
                    <input
                      type="text"
                      {...register("subject")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter subject"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <label className="text-[#334155] font-extrabold">
                      Message:
                    </label>
                    <textarea
                      {...register("message")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px] h-24 resize-none"
                      placeholder="Enter message"
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setShowModal(false);
                        setIsEditing(false);
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
                      {loading
                        ? "Saving..."
                        : isEditing
                        ? "Update Contact"
                        : "Add Contact"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && contactToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[400px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-extrabold text-[#334155]">
                    Confirm Deletion
                  </h4>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setContactToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[#64748B] text-[13px] mb-6">
                  Are you sure you want to delete the contact{" "}
                  <strong>{contactToDelete.name}</strong>? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setContactToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contactToDelete._id)}
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
};

export default Contact;
