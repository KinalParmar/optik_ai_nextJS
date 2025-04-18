import axiosInstance from "@/src/Interceptor/Interceptor";
import { showErrorToast, showSuccessToast } from "@/Components/Toaster";
import axios from "axios";

export const getAllBLog = async () => {
  try {
    const resp = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}blog`);
    return resp.data;
  } catch (error) {
    showErrorToast(
      error?.response?.data?.message || error?.message || "An error occurred"
    );
    console.error(error);
  }
};

export const editBlog = async (data) => {
  try {
    const resp = await axiosInstance.put(`/blog/${data?._id}`, data);
    return resp.data;
  } catch (error) {
    console.error(error);
    showErrorToast(
      error?.response?.data?.message || error?.message || "An error occurred"
    );
  }
};

export const addBlog = async (formData) => {
  try {
    const resp = await axiosInstance.post("/blog", formData);
    return resp.data;
    showSuccessToast(resp?.data?.message || "Blog added successfully");
  } catch (error) {
    console.error("error", error?.response?.data?.message);
    showErrorToast(
      error?.response?.data?.message || error?.message || "An error occurred"
    );
  }
};

export const deleteBlog = async (id) => {
  try {
    const resp = await axiosInstance.delete(`/blog/${id}`);
    console.log(resp?.data?.message, "resp?.data?.message");
    showSuccessToast(resp?.data?.message);

    return resp.data;
  } catch (error) {
    console.log(error?.response);
    showErrorToast(
      error?.response?.data?.message || error?.message || "An error occurred"
    );
  }
};
