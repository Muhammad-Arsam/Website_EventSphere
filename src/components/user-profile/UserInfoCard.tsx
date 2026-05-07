"use client";
import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { profileService } from "../../api/profileService";
import { UserProfile, UpdateProfileData } from "../../types/profile.types";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Setup the state for our editable fields
  const [formData, setFormData] = useState<UpdateProfileData>({
    email: "",
    phoneNo: "",
    password: "",
  });

  // Fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        
        // 2. Pre-fill the form with existing user data
        setFormData({
          email: data.email || "",
          phoneNo: data.phoneNo || "",
          password: "", // Keep password blank initially for security
        });
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 3. Handle typing in the input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Send the updated data to the backend
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing on form submit
    setIsSaving(true);
    
    try {
      console.log("Saving personal information...");
      await profileService.updateProfile(formData);

      closeModal();
      window.location.reload(); // Refresh to fetch and show the updated data
    } catch (error) {
      console.error("Failed to update profile info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Full Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile?.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Username
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile?.username || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile?.phoneNo || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  CNIC
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile?.cnic || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto shrink-0"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Phone</Label>
                  <Input 
                    type="text" 
                    name="phoneNo"
                    value={formData.phoneNo} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="col-span-2">
                  <Label>New Password (leave blank to keep current)</Label>
                  <Input 
                    type="password" 
                    name="password"
                    value={formData.password} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              {/* Added type="button" here so hitting "Close" doesn't submit the form */}
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm"  disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}