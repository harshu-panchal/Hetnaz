import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../module/male/types/material-symbol';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
              <MaterialSymbol name="error_outline" size={64} className="text-primary" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-[#cbbc90] mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 dark:bg-[#342d18] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors font-medium"
          >
            <MaterialSymbol name="arrow_back" className="inline mr-2" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <MaterialSymbol name="home" className="inline mr-2" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

