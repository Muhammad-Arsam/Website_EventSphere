"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/alert/Alert";
import { authService } from "@/api/authService";
import { setToken } from '@/utils/token';

export default function SignUpForm() {
  const router = useRouter();

  // Step Management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Alert & Error States
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form Data States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // Step 3 Data States
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [cnic, setCnic] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [pass, setPass] = useState("");
  const [roleSelection, setRoleSelection] = useState(""); // Default empty to force selection

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // --- Helpers ---
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // --- Handlers ---
  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);
    try {
      const response = await authService.initiateSignup({ email });
      setAlert({ variant: "success", title: "OTP Sent", message: response.message || "Please check your email." });
      setStep(2);
    } catch (error: any) {
      const message = error.message || "Failed to send OTP.";
      setAlert({ variant: "error", title: "Error", message });
    } finally {
      setLoading(false);
    }
  };

 const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);
    try {
      const token = await authService.verifySignup({ email, otp });
      setToken(token); 

      setAlert({ 
        variant: "success", 
        title: "Verified", 
        message: "OTP verified successfully. Please complete your profile." 
      });
      
      setStep(3);
    } catch (error: any) {
      const message = error.message || "Invalid OTP code.";
      setAlert({ variant: "error", title: "Verification Failed", message });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setFieldErrors({});

    // 1. Frontend Validation
    const errors: Record<string, string> = {};
    if (!roleSelection) errors.role = "Role is required";
    if (!fullName) errors.fullName = "Name is required";
    if (!username) errors.username = "Username is required";
    if (!cnic || cnic.length !== 13) errors.cnic = "CNIC must be exactly 13 characters";
    if (!phoneNo || phoneNo.length !== 11) errors.phoneNo = "Phone Number should be exactly 11 characters";
    if (!pass) errors.pass = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!isChecked) {
      setAlert({ variant: "warning", title: "Terms required", message: "You must agree to the Terms and Conditions." });
      return;
    }

    setLoading(true);

    const userRole = roleSelection === "Organise an event" ? "ORGANIZER" : "ATTENDEE";

    try {
      // 🟢 FIX: Map frontend state variables directly to the backend's exact required keys
      const response = await authService.completeSignup({
        name: fullName,
        username: username,
        cnic: cnic,
        phoneNo: phoneNo,
        password: pass,
        role: userRole,
      });
      
      setAlert({ variant: "success", title: "Success!", message: "Account created successfully. Redirecting..." });
      
      setTimeout(() => {
        router.push("/signin");
      }, 2000);

    } catch (error: any) {
      if (error.response?.data?.invalidFields) {
        const backendErrors = error.response.data.invalidFields;
        setFieldErrors({
          role: backendErrors.role || "",
          fullName: backendErrors.name || "",
          cnic: backendErrors.cnic || "",
          phoneNo: backendErrors.phoneNo || "",
          pass: backendErrors.password || "",
        });
        setAlert({ variant: "error", title: "Validation Failed", message: "Please fix the highlighted fields." });
      } else {
        const backendMessage = error.response?.data?.detail || "Failed to complete registration.";
        setAlert({ variant: "error", title: "Signup Failed", message: backendMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1 && "Enter your email to receive an OTP."}
              {step === 2 && "Enter the OTP sent to your email."}
              {step === 3 && "Complete your profile details to finish sign up."}
            </p>
          </div>

          {alert && (
            <div className="mb-5">
              <Alert variant={alert.variant} title={alert.title} message={alert.message} />
            </div>
          )}

          <div>
            {/* --- STEP 1: Email --- */}
            {step === 1 && (
              <form onSubmit={handleInitiate}>
                <div className="space-y-5">
                  <div>
                    <Label>Email<span className="text-error-500">*</span></Label>
                    <Input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* --- STEP 2: Verify OTP --- */}
            {step === 2 && (
              <form onSubmit={handleVerify}>
                <div className="space-y-5">
                  <div>
                    <Label>OTP Code<span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      required
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-brand-500 hover:underline text-center w-full"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            {/* --- STEP 3: Complete Details --- */}
            {step === 3 && (
              <form onSubmit={handleComplete}>
                <div className="space-y-4">
                  
                  {/* BEAUTIFIED ROLE DROPDOWN */}
                  <div className="flex flex-col">
                    <Label>What do you want to do?<span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <select
                        value={roleSelection}
                        onChange={(e) => {
                          setRoleSelection(e.target.value);
                          clearFieldError("role");
                        }}
                        className={`w-full appearance-none rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:bg-gray-900 dark:text-white/90 ${
                          fieldErrors.role ? "border-error-500" : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <option value="" disabled>Select your role</option>
                        <option value="Attend an event">Attend an event</option>
                        <option value="Organise an event">Organise an event</option>
                      </select>
                      <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    {fieldErrors.role && <span className="mt-1 text-xs text-error-500">{fieldErrors.role}</span>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <Label>Full Name<span className="text-error-500">*</span></Label>
                      <Input
                        type="text"
                        placeholder="Enter full name"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); clearFieldError("fullName"); }}
                        className={fieldErrors.fullName ? "border-error-500" : ""}
                      />
                      {fieldErrors.fullName && <p className="mt-1 text-xs text-error-500">{fieldErrors.fullName}</p>}
                    </div>
                    <div className="sm:col-span-1">
                      <Label>Username<span className="text-error-500">*</span></Label>
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); clearFieldError("username"); }}
                        className={fieldErrors.username ? "border-error-500" : ""}
                      />
                      {fieldErrors.username && <p className="mt-1 text-xs text-error-500">{fieldErrors.username}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <Label>CNIC<span className="text-error-500">*</span></Label>
                      <Input
                        type="number"
                        placeholder="e.g. 4210112345671"
                        value={cnic}
                        onChange={(e) => { setCnic(e.target.value); clearFieldError("cnic"); }}
                        className={fieldErrors.cnic ? "border-error-500" : ""}
                      />
                      {fieldErrors.cnic && <p className="mt-1 text-xs text-error-500">{fieldErrors.cnic}</p>}
                    </div>
                    <div className="sm:col-span-1">
                      <Label>Phone No<span className="text-error-500">*</span></Label>
                      <Input
                        type="number"
                        placeholder="e.g. 03001234567"
                        value={phoneNo}
                        onChange={(e) => { setPhoneNo(e.target.value); clearFieldError("phoneNo"); }}
                        className={fieldErrors.phoneNo ? "border-error-500" : ""}
                      />
                      {fieldErrors.phoneNo && <p className="mt-1 text-xs text-error-500">{fieldErrors.phoneNo}</p>}
                    </div>
                  </div>

                  <div>
                    <Label>Password<span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        value={pass}
                        onChange={(e) => { setPass(e.target.value); clearFieldError("pass"); }}
                        className={fieldErrors.pass ? "border-error-500" : ""}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                    {fieldErrors.pass && <p className="mt-1 text-xs text-error-500">{fieldErrors.pass}</p>}
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <Checkbox
                      className="w-5 h-5"
                      checked={isChecked}
                      onChange={setIsChecked}
                    />
                    <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                      I agree to the{" "}
                      <span className="text-gray-800 dark:text-white/90">Terms and Conditions</span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={loading}
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                    >
                      {loading ? "Completing Sign Up..." : "Complete Sign Up"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}