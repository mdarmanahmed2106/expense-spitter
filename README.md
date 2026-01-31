# Smart Expense Splitter for Hostellers

A complete, production-ready full-stack expense management application designed specifically for hostel students. Track personal and group expenses, manage budgets, visualize spending habits, detect overspending behavior, and generate downloadable PDF reports.

![Tech Stack](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🔐 Authentication
- Secure JWT-based authentication
- User signup and login
- Protected routes
- Persistent sessions

### 💰 Expense Management
- Add personal and group expenses
- Categorize expenses (Food, Travel, Fun, Misc)
- Edit and delete expenses
- Real-time expense tracking

### 📊 Budget Tracking
- Set monthly budgets
- Real-time budget status
- Dynamic warnings at 70%, 90%, and 100% thresholds
- Visual progress indicators

### 📈 Analytics Dashboard
- Category-wise pie charts
- Weekly spending bar charts
- Monthly trend line charts
- Highest spending category insights

### 😈 Guilty Spending Detector
- AI-powered spending pattern detection
- Warnings for food expenses > 40%
- Spending spike alerts
- Week-over-week comparisons
- Data-driven insights

### 👥 Group Expense Management
- Create groups with multiple members
- Add shared expenses
- Automatic settlement calculations
- Who owes whom tracking
- Top spender leaderboard

### 📄 PDF Report Generation
- Download monthly expense reports
- Comprehensive data including:
  - Total spending
  - Category breakdown
  - Budget status
  - Insights and analytics

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router DOM for navigation
- Tailwind CSS for styling
- Recharts for data visualization
- jsPDF for PDF generation
- Axios for API calls

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

## 📁 Project Structure

```
Expense/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   └── ui/        # Card, Button, Input, Modal, etc.
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # All application pages
│   │   ├── services/      # API service layer
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   ├── .env               # Environment variables
│   └── package.json
│
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Group.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── budget.js
│   │   ├── groups.js
│   │   └── analytics.js
│   ├── middleware/       # Auth middleware
│   ├── controllers/      # Business logic
│   ├── server.js         # Main server file
│   ├── .env              # Environment variables
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd c:\Users\2arma\OneDrive\Desktop\Expense
```

2. **Set up the Backend**
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
MONGO_URI=mongodb://localhost:27017/expense-splitter
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, replace `MONGO_URI` with your connection string.

3. **Set up the Frontend**
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start MongoDB** (if using local MongoDB)
```bash
mongod
```

2. **Start the Backend Server**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

3. **Start the Frontend** (in a new terminal)
```bash
cd client
npm run dev
```
Frontend will run on `http://localhost:5173`

4. **Open your browser** and navigate to `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get expense statistics

### Budget
- `GET /api/budget` - Get monthly budget
- `PUT /api/budget` - Update monthly budget
- `GET /api/budget/status` - Get budget status with warnings

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get single group
- `POST /api/groups/:id/expenses` - Add expense to group
- `GET /api/groups/:id/settlements` - Get settlement calculations

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/guilty` - Get guilty spending warnings

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with charcoal black and deep navy backgrounds
- **Glassmorphism**: Frosted glass effect cards with backdrop blur
- **Gradient Accents**: Violet, cyan, and electric blue color scheme
- **Smooth Animations**: Hover effects, transitions, and micro-animations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Premium Feel**: State-of-the-art UI that feels like a real SaaS product

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL=your_backend_url/api`
4. Deploy

### Backend (Render / Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT`
   - `NODE_ENV=production`
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGO_URI` in backend `.env`

## 🧪 Testing

### Manual Testing Checklist
- [ ] User signup and login
- [ ] Add personal expense
- [ ] Add group expense
- [ ] Set monthly budget
- [ ] View analytics charts
- [ ] Check guilty spending warnings
- [ ] Create group and add members
- [ ] View settlement calculations
- [ ] Download PDF report
- [ ] Logout and login again

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

This is a portfolio project. Feel free to fork and customize for your own use!

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ for hostel students everywhere

---

**Note**: This is a fully functional, production-ready application. All features are implemented and working with real data from MongoDB. No mock data or placeholders.
