# TripPlanner

A trip planning app I built because I got tired of juggling Google Docs, Splitwise, and group chats every time my friends and I planned a trip. Now everything's in one place.

## What it does

Plan trips with your friends without the chaos. You can:
- Create trips and add your travel buddies
- Build day-by-day itineraries with times and locations
- Track expenses and split costs (no more awkward Venmo requests)
- Make shared packing lists so someone remembers the chargers
- Store all your confirmation numbers and important links

## Built with

- React + TypeScript
- React Router for navigation
- Custom CSS
- AWS Amplify Gen 2 for authentication, data, and hosting
- Amazon Cognito for email/password sign-in
- AWS AppSync + DynamoDB for owner-scoped trip data

## Getting it running

```bash
git clone https://github.com/gokiruu/tripplanner.git
cd tripplanner
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000). The app expects a valid `amplify_outputs.json` file in the project root so it can connect to your Amplify backend.

## AWS Amplify setup

This project is already wired for Amplify Gen 2:

- `amplify/auth/resource.ts` defines email/password authentication.
- `amplify/data/resource.ts` defines the owner-protected `Trip` model.
- `src/index.tsx` calls `Amplify.configure(outputs)`.
- `src/App.tsx` uses Amplify UI's `Authenticator` and the generated data client.
- `amplify.yml` deploys the backend and frontend in Amplify Hosting.

To create your own local cloud sandbox:

```bash
npm install
npx ampx sandbox
```

Keep the sandbox command running while you develop. It deploys an isolated backend and updates `amplify_outputs.json` with real Cognito and AppSync values.

In another terminal, run:

```bash
npm start
```

For public deployment:

1. Push this repository to GitHub.
2. Open the AWS Amplify console and create a new app from your GitHub repository.
3. Select the branch you want to deploy.
4. Use the checked-in `amplify.yml` build settings.
5. Start the deployment.

Amplify Hosting will run `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`, build the React app, and publish the generated `build` folder.

After deployment, use the hosted app URL to create an account. Each signed-in user can only access trips they own because the `Trip` model uses owner authorization.

## How to use it

Create an account, sign in, and create your first trip.

Once you're in a trip, there are tabs for different things:

**Dashboard** - Overview of your trip with quick stats

**Itinerary** - Add activities, restaurants, hotels, whatever. Organize by day and time. I added categories so you can filter by type.

**Expenses** - This was the fun part to build. Add an expense, say who paid, select who it should be split between, and it calculates who owes who. The algorithm minimizes the number of payments needed.

**Packing** - Shared checklist. You can assign items to people and check them off as you pack.

**Documents** - Store confirmation numbers, links to your Airbnb, flight info, etc. Basically anything you'd normally screenshot and lose in your camera roll.

## Project structure

```text
src/
├── components/       # All the React components
├── types.ts          # TypeScript definitions
├── App.tsx           # Amplify-backed app with routing
└── index.css         # Custom utilities

amplify/
├── auth/resource.ts  # Cognito auth definition
├── data/resource.ts  # AppSync/DynamoDB data schema
└── backend.ts        # Backend composition
```

## What's next

I'm planning to add:
- Real-time updates when friends make changes
- Shared trips/collaborator invitations
- File uploads for trip documents with Amplify Storage
- Maybe a mobile app version if I have time

## Why I built this

I travel with friends pretty often and we always end up with:
- A shared Google Doc/spreadsheet for the itinerary
- Splitwise or a notes app for expenses
- Random texts about "did anyone pack sunscreen?"
- Screenshots of confirmations scattered across phones

This just puts it all in one place. The expense splitting algorithm was particularly interesting to implement - it's basically a debt simplification problem.

## Contributing

If you want to add features or fix bugs, feel free to fork it and open a PR. I'm still learning so feedback is welcome.

## License

MIT - do whatever you want with it

---

Made this for a project but actually plan to use it for my next trip. If you end up using it, let me know how it goes!
