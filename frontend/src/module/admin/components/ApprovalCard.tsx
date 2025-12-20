import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { FemaleApproval } from '../types/admin.types';

interface ApprovalCardProps {
  approval: FemaleApproval;
  onViewAction?: () => void;
}

export const ApprovalCard = ({
  approval,
  onViewAction,
}: ApprovalCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };


  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {approval.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{approval.user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{approval.user.phoneNumber}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Submitted: {formatDate(approval.submittedAt)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${approval.approvalStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
          approval.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
          {approval.approvalStatus.charAt(0).toUpperCase() + approval.approvalStatus.slice(1).replace('_', ' ')}
        </span>
      </div>

      {/* Profile Preview */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {approval.profile.photos && approval.profile.photos.length > 0 ? (
            approval.profile.photos.slice(0, 3).map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800"
              >
                <img
                  src={typeof photo === 'string' ? photo : (photo as any).url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialSymbol name="photo" className="text-gray-400" size={32} />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MaterialSymbol name="cake" className="text-gray-400" size={18} />
            <span className="text-gray-600 dark:text-gray-400">Age: </span>
            <span className="font-medium text-gray-900 dark:text-white">{approval.profile.age}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MaterialSymbol name="location_on" className="text-gray-400" size={18} />
            <span className="text-gray-600 dark:text-gray-400">Location: </span>
            <span className="font-medium text-gray-900 dark:text-white">{approval.profile.city}</span>
          </div>
          {approval.profile.bio && (
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bio: </span>
              <p className="text-gray-900 dark:text-white mt-1 line-clamp-2">{approval.profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onViewAction}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
        >
          <span>Action</span>
          <MaterialSymbol name="arrow_forward" size={20} />
        </button>
      </div>


    </div>
  );
};
