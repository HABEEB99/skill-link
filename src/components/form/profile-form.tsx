import { useForm } from "react-hook-form";

import toast from "react-hot-toast";
import { useStore } from "../../hooks/use-store";
import { useProfile } from "../../hooks/use-profile";
import { ProfileFormData } from "../../types";
import { useEffect } from "react";
import { supabase } from "../../supabase-client";
import Input from "../ui/input";
import Textarea from "../ui/textarea";
import Button from "../ui/button";

export default function ProfileForm() {
  const { session } = useStore();
  const { profile, fetchProfile } = useProfile(session?.user.id || "");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: { name: "", location: "", bio: "" },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        location: profile.location || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!session) return;

    try {
      let photoPath = profile?.photo_url || "";

      if (data.photo?.[0]) {
        const file = data.photo[0];
        console.log(
          "Uploading profile photo:",
          file.name,
          "Size:",
          file.size,
          "Type:",
          file.type
        ); // Debug

        // Validate file
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
          throw new Error(
            "Invalid file type. Please upload a PNG or JPEG image."
          );
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          throw new Error("File size exceeds 5MB limit.");
        }

        const filePath = `${session.user.id}/${Date.now()}_${file.name.replace(
          /[^a-zA-Z0-9.]/g,
          "_"
        )}`; // Sanitize path
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(filePath, file, { upsert: true });
        if (uploadError) {
          console.error("Storage upload error:", uploadError); // Debug
          if ((uploadError as any).statusCode === "400") {
            toast.error(
              "Invalid upload request. Please try a different image."
            );
          } else if ((uploadError as any).statusCode === "403") {
            toast.error(
              "Unauthorized to upload image. Please check storage permissions."
            );
          } else {
            toast.error(`Upload failed: ${uploadError.message}`);
          }
          // Continue without image
          console.log("Proceeding without profile photo due to upload failure"); // Debug
        } else {
          const { data: urlData } = supabase.storage
            .from("profile-photos")
            .getPublicUrl(filePath);
          photoPath = urlData.publicUrl;
          console.log("Profile photo URL:", photoPath); // Debug
        }
      }

      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        name: data.name,
        location: data.location,
        bio: data.bio,
        photo_url: photoPath,
      });
      if (error) throw error;

      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (error: any) {
      console.error("Profile update error:", error); // Debug
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />
        <Input
          label="Location"
          {...register("location", { required: "Location is required" })}
          error={errors.location?.message}
        />
        <Textarea
          label="Bio"
          {...register("bio")}
          error={errors.bio?.message}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Photo
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("photo")}
            className="mt-1 block w-full"
          />
          {profile?.photo_url && (
            <img
              src={profile.photo_url}
              alt="Profile"
              className="mt-2 w-32 h-32 rounded-full"
            />
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
