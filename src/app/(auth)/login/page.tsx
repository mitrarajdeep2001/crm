import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
      {/* Login Card */}
      <LoginForm />

      {/* Footer links */}
      {/* <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Need access?{" "}
          <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Request a workspace
          </a>
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          {["Privacy", "Terms", "Status", "Support"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[10px] font-medium tracking-wider text-gray-400 uppercase hover:text-gray-600 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div> */}
    </div>
  );
}
