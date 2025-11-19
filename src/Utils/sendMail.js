import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { Html, Head, Preview, Body, Container, Heading, Text, Section } from "@react-email/components";
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

const OtpEmail = ({ fullname, otp }) => (
  <Html>
    <Head />
    <Preview>Your OpenTask login code</Preview>
    <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", padding: "40px" }}>
      <Container style={{ maxWidth: "600px", margin: "0 auto", background: "white", borderRadius: "12px", overflow: "hidden" }}>
        <Section style={{ background: "#32a852", color: "white", padding: "30px", textAlign: "center" }}>
          <Heading as="h1">OpenTask</Heading>
        </Section>
        <Section style={{ padding: "40px 30px", textAlign: "center" }}>
          <Heading as="h2">Hello {fullname}!</Heading>
          <Text style={{ fontSize: "16px", color: "#555" }}>
            Your login verification code is:
          </Text>
          <div style={{
            fontSize: "36px",
            fontWeight: "bold",
            letterSpacing: "8px",
            padding: "20px",
            background: "#f0f0f0",
            borderRadius: "8px",
            display: "inline-block",
            margin: "20px 0"
          }}>
            {otp}
          </div>
          <Text style={{ color: "#888", fontSize: "14px" }}>
            This code expires in 5 minutes.<br />
            If you didn’t request this, ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export async function sendMail({ to, subject = "Your OpenTask OTP Code", fullname, otp }) {
  if (!to || !otp) throw createHttpError(400, "Missing required fields");

  const transporter = await getTransporter();
  const emailHtml = await render(<OtpEmail fullname={fullname || "there"} otp={otp} />);

  await transporter.sendMail({
    from: `"OpenTask" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailHtml,
  });

  return { success: true, message: "Email sent!" };
}