import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Trip: a.model({
    name: a.string().required(),
    destination: a.string().required(),
    startDate: a.string().required(),
    endDate: a.string().required(),
    owners: a.string().array(),
    collaborators: a.json(),
    travelers: a.json(),
    itinerary: a.json(),
    expenses: a.json(),
    packing: a.json(),
    documents: a.json(),
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
