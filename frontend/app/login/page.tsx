import LoginPage from "@/app/auth/login/page";
import AuthLayout from "@/app/auth/layout";

export default function DirectLoginPage() {
  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  );
}
