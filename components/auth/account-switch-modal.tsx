'use client';

interface AccountSwitchModalProps {
  currentUserName: string;
  currentUserType: 'client' | 'admin';
  targetType: 'client' | 'admin';
  onConfirm: () => void;
  onCancel: () => void;
}

export function AccountSwitchModal({
  currentUserName,
  currentUserType,
  targetType,
  onConfirm,
  onCancel,
}: AccountSwitchModalProps) {
  const targetName = targetType === 'admin' ? '관리자' : '클라이언트';
  const currentName = currentUserType === 'admin' ? '관리자' : '클라이언트';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          {targetName} 페이지 접근
        </h2>
        <p className="text-gray-600 mb-6">
          {targetName} 페이지에 접근하려면 현재 로그인된 {currentName} 계정({currentUserName})에서 로그아웃해야 합니다.
          <br /><br />
          로그아웃 후 {targetName} 계정으로 로그인하시겠습니까?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
