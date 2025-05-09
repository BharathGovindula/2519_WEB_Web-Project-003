RecipeBook - Digital Recipe Manager 🍳

Deployed Link - https://recipesbookss.netlify.app

Table of Contents

Project Description

Features

Technologies Used

Installation

Configuration

Usage

Screenshots

Contributing

License

Project Description
RecipeBook is a comprehensive digital recipe management application that helps home cooks and food enthusiasts organize, discover, and share their favorite recipes. With a beautiful interface and powerful features, it transforms your cooking experience by keeping all your recipes in one secure, accessible place.

Features ✨
Core Features
🔐 User Authentication: Secure login/signup with email/password

📝 Recipe Management: Create, view, edit, and delete recipes

🗂️ Collections: Organize recipes into custom collections

🛒 Shopping Lists: Generate lists from recipes/meal plans

🗓️ Meal Planner: Weekly meal planning with auto-generated shopping lists

⏱️ Cooking Timer: Built-in multi-timer for cooking steps

Advanced Features
📊 Dashboard Analytics: Track your cooking stats and habits

📤 PDF Export: Export recipes as beautiful PDF documents

🌙 Dark Mode: Eye-friendly dark theme

📱 Fully Responsive: Works on all devices

🔍 Smart Search: Find recipes by ingredients or name

Technologies Used 🛠️
Frontend
HTML5, CSS3 (with CSS Variables)

JavaScript (ES6+)

Firebase Authentication

Firebase Realtime Database

Firebase Storage

Font Awesome (Icons)

jsPDF (PDF generation)

Backend
Firebase Backend Services

ImgBB API (for image hosting)

Installation 💻
Prerequisites
Node.js (v14+ recommended)

Firebase account

Modern web browser

Setup Steps
Clone the repository:

bash
git clone https://github.com/yourusername/RecipeBook.git
cd RecipeBook
Set up Firebase:

Create a new Firebase project at Firebase Console

Enable Email/Password authentication

Set up Realtime Database with proper security rules

Enable Storage

Configure your Firebase credentials:

Copy your Firebase config from the project settings

Paste it into firebase-config.js

(Optional) Set up ImgBB for image uploads:

Get an API key from ImgBB

Add it to recipes.js

Configuration ⚙️
Environment Setup
Rename firebase-config.example.js to firebase-config.js

Update with your Firebase project credentials:

javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
Security Rules
Set these Firebase Realtime Database rules:

json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        "collections": {
          ".indexOn": ["createdAt"]
        }
      }
    },
    "recipes": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        ".indexOn": ["createdAt", "likes", "views", "rating", "category"]
      }
    },
    "shoppingList": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "mealPlans": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
Usage 🚀
Running the Application
Simply open index.html in your browser

Or deploy to Firebase Hosting:

bash
firebase init hosting
firebase deploy
Key Functionalities
Adding Recipes: Complete form with ingredients, instructions, and images

Meal Planning: Drag-and-drop interface for weekly planning

Shopping Lists: Automatically generated from meal plans

Collections: Organize recipes by theme, cuisine, or occasion

Screenshots 📸
Dashboard	Recipe View	Meal Planner
Dashboard	Recipe	Meal Planner
Shopping List	Dark Mode	Mobile View
Shopping List	Dark Mode	Mobile
Contributing 🤝
We welcome contributions! Please follow these steps:

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License 📄
This project is licensed under the MIT License - see the LICENSE file for details.

Happy Cooking! 👨‍🍳👩‍🍳