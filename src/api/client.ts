// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 쿠키 자동 포함 (refreshToken)
});

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

// 응답 인터셉터: 401 → 토큰 재발급
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // 401 + 에러 타입이 "expired"일 때만 재발급 시도
    if (response?.status === 401 && response.data?.error === 'expired') {
      const originalRequest = config;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const res = await axios.post('/api/token/reissue', {}, { withCredentials: true });
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

export default apiClient;
