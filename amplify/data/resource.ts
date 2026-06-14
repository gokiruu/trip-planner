import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

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
    notes: a.string(),
  }).authorization(allow => [
    allow.owner(),
    allow.ownersDefinedIn('owners'),
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
