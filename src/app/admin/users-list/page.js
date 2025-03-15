'use client';
import { useState } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
import { BiUpload } from 'react-icons/bi';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FiArrowLeft } from 'react-icons/fi'; // Added for modal back button

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showRoles, setShowRoles] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Mock data for leads (you can replace this with your actual data)
  const leads = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      jobTitle: 'Developer', 
      company: 'Tech Corp', 
      linkedin: 'https://linkedin.com/in/johndoe', 
      summary: 'Experienced developer with 5 years in tech.', 
      createdAt: '2025-03-01' 
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      jobTitle: 'Manager', 
      company: 'Inno Ltd', 
      linkedin: 'https://linkedin.com/in/janesmith', 
      summary: 'Manager with expertise in team leadership.', 
      createdAt: '2025-03-02' 
    },
  ];

  const handleRoles = (lead) => {
    setEditingLead(lead);
    setShowRoles(true);
  };

  const handleCloseRoles = () => {
    setShowRoles(false);
    setEditingLead(null);
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-bold text-[#334155]">Lead Management</h1>
        
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-[7px] rounded-[4px] border border-[#E2E8F0] w-[200px] text-[13px] font-bold focus:outline-none focus:border-[#6366F1] placeholder-[#64748B]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-1.5 px-3 py-[7px] rounded-[4px] bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F4F4FF] hover:text-[#6366F1] hover:border-[#6366F1] transition-colors duration-200 text-[13px] font-bold">
            <BiUpload className="w-3.5 h-3.5" />
            <span>Upload Leads</span>
          </button>
          
          <button className="px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold">
            Download Dummy CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[4px] border border-[#E2E8F0] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#DDDAFA]">
            <tr>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Name</th>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Email</th>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Job Title</th>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Company</th>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">LinkedIn</th>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Summary</th>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Created At</th>
              <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <tr key={lead.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFF] transition-colors duration-200">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#334155]">{lead.name}</td>
                  <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead.email}</td>
                  <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead.jobTitle}</td>
                  <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead.company}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6366F1]">
                    <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      {lead.linkedin} <HiOutlineExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead.summary}</td>
                  <td className="px-4 py-3 text-[13px] text-[#64748B]">{lead.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRoles(lead)}
                        className="p-1.5 text-[#22C55E] hover:bg-[#22C55E] hover:bg-opacity-10 rounded transition-colors duration-200 text-[12px] font-bold"
                        title="Edit Roles"
                      >
                        ROLES
                      </button>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-[#64748B]">
                    <svg width="48" height="31" viewBox="0 0 64 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.33333 0C2.388 0 0 2.388 0 5.33333V34.6667C0 37.612 2.388 40 5.33333 40H58.6667C61.612 40 64 37.612 64 34.6667V5.33333C64 2.388 61.612 0 58.6667 0H5.33333ZM5.33333 5.33333H58.6667V34.6667H5.33333V5.33333ZM13.3333 10.6667V16H18.6667V10.6667H13.3333ZM24 10.6667V16H29.3333V10.6667H24ZM34.6667 10.6667V16H40V10.6667H34.6667ZM13.3333 21.3333V26.6667H18.6667V21.3333H13.3333ZM24 21.3333V26.6667H29.3333V21.3333H24ZM34.6667 21.3333V26.6667H40V21.3333H34.6667Z" fill="#E2E8F0"/>
                    </svg>
                    <p className="mt-3 text-[13px] font-bold">No leads found</p>
                    <p className="text-[11px] mt-1 font-bold">Upload leads using CSV or add them manually</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-extrabold text-[#334155]">Customer Info</h4>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-extrabold text-[#334155]">
                    {selectedLead.name}
                  </h3>
                  <p className="text-[#64748B] font-bold">{selectedLead.jobTitle}</p>
                </div>

                <div className="space-y-4">
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Company:</strong>{' '}
                    <a href={selectedLead.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:text-[#5457E5]">
                      {selectedLead.company || '-'}
                    </a>
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Email:</strong>{' '}
                    {selectedLead.email || '-'}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Industry:</strong>{' '}
                    {selectedLead.jobTitle || '-'} {/* Assuming job title as a proxy for industry */}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Job Role Description:</strong>{' '}
                    {selectedLead.summary || '-'}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">LinkedIn:</strong>{' '}
                    <a href={selectedLead.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:text-[#5457E5]">
                      {selectedLead.linkedin || '-'}
                    </a>
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Phone Number:</strong>{' '}
                    {'-'} {/* No phone number in mock data */}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Tenure In Role:</strong>{' '}
                    {'-'} {/* No tenure in mock data */}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Territory:</strong>{' '}
                    {'-'} {/* No territory in mock data */}
                  </p>
                  <div className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Summary:</strong>
                    <p className="mt-2 whitespace-pre-wrap">{selectedLead.summary || '-'}</p>
                    <button 
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all duration-200 text-sm font-bold"
                      onClick={() => {}}
                    >
                      Regenerate
                    </button>
                  </div>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Created At:</strong>{' '}
                    {selectedLead.createdAt}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Updated At:</strong>{' '}
                    {'-'} {/* No updatedAt in mock data */}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoles && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md border border-gray-300 shadow-sm p-6 w-[320px]">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleCloseRoles}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-xl font-semibold text-gray-700">Lead Roles</h2>
            </div>

            <form className="space-y-4">
              {[
                { name: "allowView", label: "Allow View" },
                { name: "allowEdit", label: "Allow Edit" },
                { name: "allowDelete", label: "Allow Delete" },
                { name: "allowCreate", label: "Allow Create" },
              ].map(({ name, label }) => (
                <div key={name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={false} // Default to unchecked; adjust based on your logic
                    onChange={() => {}} // Add logic if needed
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor={name} className="text-sm font-medium text-gray-700 cursor-pointer">
                    {label}
                  </label>
                </div>
              ))}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:opacity-90 transition-all duration-200 text-sm font-semibold"
                  onClick={handleCloseRoles}
                >
                  Save Roles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}