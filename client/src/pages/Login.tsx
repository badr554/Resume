import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import * as authApi from "../api/auth.api";
import { apiErrorMessage } from "../api/axios";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/auth.store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login({ email: data.email, password: data.password });
      setAuth(res.user, res.accessToken);
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-sans text-text-dark px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-[10px] mb-7">
          <div className="w-[34px] h-[34px] rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-[15px]">
            R
          </div>
          <span className="font-bold text-[19px] tracking-[-0.01em]">ResumeAI</span>
        </div>

        <Card className="p-7">
          <h1 className="text-[22px] font-bold m-0 mb-1 tracking-[-0.02em]">Welcome back</h1>
          <p className="m-0 mb-6 text-text-gray text-[14px]">
            Log in to keep building resumes that get interviews.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <label className="flex items-center gap-2 text-[13px] text-[#334155] cursor-pointer select-none">
              <input type="checkbox" className="accent-[#3B82F6]" {...register("rememberMe")} />
              Remember me
            </label>
            <Button type="submit" fullWidth disabled={isSubmitting} className="py-3">
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-[13.5px] text-text-gray mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary font-semibold no-underline hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
