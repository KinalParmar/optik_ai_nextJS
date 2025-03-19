import axios from "axios";

const Login = {
    async Loginapi(data) {
        try {
            const resp = await axios.post("https://optik-plum.vercel.app/master-admin/auth/login", data);
            return resp.data;
        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default Login;