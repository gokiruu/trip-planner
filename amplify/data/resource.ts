import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
import { sendInviteEmail } from '../functions/sendInviteEmail/resource.ts';

const schema = a.schema({
  Trip: a.model({
    name: a.string().required(),
    destination: a.string().required(),
    startDate: a.string().required(),
    endDate: a.string().required(),
    owners: a.string().array(),
    collaborators: a.string(),
    travelers: a.string(),
    itinerary: a.string(),
    expenses: a.string(),
    packing: a.string(),
    documents: a.string(),
    proposals: a.string(),
    notes: a.string(),
  }).authorization(allow => [
    allow.owner(),
    allow.ownersDefinedIn('owners'),
  ]),
  UserProfile: a.model({
    nickname: a.string(),
    bio: a.string(),
    avatarKey: a.string(),
  }).authorization(allow => [
    allow.owner(),
  ]),
  sendTripInvite: a.mutation()
    .arguments({
      email: a.string().required(),
      tripName: a.string().required(),
      inviterName: a.string().required(),
      appUrl: a.string().required(),
    })
    .returns(a.boolean())
    .handler(a.handler.function(sendInviteEmail))
    .authorization(allow => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
