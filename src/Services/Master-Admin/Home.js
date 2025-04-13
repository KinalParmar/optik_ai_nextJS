import axiosInstance from "@/src/Interceptor/Interceptor";
import { showErrorToast, showSuccessToast } from "@/Components/Toaster";

export const getAllCompany = async () => {
  try {
    const resp = await axiosInstance.get("/master-admin/tenant");
    return resp.data;
  } catch (error) {
    showErrorToast(error?.response?.data?.message || "An error occurred");
    console.error(error);
  }
};

export const getAllNotificationsDetails = async () => {
  try {
    const resp = await axiosInstance.get("/master-admin/tenant/notifications");
    return resp.data;
  } catch (error) {
    console.error(error);
    showErrorToast(error?.response?.data?.message || "An error occurred");
  }
};

export const createNewCompany = async (formData) => {
  try {
    const resp = await axiosInstance.post("/master-admin/tenant/new", formData);
    return resp.data;
  } catch (error) {
    console.error("error", error?.response?.data?.message);
    showErrorToast(error?.response?.data?.message || "An error occurred");
  }
};

export const updateCompany = async (id, companyData) => {
  console.log("q1234543232454");
  try {
    const resp = await axiosInstance.put(
      `/master-admin/tenant/${id}`,
      companyData
    );
    console.log(resp?.data?.message, "resp?.data?.message");
    showSuccessToast(resp?.data?.message);

    return resp.data;
  } catch (error) {
    console.log(error?.response);
    showErrorToast(error?.response?.data?.message || "An error occurred");
  }
};

export const deleteCompany = async (id) => {
  try {
    const resp = await axiosInstance.delete(`/master-admin/tenant/${id}`);
    return resp.data;
  } catch (error) {
    console.error(error);
    showErrorToast(error?.response?.data?.message || "An error occurred");
  }
};

export const dashStats = async () => {
  try {
    const resp = await axiosInstance.get(`/master-admin/tenant/stats`);
    return resp.data;
  } catch (error) {
    console.error(error);
    showErrorToast(error?.response?.data?.message || "An error occurred");
  }
};
