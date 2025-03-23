import axiosInstance from "@/src/Interceptor/AdminInterceptor";

const dbSlug = typeof window !== 'undefined' ? localStorage?.getItem('dbSlug') || "" : "";

export const createUser = async (formData) => {
    try {
        const resp = await axiosInstance.post("/tenant/user/new", formData, {
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


export const updateUser = async (id, formData) => {
    try {
        const resp = await axiosInstance.put(`/tenant/user/${id}`, formData, {
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

export const deleteUser = async (id) => {
    try {
        const resp = await axiosInstance.delete(`/tenant/user/${id}`, {
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

export const getUsers = async () => {
    try {
        const response = await axiosInstance.get('/tenant/user', {
            headers: {
                'x-tenant': dbSlug,
                'Content-Type': 'application/json'
            }
        });
        // Assuming you want to refresh leads after upload
        return response
      } catch (error) {
        console.error(error);
        throw error;
      }
}
