import axiosInstance from "@/src/Interceptor/AdminInterceptor";

const dbSlug = typeof window !== 'undefined' ? localStorage?.getItem('dbSlug') || "" : "";

export const createNewLeadAdmin = async (formData) => {
    try {
        const resp = await axiosInstance.post("/tenant/leads/new", formData, {
            headers: {
                'x-tenant': dbSlug,
                'Content-Type': 'application/json'
            }
        });
        return resp.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export const generateSummaryLeadById = async (id) => {
    try {
        const resp = await axiosInstance.post(`/tenant/leads/regenrate-summary/${id}`, {}, {
            headers: {
                'x-tenant': dbSlug,
                'Content-Type': 'application/json'
            }
        });
        return resp.data;
    } catch (error) {
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
        console.error(error);
        throw error;
    }
}
