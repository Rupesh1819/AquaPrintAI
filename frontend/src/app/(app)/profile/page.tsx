"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useSessionStore } from "@/store/sessionStore";
import { AvatarUpload } from "@/components/auth/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/auth/route-guards";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  language: z.string().min(2, "Language is required"),
  country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { profile, setProfile } = useUserStore();
  const { session } = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      language: profile?.language || "en",
      country: profile?.country || "",
    }
  });

  useEffect(() => {
    if (profile) {
      setValue("full_name", profile.full_name || "");
      setValue("language", profile.language || "en");
      setValue("country", profile.country || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!session) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error("Failed to update profile");
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    if (!session) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ avatar_url: url })
      });
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error("Failed to update avatar url in backend");
    }
  };

  if (!profile || !session) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-on-surface">Your Profile</h1>
          <p className="text-on-surface-variant">Manage your personal information and settings</p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <AvatarUpload 
            userId={session.user.id} 
            url={profile.avatar_url || null} 
            onUpload={handleAvatarUpload} 
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 rounded-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" disabled={isLoading} {...register("full_name")} />
              {errors.full_name && <p className="text-sm text-error">{errors.full_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" disabled={isLoading} {...register("language")} />
                {errors.language && <p className="text-sm text-error">{errors.language.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" disabled={isLoading} {...register("country")} />
              </div>
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
