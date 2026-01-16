interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export default function Button({
  label,
  variant = "primary",
  onClick,
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      : "bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300";

  return (
    <button onClick={onClick} className={styles}>
      {label}
    </button>
  );
}
