import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendMail } from "@/Utils/sendMail";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await DBconnect();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ message: "Account email unverified" }, { status: 403 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    user.otp = otpCode;
    user.otpExpires = otpExpiry;
    await user.save();

    // Send OTP using reusable sendMail utility
    await sendMail({
      to: user.email,
      type: "otp",
      fullname: user.fullName || user.email.split("@")[0], // nicer fallback
      otp: otpCode,
    });

    return NextResponse.json(
      { message: "OTP sent to your email", email: user.email },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login OTP error:", err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
