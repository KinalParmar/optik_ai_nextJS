"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Login from "@/src/Services/Admin/Login";
import DotLoader from "@/Components/DotLoader";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { showSuccessToast, showErrorToast } from "@/Components/Toaster";

// Define the Yup validation schema for the admin login form
const loginSchema = Yup.object().shape({
  dbSlug: Yup.string()
    .required("Company Domain is required")
    .trim()
    .notOneOf([""], "Company Domain cannot be empty"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .trim()
    .notOneOf([""], "Password cannot be empty"),
});

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      dbSlug: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      localStorage?.setItem("dbSlug", data?.dbSlug);

      const response = await Login?.Loginapi(data);
      if (response?.success) {
        router?.push("/admin/users-list");
        localStorage?.setItem("Admintoken", response?.token);
        localStorage?.setItem("user", JSON.stringify(response?.user));
        localStorage?.setItem("role", JSON.stringify(response?.role));

        const getToken = localStorage?.getItem("Admintoken");
        if (!getToken) {
          router?.push("/admin-login");
        }
        showSuccessToast(response?.message || "Login successful");
      } else {
        console?.error("Login failed");
        // showErrorToast(response?.message || 'Login failed');
      }
    } catch (error) {
      // showErrorToast(error?.message || 'An error occurred during login');
      console?.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <DotLoader />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
          <div className="w-[400px]">
            <div className="flex justify-center mb-8">
              <Image
                src="/optik-logo.png"
                alt="Optik Logo"
                width={120}
                height={40}
                priority
              />
            </div>

            <div className="bg-white rounded-lg p-8">
              <h1 className="text-[22px] font-semibold text-center mb-8 text-gray-900">
                Admin Login
              </h1>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <input
                    type="text"
                    placeholder="Company Domain"
                    {...register("dbSlug")}
                    className={`w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border ${
                      errors?.dbSlug ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
                  />
                  {errors?.dbSlug && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors?.dbSlug?.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                    className={`w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border ${
                      errors?.email ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
                  />
                  {errors?.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors?.email?.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    {...register("password")}
                    className={`w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border ${
                      errors?.password ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
                  />
                  {errors?.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors?.password?.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#007BFF] text-white rounded-md text-[15px] font-medium hover:bg-[#0056b3] transition-colors"
                  disabled={loading}
                >
                  {"LOGIN"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
