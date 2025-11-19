// src/Utils/sendMail.js
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from "@react-email/components";
import createHttpError from "http-errors";

let transporter = null;

const getTransporter = async () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.verify();
  }
  return transporter;
};

// Reusable Email Layout (beautiful for all emails)
const EmailLayout = ({ children, preview }) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f9fc", padding: "40px 0" }}>
      <Container style={{ maxWidth: "600px", margin: "0 auto", background: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Section style={{ background: "#32a852", padding: "30px", textAlign: "center" }}>
          <Heading as="h1" style={{ color: "white", margin: 0, fontSize: "28px" }}>OpenTask</Heading>
        </Section>
        <Section style={{ padding: "40px 40px" }}>
          {children}
        </Section>
        <Hr style={{ borderColor: "#e6ebf1", margin: "30px 40px" }} />
        <Section style={{ padding: "0 40px 40px", textAlign: "center", color: "#8898aa", fontSize: "12px" }}>
          <Text style={{ margin: 0 }}>
            © 2025 OpenTask. All rights reserved.<br />
            If you didn’t request this, please ignore it.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Different email types
export const emailTemplates = {
  otp: ({ fullname, otp }) => (
    <EmailLayout preview="Your OpenTask login code">
      <Heading as="h2">Hello {fullname}!</Heading>
      <Text style={{ fontSize: "16px", color: "#555" }}>Your verification code is:</Text>
      <div style={{
        fontSize: "38px",
        fontWeight: "bold",
        letterSpacing: "10px",
        padding: "20px",
        background: "#f0f8f0",
        border: "2px dashed #32a852",
        borderRadius: "12px",
        textAlign: "center",
        margin: "25px 0"
      }}>
        {otp}
      </div>
      <Text>This code expires in 5 minutes.</Text>
    </EmailLayout>
  ),

  verify: ({ fullname, link }) => (
    <EmailLayout preview="Verify your OpenTask account">
      <Heading as="h2">Welcome, {fullname}!</Heading>
      <Text>Click the button below to verify your email and activate your account:</Text>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Button href={link} style={{
          background: "#32a852",
          color: "white",
          padding: "14px 32px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          textDecoration: "none"
        }}>
          Verify Email
        </Button>
      </div>
    </EmailLayout>
  ),

  resetPassword: ({ fullname, link }) => (
    <EmailLayout preview="Reset your OpenTask password">
      <Heading as="h2">Password Reset Request</Heading>
      <Text>Hi {fullname},</Text>
      <Text>We received a request to reset your password. Click below to set a new one:</Text>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Button href={link} style={{
          background: "#ff5a5f",
          color: "white",
          padding: "14px 32px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold"
        }}>
          Reset Password
        </Button>
      </div>
      <Text style={{ fontSize: "14px", color: "#888" }}>
        This link expires in 10 minutes.
      </Text>
    </EmailLayout>
  ),
};

// Universal sendMail function
export async function sendMail({ to, type = "otp", subject, ...props }) {
  if (!to || !type) throw createHttpError(400, "Email 'to' and 'type' are required");

  const template = emailTemplates[type];
  if (!template) throw createHttpError(400, `Email type "${type}" not supported`);

  const defaultSubjects = {
    otp: "Your OpenTask Login Code",
    verify: "Verify Your OpenTask Account",
    resetPassword: "Reset Your OpenTask Password",
  };

  const transporter = await getTransporter();
  const emailHtml = await render(template(props));

  await transporter.sendMail({
    from: `"OpenTask" <${process.env.EMAIL_USER}>`,
    to,
    subject: subject || defaultSubjects[type],
    html: emailHtml,
  });

  return { success: true, message: `Email (${type}) sent successfully!` };
}