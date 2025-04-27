import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../hooks/use-store";
import { Button, Textarea, Input } from "../../components";
import { supabase } from "../../supabase-client";
import { Post, PostFormData } from "../../types";

interface PostFormProps {
  post?: Post;
}

export default function PostForm({ post }: PostFormProps) {
  const { session } = useStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    defaultValues: {
      title: post?.title || "",
      description: post?.description || "",
      category: post?.category || "",
    },
  });
  const navigate = useNavigate();

  const onSubmit = async (data: PostFormData) => {
    if (!session) {
      toast.error("Please log in to save a post");
      return;
    }

    try {
      const {
        data: { session: refreshedSession },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !refreshedSession) {
        throw new Error("Failed to refresh session");
      }
      console.log("User ID:", refreshedSession.user.id);

      // Check and create profile if it doesn't exist
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("id", refreshedSession.user.id)
        .single();
      if (profileError || !profile) {
        console.log("Creating profile for user:", refreshedSession.user.id);
        const defaultName =
          refreshedSession.user.email?.split("@")[0] || "User";
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: refreshedSession.user.id,
            name: defaultName,
            location: "",
            bio: "",
            photo_url: null,
          });
        if (createProfileError) {
          console.error("Profile creation error:", createProfileError);
          throw new Error(
            `Failed to create profile: ${createProfileError.message}`
          );
        }
        console.log("Profile created with name:", defaultName);
      } else {
        console.log("Profile exists:", profile.name);
      }

      let imagePath = post?.image_url || "";
      if (data.image?.[0]) {
        const file = data.image[0];
        console.log(
          "Uploading image:",
          file.name,
          "Size:",
          file.size,
          "Type:",
          file.type
        );
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
          throw new Error(
            "Invalid file type. Please upload a PNG or JPEG image."
          );
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File size exceeds 5MB limit.");
        }

        const filePath = `${
          refreshedSession.user.id
        }/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file, { upsert: true });
        if (uploadError) {
          console.error(
            "Storage error:",
            uploadError,
            "Full error object:",
            JSON.stringify(uploadError, null, 2)
          );
          if (
            uploadError.message.includes("row-level security") ||
            (uploadError as any).status === 403
          ) {
            toast.error(
              "Unauthorized to upload image. Please check storage permissions."
            );
            console.log("Proceeding without image");
          } else {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
        } else {
          const { data: urlData } = supabase.storage
            .from("post-images")
            .getPublicUrl(filePath);
          imagePath = urlData.publicUrl;
          console.log("Image URL:", imagePath);
        }
      }

      const postData = {
        user_id: refreshedSession.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        image_url: imagePath || null,
      };
      console.log("Saving post:", postData);

      if (post) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", post.id)
          .eq("user_id", refreshedSession.user.id);
        if (updateError) throw updateError;
        toast.success("Post updated successfully");
      } else {
        const { error: insertError } = await supabase
          .from("posts")
          .insert(postData);
        if (insertError) throw insertError;
        toast.success("Post created successfully");
      }

      navigate("/");
    } catch (error: any) {
      console.error("Post save error:", error);
      toast.error(error.message || "Failed to save post");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {post ? "Edit Post" : "Create Skill Post"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          {...register("title", { required: "Title is required" })}
          error={errors.title?.message}
        />
        <Textarea
          label="Description"
          {...register("description", { required: "Description is required" })}
          error={errors.description?.message}
        />
        <Input
          label="Category"
          {...register("category", { required: "Category is required" })}
          error={errors.category?.message}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("image")}
            className="mt-1 block w-full"
          />
          {post?.image_url && (
            <img
              src={post.image_url}
              alt="Post"
              className="mt-2 w-32 h-32 object-cover"
            />
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
      </form>
    </div>
  );
}
