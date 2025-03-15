export default function Cards({ title, count, icon }) {
    return (
      <div className="bg-white rounded-lg p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="text-xl mb-2 text-gray-400">{icon}</div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800">{count}</p>
      </div>
    );
  }