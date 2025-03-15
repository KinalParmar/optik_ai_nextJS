'use client';
import { useState } from 'react';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [companies, setCompanies] = useState([
    { id: 1, name: "Tech Corp", regNo: "12345", email: "tech@corp.com", address: "123 Tech St", pincode: "123456" },
    { id: 2, name: "Inno Ltd", regNo: "67890", email: "info@innoltd.com", address: "456 Inno Ave", pincode: "654321" },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    email: '',
    address: '',
    pincode: ''
  });
  const [notifications, setNotifications] = useState(["New company added successfully!"]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCompany = {
      id: companies.length + 1,
      ...formData
    };
    setCompanies([...companies, newCompany]);
    setFormData({ name: '', regNo: '', email: '', address: '', pincode: '' });
    setShowForm(false);
    setNotifications([`Company ${formData.name} added successfully!`, ...notifications.slice(0, 2)]);
  };

  const handleView = (company) => {
    setSelectedCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company) => {
    setFormData(company);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setCompanyToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setCompanies(companies.filter(company => company.id !== companyToDelete));
    setShowDeleteModal(false);
    setCompanyToDelete(null);
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Stats Cards with Transparent Lavender Background */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Leads", count: "245", icon: "📈" },
          { title: "New Leads", count: "32", icon: "✨" },
          { title: "Users", count: "15", icon: "👥" },
          { title: "Companies", count: "8", icon: "🏢" },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-[#DDDAFA] bg-opacity-50 rounded-lg p-6 text-center border border-[#DDDAFA] shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ backdropFilter: 'blur(5px)' }} // Adds a slight blur effect for transparency
          >
            <div className="text-xl mb-2 text-gray-400">{card.icon}</div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{card.title}</h3>
            <p className="text-2xl font-semibold text-gray-800">{card.count}</p>
          </div>
        ))}
      </div>

      {/* Companies Table with Clean Styling */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-800">Companies</h3>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-[7px] rounded-[4px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 transition-all duration-200 text-[13px] font-bold flex items-center gap-1.5"
          >
            <FiPlus className="w-3.5 h-3.5" /> Add Company
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs uppercase text-gray-500 bg-[#DDDAFA]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Name</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Reg No</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Email</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Address</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Pincode</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold text-[black] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 font-medium text-gray-800">{company.name}</td>
                  <td className="px-4 py-3">{company.regNo}</td>
                  <td className="px-4 py-3 text-gray-600">{company.email}</td>
                  <td className="px-4 py-3">{company.address}</td>
                  <td className="px-4 py-3">{company.pincode}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => handleView(company)} className="text-gray-500 hover:text-gray-700">
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(company)} className="p-1.5 text-[#6366F1] hover:bg-[#6366F1] hover:bg-opacity-10 rounded transition-colors duration-200">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(company.id)} className="p-1.5 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded transition-colors duration-200">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications with Simple Design */}
      <div className="mt-10">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Notifications</h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 max-h-32 overflow-y-auto">
          {notifications.map((notif, index) => (
            <div key={index} className="text-sm text-gray-600 mb-2">{notif}</div>
          ))}
        </div>
      </div>

      {/* View Company Modal */}
      {showViewModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-extrabold text-[#334155]">Company Info</h4>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-extrabold text-[#334155]">{selectedCompany.name}</h3>
                </div>

                <div className="space-y-4">
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Register No:</strong>{' '}
                    {selectedCompany.regNo || '-'}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Email:</strong>{' '}
                    {selectedCompany.email || '-'}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Address:</strong>{' '}
                    {selectedCompany.address || '-'}
                  </p>
                  <p className="pb-2 border-b border-[#EEEEEE]">
                    <strong className="text-[#334155] font-extrabold">Pincode:</strong>{' '}
                    {selectedCompany.pincode || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Company Form with Minimalist Styling */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {formData.id ? 'Edit Company' : 'Add New Company'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Register No</label>
                <input
                  type="text"
                  name="regNo"
                  value={formData.regNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:opacity-90 transition-all duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this company? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}