export interface UserProfile {
  name: string;
  username: string;
  cnic: string;
  email: string;
  profilePic: string;
  phoneNo: string;
  createdAt: string;
  modifiedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  phoneNo?: string;
  profilePic?: File; 
}