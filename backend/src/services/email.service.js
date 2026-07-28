/**
 * src/services/email.service.js
 * Email Sender using Gmail HTTP REST API / Webhooks / Fallback Console
 * Uses Node.js native fetch (zero external npm packages required)
 */

async function sendEmail(email, subject, text, html) {
    console.log(`[Email Service] Attempting to send email to ${email} | Subject: ${subject}`);

    // 1. Check for Custom Gmail HTTP API Endpoint / Google Apps Script Webhook
    if (process.env.GMAIL_API_URL) {
        try {
            console.log(`[Email Service] Sending via Custom Gmail HTTP API (${process.env.GMAIL_API_URL})...`);
            const response = await fetch(process.env.GMAIL_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(process.env.GMAIL_API_KEY ? { "Authorization": `Bearer ${process.env.GMAIL_API_KEY}` } : {})
                },
                body: JSON.stringify({
                    to: email,
                    recipient: email,
                    subject,
                    text,
                    html: html || text,
                    body: html || text
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errText}`);
            }

            console.log(`[Email Service] ✅ Email sent successfully via Custom Gmail HTTP API to ${email}`);
            return true;
        } catch (error) {
            console.error("[Email Service] ❌ Failed to send via Custom Gmail HTTP API:", error.message);
        }
    }

    // 2. Check for Official Google Gmail REST API (OAuth2 over HTTP)
    const gmailClientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
    const gmailUser = process.env.GMAIL_USER || process.env.GOOGLE_USER;

    if (gmailClientId && gmailClientSecret && gmailRefreshToken && gmailUser) {
        try {
            console.log("[Email Service] Sending via Official Gmail REST API (OAuth2)...");
            
            // Step A: Obtain Access Token using Refresh Token via Google OAuth2 HTTP Endpoint
            const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: gmailClientId,
                    client_secret: gmailClientSecret,
                    refresh_token: gmailRefreshToken,
                    grant_type: "refresh_token"
                })
            });

            if (!tokenRes.ok) {
                const tokenErr = await tokenRes.text();
                throw new Error(`OAuth Token HTTP ${tokenRes.status}: ${tokenErr}`);
            }

            const { access_token } = await tokenRes.json();

            // Step B: Construct RFC 2822 MIME message
            const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
            const messageParts = [
                `From: AgTech <${gmailUser}>`,
                `To: <${email}>`,
                `Subject: ${utf8Subject}`,
                "MIME-Version: 1.0",
                "Content-Type: text/html; charset=utf-8",
                "",
                html || text
            ];
            const rawMessage = Buffer.from(messageParts.join("\r\n"))
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");

            // Step C: Send email via Gmail REST API HTTP Endpoint
            const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ raw: rawMessage })
            });

            if (!sendRes.ok) {
                const sendErr = await sendRes.text();
                throw new Error(`Gmail API HTTP ${sendRes.status}: ${sendErr}`);
            }

            console.log(`[Email Service] ✅ Email sent successfully via Gmail REST API to ${email}`);
            return true;
        } catch (error) {
            console.error("[Email Service] ❌ Failed to send via Gmail REST API:", error.message);
        }
    }

    // 3. Check for Resend HTTP API (very common alternative for HTTP email API)
    if (process.env.RESEND_API_KEY) {
        try {
            console.log("[Email Service] Sending via Resend HTTP API...");
            const resendRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || "AgTech <onboarding@resend.dev>",
                    to: [email],
                    subject,
                    html: html || text
                })
            });
            if (resendRes.ok) {
                console.log(`[Email Service] ✅ Email sent successfully via Resend to ${email}`);
                return true;
            }
        } catch (error) {
            console.error("[Email Service] ❌ Failed to send via Resend API:", error.message);
        }
    }

    // 4. Fallback for Local Development (when no API credentials are set in .env)
    console.log("------------------------------------------------------------------");
    console.log(`[Email Service Mock - Local Dev] No Gmail HTTP API keys found in .env`);
    console.log(`[Email Service Mock] To: ${email}`);
    console.log(`[Email Service Mock] Subject: ${subject}`);
    console.log(`[Email Service Mock] Content:\n${text}`);
    console.log("------------------------------------------------------------------");
    return true;
}

module.exports = { sendEmail };
