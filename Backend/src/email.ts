import nodemailer from 'nodemailer';
import EventSource from 'eventsource'; // For listening to SSE
import * as db from './mongodb'; // Import the MongoDB connection
import axios from 'axios'; // Import axios for making HTTP requests

const senderEmail = 'weather.guard.csc@gmail.com';
const senderPassword = 'xbmm dqux bzlc cwiu';

// Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can replace with any other email service
  auth: {
    user: senderEmail, // Replace with your email
    pass: senderPassword, // Replace with your email password or app password for Gmail
  },
});

// Function to send an email
export const sendEmail = async (
  eventData: string,
  toEmail: string
): Promise<void> => {
  const mailOptions = {
    from: senderEmail, // Sender address
    to: toEmail, // List of recipients
    subject: 'WeatherGuard: Typhoon Notification', // Subject line
    text: `${eventData}`, // Plain text body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const startEmailPoller = () => {
  const getUrl = 'http://127.0.0.1:3010/email-typhoon-updates'; // Replace with your endpoint
  const pollInterval = 10000; // Interval in milliseconds (e.g., 10 seconds)

  const fetchData = async () => {
    try {
      const response = await axios.get(getUrl);
      console.log('Checking for new emails');
    } catch (error) {
      console.error('Error fetching email data:', error);
    }

    // Schedule the next fetch
    setTimeout(fetchData, pollInterval);
  };

  // Start the polling process
  fetchData();
  console.log('Email poller started and is running...');
};
