import { defineFunction } from '@aws-amplify/backend';

export const sendInviteEmail = defineFunction({
  name: 'sendInviteEmail',
  entry: './handler.ts',
  environment: {
    SENDER_EMAIL: 'noreply@example.com',
  },
});
