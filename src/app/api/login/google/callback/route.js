// app/api/login/google/callback/route.js
import { google } from "googleapis";
import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import { generateAccessToken } from "@/Utils/generateToken";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/login/google/callback`
);

// ✓ CORRECT: Use NAMED export "GET" instead of default export
export async function GET(req) {
  await DBconnect();

  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return Response.redirect("/Login?error=access_denied");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    let user = await UserModel.findOne({ email: data.email });

    if (!user) {
      user = await new UserModel({
        fullName: data.name || data.email.split("@")[0],
        email: data.email,
        googleId: data.id,
        isVerified: data.verified_email || true,
        avatar: data.picture,
      });
      await user.save();
    }

    const token = generateAccessToken({ id: user._id });

    const redirectUrl = new URL("/Dashboard", process.env.NEXT_PUBLIC_BASE_URL);

    return new Response(
      `<script>
        document.cookie = "authToken=${token}; path=/; max-age=31536000; Secure; SameSite=Lax";
        window.location.href = "${redirectUrl}";
      </script>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Google OAuth Error:", error.message);
    return Response.redirect("/Login?error=google_failed");
  }
}