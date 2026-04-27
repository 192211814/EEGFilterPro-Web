import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "EEGFilterPro@gmail.com")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "dcae ftkw baej fydb")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", SMTP_USER)

def send_otp_email(receiver_email: str, otp: str):
    """Sends an OTP email to the user."""
    
    # If no credentials, just log it (prevent crash in dev)
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"--- EMAIL MOCK ---")
        print(f"To: {receiver_email}")
        print(f"Subject: Password Reset OTP")
        print(f"Body: Your OTP is {otp}")
        print(f"------------------")
        return True

    subject = "EEG Filter Pro - Password Reset OTP"
    body = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the following 6-digit OTP to verify your identity:</p>
        <h1 style="color: #2F80ED; letter-spacing: 5px;">{otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Regards,<br>EEG Filter Pro Team</p>
    </body>
    </html>
    """

    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
