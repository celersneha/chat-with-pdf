"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./Loading";

const RouteLoadingIndicator = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // @ts-ignore
    const handleStart = () => setLoading(true);
    // @ts-ignore
    const handleComplete = () => setLoading(false);

    // @ts-ignore
    router.events?.on("routeChangeStart", handleStart);
    // @ts-ignore
    router.events?.on("routeChangeComplete", handleComplete);
    // @ts-ignore
    router.events?.on("routeChangeError", handleComplete);

    return () => {
      // @ts-ignore
      router.events?.off("routeChangeStart", handleStart);
      // @ts-ignore
      router.events?.off("routeChangeComplete", handleComplete);
      // @ts-ignore
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  if (!loading) return null;
  return <Loading />;
};

export default RouteLoadingIndicator;
