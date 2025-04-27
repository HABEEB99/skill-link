import { useState } from "react";
import { useForm } from "react-hook-form";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import type { AuthFormData } from "../types";
import { useStore } from "./use-store";
import { supabase } from "../supabase-client";

// export const useAuth = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setError,
//   } = useForm<AuthFormData>({
//     defaultValues: { email: "", password: "" },
//   });
//   const [isSignUp, setIsSignUp] = useState(false);
//   const navigate = useNavigate();
//   const { setSession } = useStore();

//   const onSubmit = async (data: AuthFormData) => {
//     try {
//       if (isSignUp) {
//         const { data: authData, error } = await supabase.auth.signUp(data);
//         if (error) throw error;
//         toast.success("Check your email for confirmation!");
//         setSession(authData.session);
//       } else {
//         const { data: authData, error } =
//           await supabase.auth.signInWithPassword(data);
//         if (error) throw error;
//         setSession(authData.session);
//         navigate("/");
//         toast.success("Logged in successfully");
//       }
//     } catch (error: any) {
//       setError("root", { message: error.message || "Authentication failed" });
//       toast.error(error.message || "Authentication failed");
//     }
//   };

//   return {
//     register,
//     handleSubmit: handleSubmit(onSubmit),
//     errors,
//     isSignUp,
//     setIsSignUp,
//   };
// };

export const useAuth = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<AuthFormData>({
    defaultValues: { email: "", password: "" },
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { setSession } = useStore();

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isSignUp) {
        const { data: authData, error } = await supabase.auth.signUp(data);
        if (error) throw error;
        if (authData.user) {
          // Create profile automatically
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: authData.user.id,
              name: data.email.split("@")[0], // Default name
              location: "",
              bio: "",
              photo_url: "",
            });
          if (profileError) throw profileError;
        }
        toast.success("Check your email for confirmation!");
        setSession(authData.session);
      } else {
        const { data: authData, error } =
          await supabase.auth.signInWithPassword(data);
        if (error) throw error;
        setSession(authData.session);
        navigate("/");
        toast.success("Logged in successfully");
      }
    } catch (error: any) {
      setError("root", { message: error.message || "Authentication failed" });
      toast.error(error.message || "Authentication failed");
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSignUp,
    setIsSignUp,
  };
};
