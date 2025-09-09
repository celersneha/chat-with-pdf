"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import axios from "axios";

export default function RegisterUserOnSignIn() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/register-user`,
        {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
        }
      );
    }
  }, [isSignedIn, user]);

  return null;
}
