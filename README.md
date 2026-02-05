# TripPlanner

A trip planning app I built because I got tired of juggling Google Docs, Splitwise, and group chats every time my friends and I planned a trip. Now everything's in one place.

## What it does

Plan trips with your friends without the chaos. You can:
- Create trips and add your travel buddies
- Build day-by-day itineraries with times and locations
- Track expenses and split costs (no more awkward Venmo requests)
- Make shared packing lists so someone remembers the chargers
- Store all your confirmation numbers and important links

There's a sample trip loaded up so you can click around and see how it works.

## Built with

- React + TypeScript
- React Router for navigation
- Custom CSS (I wanted to practice without using a framework)
- LocalStorage for now (AWS backend coming later)

## Getting it running

```bash
git clone https://github.com/gokiruu/tripplanner.git
cd tripplanner
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000) and you should see the sample trip.

## How to use it

The sample trip is a weekend in Lisbon that shows you all the features. You can explore that or create your own trip.

Once you're in a trip, there are tabs for different things:

**Dashboard** - Overview of your trip with quick stats

**Itinerary** - Add activities, restaurants, hotels, whatever. Organize by day and time. I added categories so you can filter by type.

**Expenses** - This was the fun part to build. Add an expense, say who paid, select who it should be split between, and it calculates who owes who. The algorithm minimizes the number of payments needed (so instead of everyone paying everyone, it figures out the simplest way to settle up).

**Packing** - Shared checklist. You can assign items to people and check them off as you pack.

**Documents** - Store confirmation numbers, links to your Airbnb, flight info, etc. Basically anything you'd normally screenshot and lose in your camera roll.

## Project structure

```
src/
├── components/       # All the React components
├── types.ts         # TypeScript definitions
├── mockData.ts      # Sample trip data
├── App.tsx          # Main app with routing
└── index.css        # Custom utilities
```

Pretty standard React setup.

## What's next

I'm planning to add:
- AWS backend (Lambda, DynamoDB, S3) for real multi-user support
- User authentication with Cognito
- Real-time updates when friends make changes
- Maybe a mobile app version if I have time

Right now it's just localStorage, so it's single-user and data doesn't persist across devices. Good enough for the MVP though.

## Why I built this

I travel with friends pretty often and we always end up with:
- A shared Google Doc for the itinerary (that gets messy)
- Splitwise or a notes app for expenses (that someone forgets to update)
- Random texts about "did anyone pack sunscreen?"
- Screenshots of confirmations scattered across phones

This just puts it all in one place. The expense splitting algorithm was particularly interesting to implement - it's basically a debt simplification problem.

## Contributing

If you want to add features or fix bugs, feel free to fork it and open a PR. I'm still learning so feedback is welcome.

## License

MIT - do whatever you want with it

---

Made this for a project but actually plan to use it for my next trip. If you end up using it, let me know how it goes!
