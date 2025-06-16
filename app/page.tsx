"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const loadTelegramSDK = async () => {
      const sdk = await import("@twa-dev/sdk");
      const webApp = sdk.default;

      const user = webApp?.initDataUnsafe?.user;
      if (user) {
        setUserData(user as UserData);

        // Send user data to backend
        await fetch("/api/save-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        })
          .then((res) => {
            console.log("✅ API Response Status:", res.status);
            return res.json();
          })
          .then((data) => {
            console.log("📥 API Response Data:", data);
          })
          .catch((err) => {
            console.error("❌ API Call Failed:", err);
          });
      }
    };

    loadTelegramSDK();
  }, []);

  return (
    <main className="p-4">
      {userData ? (
        <>
          <div className="bg-white rounded-xl p-4 shadow text-gray-800">
            <h2 className="text-xl font-semibold mb-2">
              👋 Hi {userData.first_name}!
            </h2>
            <p className="mb-2">We’ve saved your details. You are all set.</p>

            <div className="text-sm text-gray-600 mt-4">
              <p>
                <strong>Username:</strong> @{userData.username}
              </p>
              <p>
                <strong>Language:</strong> {userData.language_code}
              </p>
              {userData.is_premium && (
                <p className="text-green-600">
                  🌟 You’re a Premium Telegram user
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
