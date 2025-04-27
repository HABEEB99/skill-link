import { useAuth } from "../../hooks/use-auth";
import Button from "../ui/button";
import Input from "../ui/input";

export default function AuthForm() {
  const { register, handleSubmit, errors, isSignUp, setIsSignUp } = useAuth();

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isSignUp ? "Sign Up" : "Login"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
          })}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={errors.password?.message}
        />
        {errors.root && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}
        <Button type="submit" className="w-full">
          {isSignUp ? "Sign Up" : "Login"}
        </Button>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 hover:underline w-full text-center"
        >
          {isSignUp
            ? "Already have an account? Login"
            : "Need an account? Sign Up"}
        </button>
      </form>
    </div>
  );
}
