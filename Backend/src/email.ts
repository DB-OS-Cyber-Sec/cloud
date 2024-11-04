import nodemailer from 'nodemailer';
import EventSource from 'eventsource'; // For listening to SSE
import * as db from './mongodb'; // Import the MongoDB connection

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
const sendEmail = async (eventData: string, toEmail: string): Promise<void> => {
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

// Function to listen to SSE events
export const startEmailListener = () => {
  const sseUrl = 'http://0.0.0.0:3010/typhoon-stream';

  const connectToSSE = () => {
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = async (event) => {
      console.log('Received event:', event.data);
      const json = JSON.parse(event.data);

      if (!json) return;

      const typhoonCategory = json.typhoon_category;
      const risk_classification = json.risk_classification;
      const shelter_message = json.shelter_message;

      const emailContent = `Typhoon Category: ${typhoonCategory}\nRisk Classification: ${risk_classification}\nShelter Message: ${shelter_message}`;

      const subscribers = await db.Subscriber.find().lean(); // Retrieve all subscribers

      // Send emails to all subscribers
      subscribers.forEach(async (subscriber) => {
        try {
          await sendEmail(emailContent, subscriber.email);
          console.log('Email sent to:', subscriber.email);
          console.log('Email content:', emailContent);
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
        }
      });
    };

    // Handle SSE errors
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // Retry connection after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect to SSE...');
        connectToSSE(); // Reconnect
      }, 5000);
    };
  };

  // Initiate the first SSE connection
  connectToSSE();

  console.log('Email listener started and is running...');
};
