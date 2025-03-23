'use client';
import { createNewLeadAdmin } from '@/src/Services/Admin/NewLead';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateSummaryLeadById, uploadLeadAdmin } from '@/src/Services/Admin/NewLead';
import { useForm } from 'react-hook-form';
import { showSuccessToast, showErrorToast, showMessageToast } from '@/Components/Toaster';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import DotLoader from '@/Components/DotLoader';

// Define Yup validation schema
const leadSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First Name is required')
    .trim()
    .notOneOf([''], 'First Name cannot be empty'),
  lastName: Yup.string()
    .required('Last Name is required')
    .trim()
    .notOneOf([''], 'Last Name cannot be empty'),
  linkedinUrl: Yup.string()
    .required('LinkedIn URL is required')
    .url('Must be a valid URL')
    .matches(/linkedin\.com/, 'Must be a LinkedIn URL'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  jobTitle: Yup.string()
    .required('Job Title is required')
    .trim()
    .notOneOf([''], 'Job Title cannot be empty'),
  company_name: Yup.string()
    .required('Company Name is required')
    .trim()
    .notOneOf([''], 'Company Name cannot be empty'),
  company_linkedin: Yup.string()
    .required('Company LinkedIn is required')
    .url('Must be a valid URL')
    .matches(/linkedin\.com/, 'Must be a LinkedIn URL'),
  phoneNumber: Yup.string()
    .nullable()
    .notRequired()
    .matches(/^\+?[1-9]\d{1,14}$/, {
      message: 'Invalid phone number format',
      excludeEmptyString: true,
    }),
  industry: Yup.string().nullable().notRequired(),
  territory: Yup.string().nullable().notRequired(),
  tenureInRole: Yup.string().nullable().notRequired(),
  jobRoleDescription: Yup.string().nullable().notRequired(),
});

export default function NewLead() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const leadPermissions = user?.permissions?.leads || [];

  // Define permission checks
  const canCreate = leadPermissions?.includes('create');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    linkedinUrl: '',
    email: '',
    jobTitle: '',
    company_name: '',
    company_linkedin: '',
    phoneNumber: '',
    industry: '',
    territory: '',
    tenureInRole: '',
    jobRoleDescription: '',
  });

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(leadSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      linkedinUrl: '',
      email: '',
      jobTitle: '',
      company_name: '',
      company_linkedin: '',
      phoneNumber: '',
      industry: '',
      territory: '',
      tenureInRole: '',
      jobRoleDescription: '',
    },
  });

  const isFormValid = () => {
    return (
      formData?.firstName &&
      formData?.lastName &&
      formData?.linkedinUrl &&
      formData?.email &&
      formData?.jobTitle &&
      formData?.company_name &&
      formData?.company_linkedin
    );
  };

  useEffect(() => {
    const getToken = localStorage?.getItem("Admintoken");
    if (!getToken) {
      router.push('/admin-login');
    }
  },[])

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await createNewLeadAdmin(data);

      if (response?.success) {
        setLoading(false);
        showSuccessToast(response?.message);
        showMessageToast("Now...Generating Summary");
        setLoading(true);
        const res = await generateSummaryLeadById(response?._id);
        if (res?.success) {
          setLoading(false);
          showSuccessToast(res?.message);
          router?.push('/admin/users-list');
        } else {
          setLoading(false);
          showErrorToast(res?.message);
        }
      } else {
        setLoading(false);
        showErrorToast(response?.message);
      }
    } catch (error) {
      setLoading(false);
      showErrorToast(error?.message || 'An error occurred');
      console?.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e?.target || {};
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValue(name, value); // Update react-hook-form values
  };

  return (
    <div>
      {loading ? (
        <DotLoader />
      ) : (
        <section className="p-8 max-w-[1400px] mx-auto">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#334155]">Add Leads</h1>
          </div>

          {canCreate ? (
            <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-3 gap-8">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      First Name <span className="text-[#FF4D4F]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      {...register('firstName')}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.firstName ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors?.firstName?.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Last Name <span className="text-[#FF4D4F]">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      {...register('lastName')}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.lastName ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors?.lastName?.message}</p>
                    )}
                  </div>

                  {/* LinkedIn URL */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      LinkedIn URL <span className="text-[#FF4D4F]">*</span>
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      {...register('linkedinUrl')}
                      onChange={handleChange}
                      placeholder="Enter LinkedIn URL"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.linkedinUrl ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.linkedinUrl && (
                      <p className="text-red-500 text-sm mt-1">{errors?.linkedinUrl?.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Email <span className="text-[#FF4D4F]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      {...register('email')}
                      onChange={handleChange}
                      placeholder="Enter email"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.email ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.email && (
                      <p className="text-red-500 text-sm mt-1">{errors?.email?.message}</p>
                    )}
                  </div>

                  {/* Job Title */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Job Title <span className="text-[#FF4D4F]">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      {...register('jobTitle')}
                      onChange={handleChange}
                      placeholder="Enter job title"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.jobTitle ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">{errors?.jobTitle?.message}</p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Company Name <span className="text-[#FF4D4F]">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      {...register('company_name')}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.company_name ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.company_name && (
                      <p className="text-red-500 text-sm mt-1">{errors?.company_name?.message}</p>
                    )}
                  </div>

                  {/* Company LinkedIn */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Company LinkedIn <span className="text-[#FF4D4F]">*</span>
                    </label>
                    <input
                      type="url"
                      name="company_linkedin"
                      {...register('company_linkedin')}
                      onChange={handleChange}
                      placeholder="Enter company linkedin"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.company_linkedin ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.company_linkedin && (
                      <p className="text-red-500 text-sm mt-1">{errors?.company_linkedin?.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      {...register('phoneNumber')}
                      onChange={handleChange}
                      placeholder="Enter Phone Number"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.phoneNumber ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors?.phoneNumber?.message}</p>
                    )}
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      {...register('industry')}
                      onChange={handleChange}
                      placeholder="Enter industry"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.industry ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.industry && (
                      <p className="text-red-500 text-sm mt-1">{errors?.industry?.message}</p>
                    )}
                  </div>

                  {/* Territory */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Territory
                    </label>
                    <input
                      type="text"
                      name="territory"
                      {...register('territory')}
                      onChange={handleChange}
                      placeholder="Enter territory"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.territory ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.territory && (
                      <p className="text-red-500 text-sm mt-1">{errors?.territory?.message}</p>
                    )}
                  </div>

                  {/* Tenure in Role */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Tenure in Role
                    </label>
                    <input
                      type="text"
                      name="tenureInRole"
                      {...register('tenureInRole')}
                      onChange={handleChange}
                      placeholder="Enter tenure in role"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.tenureInRole ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]`}
                    />
                    {errors?.tenureInRole && (
                      <p className="text-red-500 text-sm mt-1">{errors?.tenureInRole?.message}</p>
                    )}
                  </div>

                  {/* Job Role Description */}
                  <div className="space-y-2 col-span-3">
                    <label className="block text-[13px] font-medium text-[#334155]">
                      Job Role Description
                    </label>
                    <textarea
                      name="jobRoleDescription"
                      {...register('jobRoleDescription')}
                      onChange={handleChange}
                      placeholder="Enter job role description"
                      rows="3"
                      className={`w-full px-3 py-2 text-[13px] rounded-[4px] border ${
                        errors?.jobRoleDescription ? 'border-red-500' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:border-[#2563EB] placeholder-[#64748B] resize-none`}
                    />
                    {errors?.jobRoleDescription && (
                      <p className="text-red-500 text-sm mt-1">{errors?.jobRoleDescription?.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={!isFormValid()}
                    className={`min-w-[120px] px-6 py-2.5 text-[13px] font-medium text-white rounded-[10px] transition-all duration-200 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] ${
                      isFormValid()
                        ? 'hover:opacity-90 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    Create Lead
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-6 text-center">
              <p className="text-[#64748B] text-[13px] font-bold">
                You do not have permission to create leads.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}