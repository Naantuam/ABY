import { Loader2 } from "lucide-react";

export default function AuthButton({ label, children, isLoading, disabled, ...props }) {
  return (
    <button
      className="w-full h-12 bg-sky-200 hover:bg-blue-800 text-white text-lg font-bold font-mono flex items-center justify-center rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          {label || children}
        </>
      ) : (
        label || children
      )}
    </button>
  );
}
