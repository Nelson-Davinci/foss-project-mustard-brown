import UserModel from "@/Models/User";
import DBconnect from "@/Utils/DBconnect";
import { NextResponse } from "next/server";
import { generateAccessToken } from "@/Utils/generateToken"; // Centralized utility

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    await DBconnect();

    const user = await UserModel.findOne({ email });
    if (!user || !user.otp) {
      return NextResponse.json({ message: "OTP not found" }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // ✅ OTP verified successfully
    const isFirstLogin = !user.lastLogin;

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generate token using your utility
    const token = generateAccessToken(
      { id: user._id, email: user.email },
      { expiresIn: "1d" }
    );

    // Response object
    const response = NextResponse.json(
      {
        success: true,
        message: "OTP Verified Successfully",
        email: user.email,
        token,
        isFirstLogin,
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
