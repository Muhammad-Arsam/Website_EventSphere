import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventsphere SignUp Page",
  description: "This is the signup page for the Eventsphere application",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
