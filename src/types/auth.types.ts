export interface BaseAuthResponse {
  status: string;
  message: string;
}

export interface User {
  userId: string;
  fullName: string;
  username: string;
  cnic: string;
  email: string;
  phoneNo: string;
  userRole: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CompleteSignupResponse {
  token: string;
  role: string;
}

export interface InitiateSignupPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface CompleteSignupPayload {
  name: string;
  username: string;
  password: string;
  cnic: string;
  phoneNo: string;
  role: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
}

export interface ForgotPasswordInitiatePayload {
  email: string;
}

export interface ForgotPasswordVerifyPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}