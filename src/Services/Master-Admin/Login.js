import axios from "axios";
import { showErrorToast } from "@/Components/Toaster";

const endpoint = process.env.NEXT_PUBLIC_BASE_URL

const Login = {
    async Loginapi(data) {
        try {
            const resp = await axios.post(`${endpoint}master-admin/auth/login`, data);
            return resp.data;
        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            showErrorToast(error?.response?.data?.message || 'An error occurred');
            throw error;
        }
    }
};

export default Login;