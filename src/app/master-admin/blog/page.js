"use client";
import { useEffect, useState } from "react";
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { showSuccessToast, showErrorToast } from "@/Components/Toaster";
import DotLoader from "@/Components/DotLoader";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Import ReactQuill with dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import styles

import {
  getAllBlogs,
  createNewBlog,
  updateBlog,
  deleteBlog,
} from "@/src/Services/Master-Admin/Blog";

// Define the Yup validation schema
const blogSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  excerpt: Yup.string().required("Excerpt is required"),
  category: Yup.string().required("Category is required"),
  readTime: Yup.string().required("Read time is required"),
  publishDate: Yup.string().required("Publish date is required"),
  author: Yup.string().required("Author is required"),
  imageUrl: Yup.string().url("Must be a valid URL").required("Image URL is required"),
  // Remove content validation from Yup schema since we'll handle it separately
});

export default function Blog() {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(blogSchema),
    defaultValues: {
      id: "",
      title: "",
      excerpt: "",
      category: "",
      readTime: "",
      publishDate: "",
      author: "",
      imageUrl: "",
    },
  });

  const id = watch("id");
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState("");

  const onSubmit = async (data) => {
    // Check content separately from Yup validation
    if (!content || content === '<p><br></p>') {
      setContentError("Content is required");
      return;
    } else {
      setContentError("");
    }
    
    const blogData = {
      title: data?.title,
      excerpt: data?.excerpt,
      category: data?.category,
      readTime: data?.readTime,
      publishDate: data?.publishDate,
      author: data?.author,
      content: content, // Use the content from the rich text editor
      imageUrl: data?.imageUrl,
    };
  
    try {
      setLoading(true);
      let response;
      
      if (data?.id) {
        response = await updateBlog(data?.id, blogData);
      } else {
        response = await createNewBlog(blogData);
      }
      
      if (response?.success) {
        await getAllBlogsDetails();
        showSuccessToast(response?.message);
        reset();
        setContent(""); // Reset rich text editor content
        setShowForm(false);
      } else {
        showErrorToast(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showErrorToast("An error occurred while saving the blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getToken = localStorage?.getItem("token");
    if (!getToken) {
      router?.push("/master-admin-login");
    }
  }, []);

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
  };

  const handleEdit = (blog) => {
    setValue("id", blog?._id || "");
    setValue("title", blog?.title || "");
    setValue("excerpt", blog?.excerpt || "");
    setValue("category", blog?.category || "");
    setValue("readTime", blog?.readTime || "");
    setValue("publishDate", blog?.publishDate ? new Date(blog?.publishDate).toISOString().split("T")[0] : "");
    setValue("author", blog?.author || "");
    setContent(blog?.content || ""); // Set rich text editor content
    setValue("imageUrl", blog?.imageUrl || "");
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setBlogToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteBlog(blogToDelete);
      if (response?.success) {
        await getAllBlogsDetails();
        showSuccessToast(response?.message || "Blog deleted successfully");
      } else {
        showErrorToast(response?.message || "Failed to delete blog");
      }
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
      showErrorToast(error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBlogsDetails();
  }, []);

  const getAllBlogsDetails = async () => {
    try {
      setLoading(true);
      const response = await getAllBlogs();
      
      if (response.success) {
        // Ensure we have an array, even if empty
        const blogsArray = Array.isArray(response.data) ? response.data : [];
        
        if (blogsArray.length > 0) {
          // Filter unique blogs if needed
          const uniqueBlogs = blogsArray.filter(
            (blog, index, self) =>
              blog?._id &&
              self.findIndex((b) => b._id === blog._id) === index
          );
          
          setBlogs(uniqueBlogs);
          showSuccessToast(response.message || "Blogs fetched successfully");
        } else {
          // Handle empty array case
          setBlogs([]);
          console.log("No blogs found in response");
        }
      } else {
        // Handle unsuccessful response
        setBlogs([]);
        showErrorToast(response.message || "Error fetching blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
      showErrorToast("An error occurred while fetching blogs");
    } finally {
      setLoading(false);
    }
  };

  // Rich text editor modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div>
      {loading ? (
        <DotLoader />
      ) : (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
          {/* Blogs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Blogs</h3>
              <button
                onClick={() => setShowForm(true)}
                className="px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold flex items-center gap-1.5"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Blog
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase text-gray-500 bg-[#DDDAFA]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Read Time
                    </th>
                    <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blogs && blogs.length > 0 ? (
                    blogs.map((blog) => (
                      <tr
                        key={blog?._id || Math.random().toString(36).substr(2, 9)}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {blog?.title || "-"}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {blog?.category || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {blog?.author || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {blog?.readTime || "-"}
                        </td>
                        <td className="px-4 py-3 flex gap-3">
                          <button
                            onClick={() => handleView(blog)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(blog)}
                            className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog?._id)}
                            className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-3 text-center text-gray-500"
                      >
                        No blogs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* View Blog Modal */}
          {showViewModal && selectedBlog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-extrabold text-[#334155]">
                      Blog Details
                    </h4>
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
                        {selectedBlog?.title || "-"}
                      </h3>
                    </div>
                    {selectedBlog?.imageUrl && (
                      <div className="mb-4">
                        <img 
                          src={selectedBlog.imageUrl} 
                          alt={selectedBlog.title}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">
                          Excerpt:
                        </strong>{" "}
                        {selectedBlog?.excerpt || "-"}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">
                          Category:
                        </strong>{" "}
                        {selectedBlog?.category || "-"}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">
                          Read Time:
                        </strong>{" "}
                        {selectedBlog?.readTime || "-"}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">
                          Publish Date:
                        </strong>{" "}
                        {selectedBlog?.publishDate
                          ? new Date(selectedBlog.publishDate).toLocaleDateString()
                          : "-"}
                      </p>
                      <p className="pb-2 border-b border-[#EEEEEE]">
                        <strong className="text-[#334155] font-extrabold">
                          Author:
                        </strong>{" "}
                        {selectedBlog?.author || "-"}
                      </p>
                      <div className="pt-4">
                        <strong className="text-[#334155] font-extrabold block mb-2">
                          Content:
                        </strong>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedBlog?.content || "-" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New/Edit Blog Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-full h-[80vh] max-w-4xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-medium text-gray-800 mb-6">
                  {id ? "Edit Blog" : "Add New Blog"}
                </h3>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      {...register("title")}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.title?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      {...register("category")}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.category && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.category?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Author
                    </label>
                    <input
                      type="text"
                      {...register("author")}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.author && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.author?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Read Time
                    </label>
                    <input
                      type="text"
                      {...register("readTime")}
                      placeholder="e.g., 5 min"
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.readTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.readTime?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Publish Date
                    </label>
                    <input
                      type="date"
                      {...register("publishDate")}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.publishDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.publishDate?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="text"
                      {...register("imageUrl")}
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    />
                    {errors?.imageUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.imageUrl?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Excerpt
                    </label>
                    <textarea
                      {...register("excerpt")}
                      rows="2"
                      className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                    ></textarea>
                    {errors?.excerpt && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.excerpt?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    {/* Rich Text Editor */}
                    {typeof window !== "undefined" && (
                      <ReactQuill
                        value={content}
                        onChange={(value) => {
                          setContent(value);
                          // Clear error when content is added
                          if (value && value !== '<p><br></p>') {
                            setContentError("");
                          }
                        }}
                        modules={modules}
                        className="bg-white h-64 mb-4"
                      />
                    )}
                    {contentError && (
                      <p className="text-red-500 text-xs mt-1">
                        {contentError}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="col-span-2 flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        reset();
                        setContent("");
                        setContentError("");
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
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this blog? This action
                  cannot be undone.
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