function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
}) {
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white",
    secondary:
      "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger:
      "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-4 py-2
        rounded-xl
        font-medium
        transition
        shadow-sm
        ${styles[variant]}
      `}
    >
      {children}
    </button>
  );
}

export default Button;