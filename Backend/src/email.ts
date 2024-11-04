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

// Function to listen to SSE events
// export const startEmailListener = () => {
//   const sseUrl = 'http://0.0.0.0:3010/typhoon-stream';
//   let retryCount = 0; // Track reconnection attempts
//   const maxRetries = 5; // Set a maximum number of retries

//   const connectToSSE = () => {
//     const eventSource = new EventSource(sseUrl);

//     eventSource.onmessage = async (event) => {
//       console.log('Received event:', event.data);
//       const json = JSON.parse(event.data);

//       if (!json) return;

//       const { typhoon_category, risk_classification, shelter_message } = json;

//       const emailContent = `Typhoon Category: ${typhoon_category}\nRisk Classification: ${risk_classification}\nShelter Message: ${shelter_message}`;

//       try {
//         // Cache subscribers in memory to avoid frequent DB hits (use with caution for large datasets)
//         const subscribers = await db.Subscriber.find().lean();
//         console.log(
//           `Found ${subscribers.length} subscribers. Sending emails...`
//         );

//         // Send emails to all subscribers in a throttled manner
//         for (let subscriber of subscribers) {
//           try {
//             await sendEmail(emailContent, subscriber.email);
//             console.log(`Email sent to: ${subscriber.email}`);
//           } catch (error) {
//             console.error(
//               `Failed to send email to ${subscriber.email}:`,
//               error
//             );
//           }
//         }
//       } catch (dbError) {
//         console.error('Failed to fetch subscribers or send emails:', dbError);
//       }
//     };

//     // Handle SSE errors and reconnect with backoff
//     eventSource.onerror = (error) => {
//       console.error('SSE error:', error);
//       eventSource.close();

//       // Retry connection with backoff
//       if (retryCount < maxRetries) {
//         retryCount++;
//         const retryDelay = 5000 * retryCount; // Exponential backoff
//         console.log(
//           `Attempting to reconnect to SSE in ${retryDelay / 1000} seconds...`
//         );

//         setTimeout(() => {
//           console.log('Reconnecting to SSE...');
//           connectToSSE();
//         }, retryDelay);
//       } else {
//         console.error('Max retries reached. Giving up on reconnecting to SSE.');
//       }
//     };
//   };

//   // Initiate the first SSE connection
//   connectToSSE();
//   console.log('Email listener started and is running...');
// };
