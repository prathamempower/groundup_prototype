import SignUpPage from "@/app/auth/sign-up/page";
import AuthLayout from "@/app/auth/layout";

export default function DirectSignUpPage() {
  return (
    <AuthLayout>
      <SignUpPage />
    </AuthLayout>
  );
}
