import axios from "axios";

const endpoint = process.env.NEXT_PUBLIC_BASE_URL

const Login = {
    async Loginapi(data) {
        try {
            const resp = await axios.post(`${endpoint}tenant/auth/login`, data, {
                headers: {
                    'x-tenant': `${data?.dbSlug}`,
                    'Content-Type': 'application/json'
                }
            });
            return resp.data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }
};

export default Login;