"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    const loadTelegramSDK = async () => {
      const sdk = await import("@twa-dev/sdk");
      const webApp = sdk.default;

      webApp.ready();
      webApp.expand();

      document.body.style.backgroundColor =
        webApp.themeParams.bg_color || "#ffffff";

      if (webApp.colorScheme === "dark") {
        document.body.classList.add("dark");
      }

      const user = webApp?.initDataUnsafe?.user;
      if (user) {
        setUserData(user as UserData);

        if (user.id) {
          fetch("/api/user-photo?id=${user.id}")
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
          alert("Congrats! you clicked the main button");
        });

        await fetch("/api/save-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        }).catch((err) => {
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

          <div className="mt-6 flex flex-col gap-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => router.push("/gaming")}
            >
              🎮 Gaming
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md"
              onClick={() => router.push("/tasks")}
            >
              ✅ Tasks
            </button>
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded-md"
              onClick={() => router.push("/profile")}
            >
              🙍‍♂️ Profile
            </button>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
