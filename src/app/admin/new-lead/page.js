'use client'
import { useState } from 'react'

export default function NewLead() {
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
    jobRoleDescription: ''
  })

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.linkedinUrl &&
      formData.email &&
      formData.jobTitle &&
      formData.company_name &&
      formData.company_linkedin
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <section className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-[#334155]">Add Leads</h1>
      </div>

      <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-3 gap-8">
            {/* First Name */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                First Name <span className="text-[#FF4D4F]">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Last Name <span className="text-[#FF4D4F]">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                required
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                LinkedIn URL <span className="text-[#FF4D4F]">*</span>
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="Enter LinkedIn URL"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Email <span className="text-[#FF4D4F]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                required
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Job Title <span className="text-[#FF4D4F]">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Enter job title"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                required
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Company Name <span className="text-[#FF4D4F]">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Enter company name"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                required
              />
            </div>

            {/* Company LinkedIn */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Company LinkedIn <span className="text-[#FF4D4F]">*</span>
              </label>
              <input
                type="url"
                name="company_linkedin"
                value={formData.company_linkedin}
                onChange={handleChange}
                placeholder="Enter company linkedin"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Enter industry"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
              />
            </div>

            {/* Territory */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Territory
              </label>
              <input
                type="text"
                name="territory"
                value={formData.territory}
                onChange={handleChange}
                placeholder="Enter territory"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
              />
            </div>

            {/* Tenure in Role */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#334155]">
                Tenure in Role
              </label>
              <input
                type="text"
                name="tenureInRole"
                value={formData.tenureInRole}
                onChange={handleChange}
                placeholder="Enter tenure in role"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
              />
            </div>

            {/* Job Role Description */}
            <div className="space-y-2 col-span-3">
              <label className="block text-[13px] font-medium text-[#334155]">
                Job Role Description
              </label>
              <textarea
                name="jobRoleDescription"
                value={formData.jobRoleDescription}
                onChange={handleChange}
                placeholder="Enter job role description"
                rows="3"
                className="w-full px-3 py-2 text-[13px] rounded-[4px] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] placeholder-[#64748B] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`min-w-[120px] px-6 py-2.5 text-[13px] font-medium text-white rounded-[10px] transition-all duration-200 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] ${isFormValid() 
                ? 'hover:opacity-90 cursor-pointer' 
                : 'opacity-50 cursor-not-allowed'}`}
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}