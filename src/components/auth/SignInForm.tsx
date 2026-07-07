"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { authService } from "@/api/authService";
import { organizationService } from "@/api/organizationService";
import { setToken, setRefreshToken, setRole, setOrgId } from "@/utils/token";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/alert/Alert";

export default function SignInForm() {
  const router = useRouter();

  // --- VIEW & STEP MANAGEMENT ---
  const [view, setView] = useState<"signin" | "forgotPassword">("signin");
  const [step, setStep] = useState(1); // 1: Initiate, 2: Verify, 3: Reset

  // --- SHARED STATE ---
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    key: number;
  } | null>(null);

  // --- SIGN IN STATE ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // --- FORGOT PASSWORD STATE ---
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- ERROR HANDLER ---
  const handleApiError = (err: any, fallbackMessage: string) => {
    let errorMessage = fallbackMessage;

    if (err?.message) {
      errorMessage = err.message;
    }
    else if (err?.response?.data) {
      const data = err.response.data;
      if (data.invalidFields && Object.keys(data.invalidFields).length > 0) {
        errorMessage = Object.values(data.invalidFields)[0] as string;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      }
    }

    setAlert({
      variant: "error",
      title: "Error",
      message: errorMessage,
      key: Date.now(),
    });
  };

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const response = await authService.login({ username, password });

      setToken(response.token);
      setRefreshToken(response.refreshToken);
      setRole(response.role);

      let targetPath = "/dashboard";
      let successMessage = "Welcome back! Redirecting to dashboard...";

      const userRole = response?.role || "";

      console.log("Login Response Role:", userRole);

      if (userRole.toLowerCase() === "attendee") {
        targetPath = "/attendee/explore";
        successMessage = "Welcome back! Redirecting to events...";
      } else if (userRole.toLowerCase() === "organizer") {
        try {
          const orgData = await organizationService.getMyOrganization();
          if (!orgData) {
            targetPath = "/create-organization";
            successMessage = "Login successful! Let's set up your workspace...";
          } else {
            setOrgId(orgData.id);
          }
        } catch (orgError: any) {
          if (orgError?.response?.status === 404) {
            targetPath = "/create-organization";
            successMessage = "Login successful! Let's set up your workspace...";
          } else {
            console.error("Failed to verify organization status:", orgError);
          }
        }
      }
      // For any other role (if exists), default to dashboard (or you can add a fallback)

      setAlert({
        variant: "success",
        title: "Login Successful",
        message: successMessage,
        key: Date.now()
      });

      setTimeout(() => {
        router.push(targetPath);
      }, 1500);

    } catch (err: any) {
      handleApiError(err, "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      await authService.forgotPasswordInitiate({ email });
      setAlert({
        variant: "success",
        title: "OTP Sent",
        message: "Please check your email for the verification code.",
        key: Date.now()
      });
      setStep(2);
    } catch (err: any) {
      handleApiError(err, "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const token = await authService.forgotPasswordVerify({ email, otp });
      setToken(token);

      setAlert({
        variant: "success",
        title: "Verified",
        message: "OTP verified. Please enter your new password.",
        key: Date.now()
      });
      setStep(3);
    } catch (err: any) {
      handleApiError(err, "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (newPassword !== confirmPassword) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Passwords do not match.",
        key: Date.now()
      });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ newPassword, confirmPassword });

      setAlert({
        variant: "success",
        title: "Password Reset",
        message: "Your password has been successfully reset. Please sign in.",
        key: Date.now()
      });

      // Switch back to login view after a short delay
      setTimeout(() => {
        setView("signin");
        setStep(1);
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
      }, 2000);
    } catch (err: any) {
      handleApiError(err, "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      {alert && (
        <Alert
          key={alert.key}
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
        />
      )}

      <div className="w-full h-6 max-w-md mx-auto mb-5 sm:pt-10">
        {view === "forgotPassword" && (
          <button
            onClick={() => {
              setView("signin");
              setStep(1);
              setAlert(null);
            }}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Back to Sign In
          </button>
        )}
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* --- SIGN IN VIEW --- */}
          {view === "signin" && (
            <>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Sign In
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your username and password to sign in!
                </p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <Label>Username <span className="text-error-500">*</span></Label>
                    <Input
                      placeholder="Enter your username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Password <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setView("forgotPassword")}
                      className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>

              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Don&apos;t have an account? {""}
                  <Link
                    href="/signup"
                    className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* --- FORGOT PASSWORD VIEW --- */}
          {view === "forgotPassword" && (
            <>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  {step === 1 && "Forgot Password"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "Reset Password"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step === 1 && "Enter your email to receive a password reset code."}
                  {step === 2 && `Enter the code we sent to ${email}`}
                  {step === 3 && "Create a new secure password for your account."}
                </p>
              </div>

              {step === 1 && (
                <form onSubmit={handleInitiate}>
                  <div className="space-y-6">
                    <div>
                      <Label>Email <span className="text-error-500">*</span></Label>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerify}>
                  <div className="space-y-6">
                    <div>
                      <Label>OTP Code <span className="text-error-500">*</span></Label>
                      <Input
                        placeholder="Enter the OTP"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleReset}>
                  <div className="space-y-6">
                    <div>
                      <Label>New Password <span className="text-error-500">*</span></Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <span
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showNewPassword ? <EyeIcon /> : <EyeCloseIcon />}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Password must be at least 8 characters and max 15 characters.
                      </p>
                    </div>

                    <div>
                      <Label>Confirm Password <span className="text-error-500">*</span></Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <span
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showConfirmPassword ? <EyeIcon /> : <EyeCloseIcon />}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Resetting..." : "Confirm Password Reset"}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Remember your password? {""}
                  <button
                    onClick={() => {
                      setView("signin");
                      setStep(1);
                      setAlert(null);
                    }}
                    className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}