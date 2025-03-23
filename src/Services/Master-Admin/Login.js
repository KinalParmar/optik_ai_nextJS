import axios from "axios";

const endpoint = process.env.NEXT_PUBLIC_BASE_URL

const Login = {
    async Loginapi(data) {
        try {
            const resp = await axios.post(`${endpoint}master-admin/auth/login`, data);
            return resp.data;
        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default Login;