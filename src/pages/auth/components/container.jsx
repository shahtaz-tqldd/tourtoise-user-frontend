import { Link } from "react-router-dom";
import { Heading, Text } from "@/components/ui/typography";

/** Full-page frame for the standalone auth routes (/login, /register, …). */
const AuthContainer = ({ title, description, children }) => {
  return (
    <div className="min-h-dvh bg-brand-mist center px-5 py-8 md:px-8 md:py-12">
      <div className="w-full max-w-md">
        <div className="md:rounded-sheet md:bg-surface md:p-8 md:shadow-raised">
          <div className="mb-8">
            <Link to="/" aria-label="tourtoise home">
              <img src="/logo.png" alt="" className="mb-4 h-11 object-contain" />
            </Link>
            <Heading level={1}>{title}</Heading>
            {description && (
              <Text tone="subtle" className="mt-2">
                {description}
              </Text>
            )}
          </div>
          {children}
        </div>
        <p className="mt-6 text-center text-caption text-faint">
          <Link to="/" className="font-semibold hover:text-primary">
            ← Keep exploring destinations
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthContainer;
