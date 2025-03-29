import axiosInstance from "@/src/Interceptor/Interceptor";

export const getAllLead = async () => {
    try {
        const resp = await axiosInstance.get("/master-admin/leads/all");
        return resp.data;
    } catch (error) {
        console.error(error);
        showErrorToast(error?.response?.data?.message || 'An error occurred');
        throw error;
    }
}


export const deleteLead = async (id) => {
    try {
        const resp = await axiosInstance.delete(`/master-admin/leads/${id}`);
        return resp.data;
    } catch (error) {
        console.error(error);
        showErrorToast(error?.response?.data?.message || 'An error occurred');
        throw error;
    }
}

export const uploadCSV = async (formData) => {
    try {
        const response = await axiosInstance.post('/master-admin/leads/upload', formData);
        // Assuming you want to refresh leads after upload
        return response
      } catch (error) {
        console.error(error);
        showErrorToast(error?.response?.data?.message || 'An error occurred');
        throw error;
      }
}
