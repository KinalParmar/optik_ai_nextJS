'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Login from '@/src/Services/Master-Admin/Login';
import { AlertProvider, useAlert } from '@/Components/Toaster'; // Removed redundant imports
import DotLoader from '@/Components/DotLoader';

// Define validation schema with Yup
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required').min(1, 'Password cannot be empty'),
});

// Inner component to use the useAlert hook
const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useAlert();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await Login.Loginapi(data);
      if (response.success) {
        showSuccessToast(response.message);
        localStorage.setItem('token', response.token);
        const getToken = localStorage?.getItem("token");
        if (getToken) {
          router.push('/master-admin/home');
        } else {
          router.push('/master-admin-login');
        }
      } else {
        showErrorToast(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      showErrorToast(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const getToken = localStorage?.getItem("token");
    if (!getToken) {
      router.push('/master-admin-login');
    }
  },[])

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
                Master Admin Login
              </h1>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    {...register('email')}
                    placeholder="Email"
                    className={`w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    {...register('password')}
                    placeholder="Password"
                    className={`w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 rounded-md text-[15px] font-medium transition-colors ${loading
                      ? 'bg-[#007BFF]/70 text-white cursor-not-allowed'
                      : 'bg-[#007BFF] text-white hover:bg-[#0056b3]'
                    }`}
                >
                  {loading ? 'Logging in...' : 'LOGIN'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap the component with AlertProvider
export default function SuperAdminLogin() {
  return (
    <AlertProvider>
      <LoginForm />
    </AlertProvider>
  );
}