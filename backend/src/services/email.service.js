async function sendEmail(email, subject, text, html) {
    console.log(`[Email Service Mock] Sending email to ${email} with subject: ${subject}`);
    console.log(`[Email Service Mock] Email content: ${text}`);
    return true;
}

module.exports = { sendEmail };
