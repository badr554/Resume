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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(res.user, res.accessToken);
      toast.success("Welcome to ResumeAI!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-sans text-text-dark px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-[10px] mb-7">
          <div className="w-[34px] h-[34px] rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-[15px]">
            R
          </div>
          <span className="font-bold text-[19px] tracking-[-0.01em]">ResumeAI</span>
        </div>

        <Card className="p-7">
          <h1 className="text-[22px] font-bold m-0 mb-1 tracking-[-0.02em]">Create your account</h1>
          <p className="m-0 mb-6 text-text-gray text-[14px]">
            Build AI-powered resumes that pass ATS systems.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label="Full Name"
              placeholder="Sarah Chen"
              error={errors.name?.message}
              {...register("name")}
            />
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
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button type="submit" fullWidth disabled={isSubmitting} className="py-3">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-[13.5px] text-text-gray mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold no-underline hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
