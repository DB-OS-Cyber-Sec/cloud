import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials are not set in environment variables');
}

const client = twilio(accountSid, authToken);

// Define response data type
type Data = {
    success: boolean;
    message: string;
  };
  
  // API handler
  export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === 'POST') {
      const { to, message } = req.body;
  
      try {
        // Use Twilio to send SMS
        const messageInstance = await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: to,
        });
  
        // Respond with success message
        res.status(200).json({
          success: true,
          message: `Message sent successfully with SID: ${messageInstance.sid}`,
        });
      } catch (error: any) {
        console.error('Error sending SMS:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to send SMS. Please try again later.',
        });
      }
    } else {
      // Method not allowed
      res.setHeader('Allow', ['POST']);
      res.status(405).json({
        success: false,
        message: 'Method Not Allowed',
      });
    }
  }
