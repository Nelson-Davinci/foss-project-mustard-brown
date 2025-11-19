import { NextResponse } from "next/server";
import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await DBconnect();
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otpCode;
    user.otpExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"OpenTask" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your OTP Code",
      html: `<div style="font-family:Arial,sans-serif;padding:20px">
          <h1 style="background:#f5f5f5;display:inline-block;padding:10px 20px;border-radius:8px;">${otpCode}</h1>
          <p>This code will expire in <b>5 minutes</b>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "OTP resent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend OTP error:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
