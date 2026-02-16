import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import dotenv from "dotenv"

dotenv.config()

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const sender_email = "no-reply@ewsd-g10.cloudlab-hostme.online"

async function sendEmail(to, subject, body) {
  if (!to || !subject || !body) {
    throw new Error("Missing required parameters: to, subject, body")
  }

  const params = {
    Source: sender_email,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: body,
          Charset: "UTF-8",
        },
      },
    },
  }

  try {
    const command = new SendEmailCommand(params)
    const response = await sesClient.send(command)
    console.log("Email sent successfully:", response.MessageId)
    return response
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export { sendEmail }
