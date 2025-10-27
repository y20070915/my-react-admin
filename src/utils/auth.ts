const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';

export interface UserInfo {
  id: string;
  username: string;
  role: string;
  permissions?: string[];
}

export const auth = {
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  setUserInfo(userInfo: UserInfo) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  removeUserInfo() {
    localStorage.removeItem(USER_INFO_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout() {
    this.removeToken();
    this.removeUserInfo();
    window.location.href = '/login';
  },
};
