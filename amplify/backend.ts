import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.ts';
import { data } from './data/resource.ts';
import { storage } from './storage/resource.ts';
import { sendInviteEmail } from './functions/sendInviteEmail/resource.ts';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({ auth, data, storage, sendInviteEmail });

backend.sendInviteEmail.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
);
