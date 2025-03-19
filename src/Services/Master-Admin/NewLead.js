import axiosInstance from "@/src/Interceptor/Interceptor";

export const newLead = async () => {
    try {
        const resp = await axiosInstance.post("/master-admin/leads/new");
        generateSummary(resp.data.id);
        return resp.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const updateLead = async (id) => {
    try {
        const resp = await axiosInstance.patch(`/master-admin/leads/${id}`);
        return resp.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const generateSummary = async (id) => {
    try {
        const resp = await axiosInstance.get(`/master-admin/leads/regenrate-summary/${id}`);
        return resp.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

