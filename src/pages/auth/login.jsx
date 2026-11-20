import AuthContainer from "./components/container";
import LoginForm from "@/features/auth/components/login-form";
import useAuthPage from "./use-auth-page";

const LoginPage = () => {
  const { switchView, signIn, location } = useAuthPage();

  return (
    <AuthContainer
      title="Welcome back"
      description="Sign in to plan trips with Turtle and pick up where you left off."
    >
      <LoginForm
        onAuthenticated={(tokens) => signIn(tokens)}
        onSwitchView={switchView}
        successMessage={location.state?.message}
      />
    </AuthContainer>
  );
};

export default LoginPage;
