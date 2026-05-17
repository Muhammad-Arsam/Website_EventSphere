import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventsphere SignIn Page",
  description: "This is the signin page for the Eventsphere application",
};

export default function SignIn() {
  return <SignInForm />;
}
