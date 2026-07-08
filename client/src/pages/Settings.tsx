import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import * as authApi from "../api/auth.api";
import { apiErrorMessage } from "../api/axios";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useAuthStore } from "../store/auth.store";

// Profile Zod Schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
});
type ProfileForm = z.infer<typeof profileSchema>;

// Password Zod Schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords must match",
    path: ["confirmNewPassword"],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

export function Settings() {
  const navigate = useNavigate();
  const { user, setUser, clear } = useAuthStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Setup Profile Form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  // Setup Password Form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // Handle Profile Update
  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  // Handle Password Update
  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully!");
      resetPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      clear();
      toast.success("Your account has been deleted");
      navigate("/login");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="px-11 py-9 max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold m-0 mb-[6px] tracking-[-0.02em]">Settings</h1>
        <p className="m-0 text-text-gray text-[14.5px]">
          Manage your account settings, credentials, and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <Card className="p-6">
          <h2 className="text-base font-bold m-0 mb-1 tracking-[-0.01em]">Profile Information</h2>
          <p className="m-0 mb-6 text-text-gray text-xs">
            Update your account name and email address.
          </p>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-4 max-w-[480px]" noValidate>
            <Input
              label="Full Name"
              error={profileErrors.name?.message}
              {...regProfile("name")}
            />
            <Input
              label="Email Address"
              type="email"
              error={profileErrors.email?.message}
              {...regProfile("email")}
            />
            <div className="mt-2">
              <Button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="p-6">
          <h2 className="text-base font-bold m-0 mb-1 tracking-[-0.01em]">Change Password</h2>
          <p className="m-0 mb-6 text-text-gray text-xs">
            Ensure your account is using a long, secure password.
          </p>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-4 max-w-[480px]" noValidate>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.currentPassword?.message}
              {...regPassword("currentPassword")}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              error={passwordErrors.newPassword?.message}
              {...regPassword("newPassword")}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              error={passwordErrors.confirmNewPassword?.message}
              {...regPassword("confirmNewPassword")}
            />
            <div className="mt-2">
              <Button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone Card */}
        <Card className="p-6 border-red-200 bg-red-50/10">
          <h2 className="text-base font-bold m-0 mb-1 text-[#DC2626] tracking-[-0.01em]">Danger Zone</h2>
          <p className="m-0 mb-6 text-text-gray text-xs">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <div>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} width={440}>
        <div className="text-lg font-bold mb-1">Delete your account?</div>
        <p className="text-[13.5px] text-text-gray mt-0 mb-6 leading-relaxed">
          Are you sure you want to delete your account? All of your saved resumes, cover letters, and data will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-[10px] justify-end">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void handleDeleteAccount()} disabled={deleting}>
            {deleting ? "Deleting..." : "Permanently Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
