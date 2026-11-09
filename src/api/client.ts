// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 쿠키 자동 포함 (refreshToken)
});

export interface UserDetailResDto {
  id: number;
  email?: string;
  nickname?: string;
}

export const getMe = async () => {
  const response = await apiClient.get<UserDetailResDto>("/api/user/me");
  return response.data;
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// 요청 인터셉터: accessToken 헤더에 실어줌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 만료·누락 토큰이면 한 번 재발급 후 원래 요청을 재시도한다.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const originalRequest = config as typeof config & { _retry?: boolean };

    // 403은 인증은 되었지만 권한이 없는 경우다. 토큰 재발급은 401에만 시도한다.
    if (response?.status === 401 &&
        !originalRequest?._retry &&
        !originalRequest?.url?.includes('/api/user/token/reissue')) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const res = await axios.post('http://localhost:8080/api/user/token/reissue', {}, { withCredentials: true });
          const newAccessToken = res.headers.authorization.replace('Bearer ', '');
          localStorage.setItem('accessToken', newAccessToken);
          onRefreshed(newAccessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 재발급 실패 → 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      }

      // 동시에 여러 401이 올 수 있으므로, 대기 큐
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// 티켓 잔액 조회
export const getTicketWallet = async () => {
  const response = await apiClient.get('/api/ticket/wallet/me');
  return response.data;
};

// 티켓 거래내역 조회
export const getTicketLedger = async (page = 0, size = 20) => {
  const response = await apiClient.get('/api/ticket/ledger/me', { params: { page, size } });
  return response.data;
};

export default apiClient;
