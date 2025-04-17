import axiosInstance from "@/src/Interceptor/Interceptor";
import { showErrorToast, showSuccessToast } from "@/Components/Toaster";
import axios from "axios";

export const getAllContact = async () => {
  try {
    const resp = await axiosInstance.get(`/contact`);
    return resp.data;
  } catch (error) {
    debugger;
    showErrorToast(
      error?.response?.data?.message || error?.message || "An error occurred"
    );
    console.error(error);
  }
};

export const editContact = async (data) => {
  try {
    const resp = await axiosInstance.put(`/contact/${data?._id}`, data);
    return resp.data;
  } catch (error) {
    console.error(error);
    showErrorToast(
      error?.response?.data?.message || error?.message || "An error occurred"
    );
  }
};

export const deleteContact = async (id) => {
  try {
    const resp = await axiosInstance.delete(`/contact/${id}`);
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
