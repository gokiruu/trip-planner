import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});
const SENDER = process.env.SENDER_EMAIL ?? 'noreply@example.com';

export const handler = async (event: {
  arguments: {
    email: string;
    tripName: string;
    inviterName: string;
    appUrl: string;
  };
}): Promise<boolean> => {
  const { email, tripName, inviterName, appUrl } = event.arguments;
  try {
    await ses.send(
      new SendEmailCommand({
        Source: SENDER,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: `You've been added to "${tripName}"!` },
          Body: {
            Html: {
              Data: `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem">
                  <h2 style="color:#166534">Trip Planner Invite ✈️</h2>
                  <p><strong>${inviterName}</strong> has added you to the trip <strong>${tripName}</strong>!</p>
                  <p style="margin:1.5rem 0">
                    <a href="${appUrl}" style="background:#d97706;color:white;padding:12px 28px;border-radius:9999px;text-decoration:none;font-weight:bold;font-size:1rem">
                      Open Trip Planner
                    </a>
                  </p>
                  <p style="color:#555;font-size:0.85rem">
                    After signing in, share your <strong>User ID</strong> (found on your Profile page) with
                    ${inviterName} so they can give you edit access to the trip.
                  </p>
                </div>
              `,
            },
            Text: {
              Data: `${inviterName} has added you to the trip "${tripName}" on Trip Planner! Visit ${appUrl} to sign in, then share your User ID with ${inviterName} for edit access.`,
            },
          },
        },
      })
    );
    return true;
  } catch (err) {
    console.error('SES error:', err);
    return false;
  }
};
