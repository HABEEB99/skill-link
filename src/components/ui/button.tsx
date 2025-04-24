interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger";
}

const Button = ({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
      : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    />
  );
};

export default Button;
