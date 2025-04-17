"use client";
import React, { useEffect, useState } from "react";
import { FiSearch, FiEye, FiTrash2, FiEdit2 } from "react-icons/fi";
import {
  getAllBLog,
  editBlog,
  addBlog,
  deleteBlog,
} from "@/src/Services/Master-Admin/Blog";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DotLoader from "@/Components/DotLoader"; // Assuming this component exists
import { showSuccessToast, showErrorToast } from "@/Components/Toaster"; // Assuming these functions exist
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill's default stylesheet

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  // Yup validation schema
  const schema = yup.object().shape({
    title: yup
      .string()
      .required("Title is required")
      .max(100, "Max 100 characters"),
    excerpt: yup
      .string()
      .required("Excerpt is required")
      .max(200, "Max 200 characters"),
    category: yup
      .string()
      .required("Category is required")
      .max(50, "Max 50 characters"),
    readTime: yup
      .string()
      .required("Read Time is required")
      .matches(
        /^\d+\s(min|hour)s?$/,
        "Invalid format (e.g., '5 min' or '1 hour')"
      ),
    publishDate: yup.date().required("Publish Date is required").nullable(),
    author: yup
      .string()
      .required("Author is required")
      .max(50, "Max 50 characters"),
    content: yup
      .string()
      .required("Content is required")
      .max(5000, "Max 5000 characters"),
    imageUrl: yup.string().required("Image URL is required").url("Invalid URL"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      _id: null,
      title: "",
      excerpt: "",
      category: "",
      readTime: "",
      publishDate: "",
      author: "",
      content: "",
      imageUrl: "",
    },
  });

  const contentValue = watch("content");

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data) => {
    const blogData = {
      ...data,
      publishDate: new Date(data.publishDate).toISOString(),
    };

    try {
      setLoading(true);
      if (isEditing && data._id) {
        const response = await editBlog(blogData);
        if (response) {
          setBlogs(
            blogs.map((blog) => (blog._id === data._id ? response : blog))
          );
          setIsEditing(false);
          showSuccessToast(response?.message || "Blog updated successfully");
        }
      } else {
        const response = await addBlog(blogData);
        if (response) {
          setBlogs([...blogs, response]);
          showSuccessToast(response?.message || "Blog added successfully");
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

  const handleDeleteBlog = async (_id) => {
    try {
      setLoading(true);
      const response = await deleteBlog(_id);
      if (response) {
        setBlogs(blogs.filter((blog) => blog._id !== _id));
        showSuccessToast(response?.message || "Blog deleted successfully");
      }
    } catch (error) {
      console.error("Error:", error?.response?.data?.message || error.message);
      showErrorToast(
        error?.response?.data?.message || error.message || "An error occurred"
      );
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setBlogToDelete(null);
    }
  };

  const handleEditBlog = (blog) => {
    setValue("_id", blog._id);
    setValue("title", blog.title);
    setValue("excerpt", blog.excerpt);
    setValue("category", blog.category);
    setValue("readTime", blog.readTime);
    setValue(
      "publishDate",
      new Date(blog.publishDate).toISOString().split("T")[0]
    );
    setValue("author", blog.author);
    setValue("content", blog.content);
    setValue("imageUrl", blog.imageUrl);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await getAllBLog();
      if (response) {
        setBlogs(response);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      showErrorToast("Failed to fetch blogs");
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
              Blog Management
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
              <button
                onClick={() => {
                  reset();
                  setIsEditing(false);
                  setShowModal(true);
                }}
                className="px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold"
              >
                Add Blog
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E2E8F0] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#DDDAFA]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Excerpt
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Read Time
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Publish Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog) => (
                    <tr
                      key={blog._id}
                      className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">
                        {blog.title}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {blog.excerpt}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {blog.category}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {blog.readTime}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {new Date(blog.publishDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {blog.author}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">
                        {blog.content.substring(0, 50) +
                          (blog.content.length > 50 ? "..." : "")}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#6366F1]">
                        <a
                          href={blog.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedBlog(blog)}
                            className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="View Details"
                            aria-label="View blog details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="Edit Blog"
                            aria-label="Edit blog"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(blog)}
                            className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                            title="Delete Blog"
                            aria-label="Delete blog"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
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
                          No Blog found
                        </p>
                        <p className="text-[11px] mt-1 font-bold">
                          Add blogs manually
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View Blog Modal */}
          {selectedBlog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-[700px] max-h-[85vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900">
                    Blog Details
                  </h4>
                  <button
                    onClick={() => setSelectedBlog(null)}
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
                        Blog Information
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Title
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedBlog.title}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Excerpt
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedBlog.excerpt}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Category
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedBlog.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Read Time
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedBlog.readTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Publish Date
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {new Date(
                              selectedBlog.publishDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Author
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedBlog.author}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Content
                      </h5>
                      <div
                        className="text-sm text-gray-900 mt-1"
                        dangerouslySetInnerHTML={{
                          __html: selectedBlog.content,
                        }}
                      />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Image
                      </h5>
                      <a
                        href={selectedBlog.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
                      >
                        {selectedBlog.imageUrl}
                      </a>
                    </div>
                    <div className="bg-gray-50/50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Metadata
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-gray-500">
                            Created At
                          </p>
                          <p className="text-gray-900 mt-1">-</p>{" "}
                          {/* Assuming no createdAt in blog data */}
                        </div>
                        <div>
                          <p className="font-medium text-gray-500">
                            Last Updated
                          </p>
                          <p className="text-gray-900 mt-1">-</p>{" "}
                          {/* Assuming no updatedAt in blog data */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Blog Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-extrabold text-[#334155]">
                    {isEditing ? "Edit Blog" : "Add New Blog"}
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
                      Title:
                    </label>
                    <input
                      type="text"
                      {...register("title")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Excerpt:
                    </label>
                    <input
                      type="text"
                      {...register("excerpt")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter excerpt"
                    />
                    {errors.excerpt && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.excerpt.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Category:
                    </label>
                    <input
                      type="text"
                      {...register("category")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter category"
                    />
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Read Time:
                    </label>
                    <input
                      type="text"
                      {...register("readTime")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter read time (e.g., 5 min)"
                    />
                    {errors.readTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.readTime.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Publish Date:
                    </label>
                    <input
                      type="date"
                      {...register("publishDate")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                    />
                    {errors.publishDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.publishDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#334155] font-extrabold">
                      Author:
                    </label>
                    <input
                      type="text"
                      {...register("author")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter author"
                    />
                    {errors.author && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.author.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <label className="text-[#334155] font-extrabold">
                      Content:
                    </label>
                    <ReactQuill
                      value={contentValue || ""}
                      onChange={(value) => setValue("content", value)}
                      className="mt-1 border border-[#E2E8F0] rounded focus-within:border-[#6366F1] text-[13px] h-48"
                      placeholder="Enter content"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["link", "image"],
                          ["clean"],
                        ],
                      }}
                      formats={[
                        "header",
                        "bold",
                        "italic",
                        "underline",
                        "strike",
                        "list",
                        "bullet",
                        "link",
                        "image",
                      ]}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <label className="text-[#334155] font-extrabold">
                      Image URL:
                    </label>
                    <input
                      type="url"
                      {...register("imageUrl")}
                      className="w-full mt-1 px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#6366F1] text-[13px]"
                      placeholder="Enter image URL"
                    />
                    {errors.imageUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.imageUrl.message}
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
                        ? "Update Blog"
                        : "Add Blog"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && blogToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[400px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-extrabold text-[#334155]">
                    Confirm Deletion
                  </h4>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setBlogToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[#64748B] text-[13px] mb-6">
                  Are you sure you want to delete the blog{" "}
                  <strong>{blogToDelete.title}</strong>? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setBlogToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blogToDelete._id)}
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

export default BlogManagement;
