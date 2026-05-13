const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ORG_ID_KEY = 'orgId'; 

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const setOrgId = (id: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORG_ID_KEY, id);
  }
};

export const getOrgId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ORG_ID_KEY);
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ORG_ID_KEY);
  }
};