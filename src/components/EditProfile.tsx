import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Phone, MapPin, Mail, IdCard, Shield, Edit2, Check, X, Home, Search, Users, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    daum: any;
  }
}

interface User {
  id: string;
  name?: string;
  nickname: string;
  email: string;
  phone?: string;
  address?: string;
  invitationCode?: string;
  referredByCode?: string;
}

interface EditingState {
  nickname: boolean;
  phone: boolean;
  address: boolean;
}

interface FormData {
  nickname: string;
  phone: string;
  address: string;
}

interface AddressData {
  postcode: string;
  address: string;
  addressDetail: string;
}

interface Errors {
  nickname?: string;
  phone?: string;
}

export function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser, isLoading, fetchUserDetails } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    nickname: '',
    phone: '',
    address: '',
  });

  const [addressData, setAddressData] = useState<AddressData>({
    postcode: '',
    address: '',
    addressDetail: '',
  });
  
  const [editing, setEditing] = useState<EditingState>({
    nickname: false,
    phone: false,
    address: false,
  });
  
  const [errors, setErrors] = useState<Errors>({});
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    // 페이지 진입 시 최신 사용자 정보를 가져옵니다.
    fetchUserDetails();
  }, []); // 마운트 시 한 번만 실행

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        phone: user.phone || '',
        address: user.address || '',
      });

      // 주소 파싱 (기존 주소를 우편번호, 주소, 상세주소로 분리)
      if (user.address) {
        const parts = user.address.split(' ');
        if (parts.length >= 3) {
          setAddressData({
            postcode: parts[0],
            address: parts.slice(1, -1).join(' '),
            addressDetail: parts[parts.length - 1],
          });
        } else {
          setAddressData({
            postcode: '',
            address: user.address,
            addressDetail: '',
          });
        }
      }
    }
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleEdit = (field: keyof EditingState) => {
    setEditing(prev => ({ ...prev, [field]: true }));
    setErrors({});
  };

  const handleCancel = (field: keyof EditingState) => {
    setEditing(prev => ({ ...prev, [field]: false }));
    
    // Reset to original value
    if (user) {
      setFormData(prev => ({
        ...prev,
        [field]: (user as any)[field] || '',
      }));

      // 주소 취소 시 원래 주소 데이터로 복원
      if (field === 'address' && user.address) {
        const parts = user.address.split(' ');
        if (parts.length >= 3) {
          setAddressData({
            postcode: parts[0],
            address: parts.slice(1, -1).join(' '),
            addressDetail: parts[parts.length - 1],
          });
        } else {
          setAddressData({
            postcode: '',
            address: user.address,
            addressDetail: '',
          });
        }
      }
    }
    setErrors({});
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        setAddressData(prev => ({
          ...prev,
          postcode: data.zonecode,
          address: data.address,
        }));
        // formData도 업데이트
        const fullAddress = `${data.zonecode} ${data.address} ${addressData.addressDetail}`.trim();
        setFormData(prev => ({ ...prev, address: fullAddress }));
      },
    }).open();
  };

  const handleAddressDetailChange = (value: string) => {
    setAddressData(prev => ({ ...prev, addressDetail: value }));
    // formData 업데이트
    const fullAddress = `${addressData.postcode} ${addressData.address} ${value}`.trim();
    setFormData(prev => ({ ...prev, address: fullAddress }));
  };

  const validateField = (field: string, value: string): string | null => {
    if (field === 'nickname') {
      if (!value.trim()) {
        return '닉네임을 입력해주세요.';
      } else if (value.length < 2) {
        return '닉네임은 최소 2자 이상이어야 합니다.';
      }
    } else if (field === 'phone') {
      if (!value.trim()) {
        return '전화번호를 입력해주세요.';
      } else if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(value)) {
        return '올바른 전화번호 형식이 아닙니다.';
      }
    }
    return null;
  };

  const handleSave = async (field: keyof FormData) => {
    const value = formData[field];
    
    // 주소가 아닌 필드는 검증
    if (field !== 'address') {
      const error = validateField(field, value);
      if (error) {
        setErrors({ [field]: error });
        toast.error(error);
        return;
      }
    }

    setSavingField(field);
    
    try {
      await apiClient.put('/api/user/profile', {
        [field]: value,
      });
      
      // 서버에서 최신 데이터를 다시 가져와 UI 업데이트
      await fetchUserDetails();
      
      setEditing(prev => ({ ...prev, [field]: false }));
      setErrors({});
      
      // 성공 메시지
      const fieldNames: Record<string, string> = {
        nickname: '닉네임',
        phone: '전화번호',
        address: '주소'
      };
      toast.success(`${fieldNames[field]}이(가) 수정되었습니다! ✅`);
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || '수정에 실패했습니다.';
      setErrors({ [field]: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSavingField(null);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCopyInvitationCode = () => {
    const code = (user as any).invitationCode || '';
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success('초대 코드가 복사되었습니다! 👏');
    } else {
      toast.error('초대 코드가 없습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">회원정보 관리</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* 1. 이름 (읽기 전용) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={(user as any).name || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
              />
            </div>
          </div>

          {/* 2. 이메일 (읽기 전용) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
              />
            </div>
          </div>

          {/* 3. 닉네임 (수정 가능) */}
          <div className="mb-6">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  disabled={!editing.nickname}
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.nickname ? 'border-red-500' : editing.nickname ? 'border-purple-500' : 'border-gray-200'
                  } rounded-lg ${
                    editing.nickname ? 'bg-white' : 'bg-gray-50'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              {!editing.nickname ? (
                <button
                  type="button"
                  onClick={() => handleEdit('nickname')}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave('nickname')}
                    disabled={savingField === 'nickname'}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    완료
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel('nickname')}
                    disabled={savingField === 'nickname'}
                    className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
            )}
            {savingField === 'nickname' && (
              <p className="mt-1 text-sm text-gray-500">저장 중...</p>
            )}
          </div>

          {/* 4. 전화번호 (수정 가능) */}
          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!editing.phone}
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.phone ? 'border-red-500' : editing.phone ? 'border-purple-500' : 'border-gray-200'
                  } rounded-lg ${
                    editing.phone ? 'bg-white' : 'bg-gray-50'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="010-1234-5678"
                />
              </div>
              {!editing.phone ? (
                <button
                  type="button"
                  onClick={() => handleEdit('phone')}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave('phone')}
                    disabled={savingField === 'phone'}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    완료
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel('phone')}
                    disabled={savingField === 'phone'}
                    className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            {savingField === 'phone' && (
              <p className="mt-1 text-sm text-gray-500">저장 중...</p>
            )}
          </div>

          {/* 5. 주소 (수정 가능) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 (선택)
            </label>
            
            {!editing.address ? (
              // 읽기 전용 모드
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.address || '주소 없음'}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit('address')}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
              </div>
            ) : (
              // 수정 모드
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressData.postcode}
                    placeholder="우편번호"
                    readOnly
                    className="block w-1/3 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    className="flex-1 bg-purple-100 text-purple-700 py-3 px-4 rounded-lg font-medium hover:bg-purple-200 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    주소 검색
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={addressData.address}
                    placeholder="주소를 검색해주세요"
                    readOnly
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={addressData.addressDetail}
                    onChange={(e) => handleAddressDetailChange(e.target.value)}
                    placeholder="상세주소를 입력하세요"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleSave('address')}
                    disabled={savingField === 'address'}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    완료
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel('address')}
                    disabled={savingField === 'address'}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    취소
                  </button>
                </div>
              </div>
            )}
            {savingField === 'address' && (
              <p className="mt-2 text-sm text-gray-500">저장 중...</p>
            )}
          </div>

          {/* 6. 초대 코드 (읽기 전용 - 맨 아래로 이동) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              초대 코드
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={(user as any).invitationCode || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono text-lg"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyInvitationCode}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Copy className="w-4 h-4" />
                복사
              </button>
            </div>
            {(user as any).invitationCode && (
              <p className="mt-1 text-xs text-purple-600 font-medium">
                친구에게 공유하면 둘 다 티켓을 받습니다!
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
