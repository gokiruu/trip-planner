# TripPlanner - Collaborative Trip Planning App

A modern, collaborative trip planning application built with React, TypeScript, and custom CSS. Plan your trips with friends, manage expenses, create itineraries, and keep everything organized in one place.

## 🚀 Features

### Core MVP Features
- **Trip Management**: Create trips with dates, destinations, and travelers
- **Itinerary Planning**: Day-by-day schedule with activities, restaurants, and hotels
- **Expense Tracking**: Split costs between travelers with automatic balance calculations
- **Packing Lists**: Shared checklists with progress tracking
- **Documents & Info**: Store confirmations, links, and important trip information

### Key Highlights
- ✅ **Fully Responsive**: Works seamlessly on desktop and mobile
- ✅ **TypeScript**: Complete type safety throughout the application
- ✅ **Modern UI**: Clean, intuitive interface with custom CSS utilities
- ✅ **Real-time Updates**: Instant updates across all trip sections
- ✅ **Sample Data**: Pre-loaded with example trip for testing

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Routing**: React Router DOM
- **Styling**: Custom CSS utilities (Tailwind-inspired)
- **Build Tool**: Create React App
- **Future Backend**: AWS (planned)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tripplanner.git
   cd tripplanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Getting Started
1. **View Sample Trip**: Explore the pre-loaded "Weekend in Lisbon" trip
2. **Create New Trip**: Click "Create New Trip" to start planning
3. **Add Travelers**: Invite friends by adding their names and emails
4. **Plan Your Trip**: Use the dashboard to navigate between sections

### Trip Sections

#### 📅 Itinerary
- Add activities, restaurants, hotels, and transport
- Organize by day with times and locations
- Add notes and details for each item

#### 💰 Expenses
- Track all trip expenses with categories
- Split costs between travelers
- View balances and who owes whom
- Real-time expense calculations

#### 🎒 Packing
- Create shared packing lists
- Assign items to specific travelers
- Track packing progress with visual indicators
- Mark items as packed

#### 📄 Documents
- Store flight confirmations and hotel bookings
- Organize by document type
- Add external links and detailed information
- Keep all important trip info in one place

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── TripList.tsx    # Trip overview cards
│   ├── CreateTrip.tsx  # Trip creation form
│   ├── TripDashboard.tsx # Trip overview dashboard
│   ├── Itinerary.tsx   # Day-by-day planning
│   ├── Expenses.tsx    # Expense tracking & splitting
│   ├── Packing.tsx     # Packing list management
│   └── Documents.tsx   # Document storage
├── types.ts            # TypeScript type definitions
├── mockData.ts         # Sample data for testing
├── App.tsx             # Main app component with routing
├── index.css           # Custom CSS utilities
└── index.tsx           # App entry point
```

## 🔮 Future Enhancements

### Backend Integration (AWS)
- User authentication and profiles
- Real-time collaboration
- Data persistence
- File uploads for documents
- Email notifications

### Additional Features
- Weather integration
- Map integration for locations
- Budget tracking and alerts
- Trip sharing and invitations
- Mobile app (React Native)
- Offline support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Inspired by modern trip planning needs
- Custom CSS utilities inspired by Tailwind CSS

---

**Ready to plan your next adventure? Start exploring with the sample trip or create your own!** 🌍✈️