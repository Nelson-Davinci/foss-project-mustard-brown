"use client";
import React, { useState } from "react";
import Image from "next/image";
import { MdOutlineMail } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      Swal.fire({ 
        icon: "error", 
        title: "Email Required", 
        text: "Please enter your email address." 
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Swal.fire({ 
        icon: "error", 
        title: "Invalid Email", 
        text: "Please enter a valid email address." 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("📤 Sending request with email:", email);
      
      const response = await axios.post("/api/forgot-password", { 
        email: email.trim() 
      });

      console.log("✅ Response:", response.data);

      // Success!
      Swal.fire({
        icon: "success",
        title: "Check Your Email 📧",
        html: `
          <p class="text-sm">We've sent a password reset link to</p>
          <p class="font-semibold text-purple-600">${email}</p>
          <p class="text-xs mt-2 text-gray-600">Click the link in the email to reset your password.</p>
          <p class="text-xs mt-2 text-gray-500">The link expires in 15 minutes.</p>
        `,
        timer: 6000,
        showConfirmButton: true,
        confirmButtonColor: "#9f00ff",
      });

      // Clear input on success
      setEmail("");

    } catch (error) {
      console.error("❌ Error:", error);
      console.error("Error response:", error.response?.data);

      // Handle different error cases
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      const statusCode = error.response?.status;

      if (statusCode === 404) {
        // Email not found
        Swal.fire({
          icon: "error",
          title: "Not Found",
          text: "No account found with that email address.",
          confirmButtonColor: "#f2521e",
        });
      } else if (statusCode === 400) {
        // Validation error
        Swal.fire({
          icon: "error",
          title: "Invalid Input",
          text: errorMessage,
          confirmButtonColor: "#f2521e",
        });
      } else {
        // Server error or network issue
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: errorMessage,
          confirmButtonColor: "#f2521e",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center py-16 px-4 md:px-10 bg-gradient-to-br from-purple-50 to-orange-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm w-full shadow-2xl rounded-xl p-8 bg-white"
      >
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <Image
            src="/Copilot_20251014_120138.png"
            alt="OpenTask Logo"
            width={80}
            height={80}
            className=""
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password?</h1>
        <p className="text-center text-gray-600 text-xs mb-6">
          No worries! Enter your email and we'll send you reset instructions.
        </p>

        {/* Email Input */}
        <div className="relative mb-6 text-sm">
          <MdOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full h-10 pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9f00ff]/50 transition"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full h-10 text-xs rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3
            ${isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] hover:shadow-xl transform hover:scale-[1.02]"
            }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <Link href="/Login" className="text-xs text-[#f2521e] hover:underline font-medium">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}