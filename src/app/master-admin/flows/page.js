'use client';

export default function SuperFlows() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Flows</h1>
        <button className="bg-[#007BFF] text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Create New Flow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Flow Cards */}
        {[1, 2, 3].map((flow) => (
          <div key={flow} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Flow {flow}</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Description of flow {flow} and its purpose in the system.
            </p>
            <div className="flex justify-end space-x-3">
              <button className="text-[#007BFF] hover:text-blue-600 text-sm">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-700 text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
