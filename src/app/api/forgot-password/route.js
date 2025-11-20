// POST /api/forgot-password
import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendMail } from "@/Utils/sendMail";

export async function POST(req) {
  try {
    await DBconnect();
    const { email } = await req.json();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Account does not exist" },
        { status: 404 }
      );
    }
    
    // Generate JWT token for password reset
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Save token and expiry to user record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    await sendMail({
      to: user.email,
      type: "resetPassword",
      fullname: user.fullName || user.email.split("@")[0],
      link: resetUrl,
    });

    // Return success response
    return NextResponse.json(
      { message: "If that email is registered, a reset link has been sent." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}