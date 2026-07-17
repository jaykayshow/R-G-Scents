"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToastStore } from "@/lib/store/toast-store";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.currentUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const showToast = useToastStore((s) => s.show);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  async function onProfileSubmit(values: ProfileValues) {
    const result = await updateProfile(values);
    showToast(result.message, result.success ? "success" : "error");
  }

  async function onPasswordSubmit(values: PasswordValues) {
    const result = await changePassword(values.currentPassword, values.newPassword);
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) passwordForm.reset();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);
    setDeleteModalOpen(false);
    if (result.success) {
      showToast(result.message, "info");
      router.push("/");
    } else {
      showToast(result.message, "error");
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-10">
      <Card className="p-6">
        <h2 className="mb-6 font-serif text-xl text-fg">Profile Information</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" error={profileForm.formState.errors.firstName?.message} {...profileForm.register("firstName")} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" error={profileForm.formState.errors.lastName?.message} {...profileForm.register("lastName")} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" error={profileForm.formState.errors.email?.message} {...profileForm.register("email")} />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...profileForm.register("phone")} />
          </div>
          <Button type="submit" disabled={profileForm.formState.isSubmitting}>
            {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-6 font-serif text-xl text-fg">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register("currentPassword")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register("confirmPassword")}
              />
            </div>
          </div>
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>

      <Card className="border-red-500/20 p-6">
        <h2 className="mb-2 font-serif text-xl text-red-300">Delete Account</h2>
        <p className="mb-4 text-sm text-overlay/50">
          This will permanently delete your account and personal data in accordance with the Nigeria
          Data Protection Act (NDPA). Order history may be retained for legal/tax purposes as required
          by law.
        </p>
        <Button variant="secondary" className="border-red-400/50 text-red-300 hover:bg-red-400 hover:text-ink" onClick={() => setDeleteModalOpen(true)}>
          Delete My Account
        </Button>
      </Card>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="text-center">
          <AlertTriangle size={36} className="mx-auto text-red-400" />
          <h3 className="mt-4 font-serif text-xl text-fg">Delete Your Account?</h3>
          <p className="mt-2 text-sm text-overlay/60">
            This action cannot be undone. Type <span className="text-fg">DELETE</span> to
            confirm.
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="mt-4"
          />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={confirmText !== "DELETE" || deleting}
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
