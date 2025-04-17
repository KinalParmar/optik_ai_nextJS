import axiosInstance from "@/src/Interceptor/Interceptor";

export const getAllBlogs = async () => {
  try {
    const resp = await axiosInstance.get("/blog");
    return {
      success: true,
      data: resp.data?.data,
      message: "Blogs fetched successfully"
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "Error fetching blogs"
    };
  }
};

export const createNewBlog = async (blogData) => {
  try {
    const resp = await axiosInstance.post("/blog", blogData);
    return {
      success: true,
      data: resp.data?.data,
      message: resp?.data?.message || "Blog created successfully"
    };
  } catch (error) {
    console.error("Error creating blog:", error);
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "Error creating blog"
    };
  }
};

export const updateBlog = async (id, blogData) => {
  try {
    const resp = await axiosInstance.put(`/blog/${id}`, blogData);
    return {
      success: true,
      data: resp.data?.data,
      message: resp?.data?.message || "Blog updated successfully"
    };
  } catch (error) {
    console.error("Error updating blog:", error);
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "Error updating blog"
    };
  }
};

export const deleteBlog = async (id) => {
  try {
    const resp = await axiosInstance.delete(`/blog/${id}`);
    return {
      success: true,
      data: resp.data?.data,
      message: resp?.data?.message || "Blog deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "Error deleting blog"
    };
  }
};

export const getBlogStats = async () => {
  try {
    const resp = await axiosInstance.get('/blog/stats');
    return {
      success: true,
      data: resp.data?.data,
      message: "Stats fetched successfully"
    };
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "Error fetching blog stats"
    };
  }
};