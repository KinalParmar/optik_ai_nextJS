import axiosInstance from "@/src/Interceptor/Interceptor";

export const getAllCompany = async () => {
    try {
        const resp = await axiosInstance.get("/master-admin/tenant");
        return resp.data;
    } catch (error) {
        console.error(error);
    }
}

export const createNewCompany = async (formData) => {
    try {
        const resp = await axiosInstance.post("/master-admin/tenant/new", formData);
        return resp.data;
    } catch (error) {
        console.error(error);
    }
}

export const updateCompany = async (id) => {
    try {
        const resp = await axiosInstance.put(`/master-admin/tenant/${id}`);
        return resp.data;
    } catch (error) {
        console.error(error);
    }
}

export const deleteCompany = async (id) => {
    try {
        const resp = await axiosInstance.delete(`/master-admin/tenant/${id}`);
        return resp.data;
    } catch (error) {
        console.error(error);
    }
}
