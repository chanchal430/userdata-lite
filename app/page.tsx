"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadTelegramSDK = async () => {
      const sdk = await import("@twa-dev/sdk");
      const webApp = sdk.default;

      webApp.ready(); // notify telegram mini app is ready
      webApp.expand(); // Expand to full height;

      // set telegram theme colors
      document.body.style.backgroundColor =
        webApp.themeParams.bg_color || "#ffffff";

      // Detect dark mode
      if (webApp.colorScheme === "dark") {
        document.body.classList.add("dark");
      }

      const user = webApp?.initDataUnsafe?.user;
      if (user) {
        setUserData(user as UserData);

        if (user.id) {
          fetch(`/api/user-photo?id=${user.id}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.url) setPhotoUrl(data.url);
            })
            .catch((err) => console.error("Photo fetch error:", err));
        }

        webApp.MainButton.setText("Get Started");
        webApp.MainButton.show();

        webApp.MainButton.onClick(() => {
          webApp.HapticFeedback.notificationOccurred("success");

          alert("Congrats! you clciked the main button");

          // webApp.MainButton.hide(); // Optional: hide after click
        });

        // Send user data to backend
        await fetch("/api/save-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        })
          .then((res) => {
            console.log("API Response Status:", res.status);
            return res.json();
          })
          .then((data) => {
            console.log("API Response Data:", data);
          })
          .catch((err) => {
            console.error("API Call Failed:", err);
          });
      }
    };

    loadTelegramSDK();
  }, []);

  return (
    <main className="p-4">
      {userData ? (
        <div className="bg-white rounded-xl p-4 shadow text-gray-800">
          <h2 className="text-xl font-semibold mb-2">
            👋 Hi {userData.first_name}!
          </h2>

          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="Profile"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full mb-4 border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mb-4 border bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              No Photo
            </div>
          )}

          <p className="mb-2">Welcome!</p>
          <p className="text-sm text-gray-500">@{userData.username}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
