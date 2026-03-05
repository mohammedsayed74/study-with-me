import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [hasSeen, setHasSeen] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      await AsyncStorage.removeItem("hasSeenOnboarding"); //m7tag yt4al b3d el testing
      const value = await AsyncStorage.getItem("hasSeenOnboarding");

      setHasSeen(value === "true");
    };

    checkOnboarding();
  }, []);

  if (hasSeen === null) return null;

  return hasSeen ? (
    <Redirect href="/auth/login" />
  ) : (
    <Redirect href="/onboarding" />
  );
}
