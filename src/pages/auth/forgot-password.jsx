import AuthContainer from "./components/container";
import ForgotPasswordForm from "@/features/auth/components/forgot-password-form";
import useAuthPage from "./use-auth-page";

const ForgotPasswordPage = () => {
  const { switchView } = useAuthPage();

  return (
    <AuthContainer
      title="Reset your password"
      description="Enter your email and we will send reset instructions."
    >
      <ForgotPasswordForm onSwitchView={switchView} />
    </AuthContainer>
  );
};

export default ForgotPasswordPage;
