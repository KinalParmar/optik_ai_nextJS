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
import {
  checkPasswordResetRequired,
  resetUserPassword,
} from "@/src/Services/Admin/Users";

// Yup schema for login form
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

// Yup schema for password creation modal
const passwordSchema = Yup.object().shape({
  createPassword: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("createPassword")], "Passwords must match"),
});

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Login form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "", dbSlug: "" },
  });

  // Password creation form setup
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { createPassword: "", confirmPassword: "" },
  });

  // Handle login submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      localStorage?.setItem("dbSlug", data?.dbSlug);

      const response = await Login?.Loginapi(data);
      if (response?.success) {
        const { user, token } = response;
        console.log("user", user);
        localStorage?.setItem("Admintoken", token);
        localStorage?.setItem("user", JSON.stringify(user));
        // const passwordResetStatus = await checkPasswordResetRequired();
        // if (passwordResetStatus?.resetPwd) {
        // setShowPasswordModal(true);
        // } else {
        router?.push("/users/users-list");
        showSuccessToast(response?.message || "Login successful");
        // }
        const getToken = localStorage?.getItem("Admintoken");
        if (!getToken) {
          router?.push("/login");
        }
      } else {
        console?.error("Login failed");
        showErrorToast(response?.message || "Login failed");
      }
    } catch (error) {
      showErrorToast(error?.message || "An error occurred during login");
      console?.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle password creation submission
  const onPasswordSubmit = async (data) => {
    const user = JSON.parse(localStorage?.getItem("user"));
    try {
      setLoading(true);
      await resetUserPassword(user._id, data.createPassword);
      showSuccessToast("Password set successfully");
      setShowPasswordModal(false);
      resetPasswordForm();
      localStorage.clear();
      router?.push("/login");
    } catch (error) {
      showErrorToast("Failed to set password");
      console.error("Password set failed:", error);
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
                User Login
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

      {/* Password Creation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[450px] max-w-[90%] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-extrabold text-[#334155]">
                  Set Your Password
                </h4>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="text-[#334155] font-semibold">
                    Create Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("createPassword")}
                    className={`w-full h-11 px-3 mt-2 rounded-md bg-white text-[15px] placeholder-gray-400 border ${
                      passwordErrors?.createPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
                  />
                  {passwordErrors?.createPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {passwordErrors?.createPassword?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[#334155] font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("confirmPassword")}
                    className={`w-full h-11 px-3 mt-2 rounded-md bg-white text-[15px] placeholder-gray-400 border ${
                      passwordErrors?.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
                  />
                  {passwordErrors?.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {passwordErrors?.confirmPassword?.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#007BFF] text-white rounded-md text-[15px] font-medium hover:bg-[#0056b3] transition-colors"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Set Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
