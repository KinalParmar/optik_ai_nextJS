import axios from "axios";
import { showErrorToast } from "@/Components/Toaster";

const endpoint = process.env.NEXT_PUBLIC_BASE_URL;

const Login = {
  async Loginapi(data) {
    console.log("1111");
    try {
      const resp = await axios.post(`${endpoint}tenant/auth/login`, data, {
        headers: {
          "x-tenant": `${data?.dbSlug}`,
          "Content-Type": "application/json",
        },
      });
      return resp.data;
    } catch (error) {
      console.error("Login error:", error);
      showErrorToast(error?.response?.data?.message || "An error occurred");
      throw error;
    }
  },
};

export default Login;
