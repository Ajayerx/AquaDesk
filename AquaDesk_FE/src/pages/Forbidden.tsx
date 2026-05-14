import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">403 - Access Denied</h1>
        <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
