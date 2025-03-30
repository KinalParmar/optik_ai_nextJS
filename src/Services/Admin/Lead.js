import axiosInstance from "@/src/Interceptor/AdminInterceptor";
import { showErrorToast } from "@/Components/Toaster";

const dbSlug = typeof window !== 'undefined' ? localStorage?.getItem('dbSlug') || "" : "";

export const getAllLeadAdmin = async () => {
    try {
        const resp = await axiosInstance.get("/tenant/leads/all", {
            headers: {
                'x-tenant': dbSlug,
                'Content-Type': 'application/json'
            }
        });
        return resp.data;
    } catch (error) {
        showErrorToast(error?.response?.data?.message || "An error occurred");
        console.error(error);
        throw error;
    }
}


export const deleteLeadAdmin = async (id) => {
    try {
        const resp = await axiosInstance.delete(`/tenant/leads/${id}`, {
            headers: {
                'x-tenant': dbSlug,
                'Content-Type': 'application/json'
            }
        });
        return resp.data;
    } catch (error) {
        showErrorToast(error?.response?.data?.message || "An error occurred");
        console.error(error);
        throw error;
    }
}

export const updateLeadAdmin = async (id, data) => {
    try {
        const resp = await axiosInstance.patch(`/tenant/leads/${id}`, data, {
            headers: {
                'x-tenant': dbSlug,
                'Content-Type': 'application/json'
            }
        });
        return resp.data;
    } catch (error) {
        showErrorToast(error?.response?.data?.message || "An error occurred");
        console.error(error);
        throw error;
    }
}

export const uploadLeadAdmin = async (formData) => {
    try {
        const response = await axiosInstance.post('tenant/leads/upload', formData, {
            headers: {
                'x-tenant': dbSlug,
                'Content-Type': 'multipart/form-data'
            }
        });
        // Assuming you want to refresh leads after upload
        return response
      } catch (error) {
        showErrorToast(error?.response?.data?.message || "An error occurred");
        console.error(error);
        throw error;
      }
}
