# Digital Recipe Book 🍳


deployed link: https://recipesbookss.netlify.app

![Home page](<Screenshot (1089).png>)
![Recipes](<Screenshot (1091).png>)
![Add Recipe page](<Screenshot (1092).png>)
![Meal Planner](<Screenshot (1093).png>)
![Shopping List](<Screenshot (1095).png>)


A modern web application for organizing, creating, and sharing your favorite recipes with beautiful visuals and meal planning features.

## Features ✨

- **User Authentication** 🔐
  - Secure login and registration
  - Profile management

- **Recipe Management** 📝
  - Create, edit, and delete recipes
  - Categorize recipes (Appetizers, Mains, Desserts)
  - Upload recipe photos
  - Nutritional information tracking

- **Collections** 📚
  - Organize recipes into custom collections
  - Beautiful collection cards with stats

- **Meal Planning** 🗓️
  - Weekly meal planner
  - Generate shopping lists from meal plans
  - Save meal plan templates

- **Sharing** 📤
  - Share recipes via email
  - Export recipes as PDF

- **Additional Features** 
  - Built-in cooking timer ⏱️
  - Dark mode 🌙
  - Responsive design 📱💻

## Technologies Used 🛠️

**Frontend:**
- HTML5, CSS3, JavaScript
- [Font Awesome](https://fontawesome.com/) for icons
- [jsPDF](https://parall.ax/products/jspdf) for PDF generation

**Backend:**
- [Firebase](https://firebase.google.com/) (Authentication, Realtime Database, Storage)

## Getting Started 🚀

### Prerequisites
- Node.js (for local development)
- Firebase account

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/BharathGovindula/digital-recipe-book.git
   cd digital-recipe-book
Set up Firebase:

Create a new Firebase project

Enable Authentication (Email/Password)

Set up Realtime Database

Configure Storage

Add your Firebase config:
Replace the placeholder in firebase-config.js with your actual Firebase config:

javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
For image uploads (optional):

Get an ImgBB API key and replace in recipes.js

Project Structure 📂
digital-recipe-book/
├── index.html              # Main dashboard
├── auth.html               # Login/registration
├── add-recipe.html         # Recipe creation
├── meal-planner.html       # Meal planning
├── shopping-list.html      # Shopping list
├── profile.html            # User profile
├── collection.html         # Collection view
├── css/
│   ├── style.css           # Base styles
│   ├── auth.css            # Auth page styles
│   ├── dashboard.css       # Dashboard styles
│   ├── forms.css           # Form styles
│   ├── dark-mode.css       # Dark mode styles
│   ├── meal-planner.css    # Meal planner styles
│   ├── shopping-list.css   # Shopping list styles
│   └── profile.css         # Profile page styles
├── js/
│   ├── auth.js             # Auth logic
│   ├── recipes.js          # Recipe CRUD operations
│   ├── meal-planner.js     # Meal planning logic
│   ├── shopping-list.js    # Shopping list logic
│   ├── timer.js            # Cooking timer
│   ├── analytics.js        # Dashboard analytics
│   ├── collections.js      # Collections management
│   ├── profile.js          # Profile management
│   └── utils.js            # Utility functions
├── assets/
│   ├── images/             # App images
│   └── icons/             # Icon set
└── firebase-config.js      # Firebase configuration
Usage Guide 📖
Creating an Account

Click "Register" on the auth page

Enter your email and password

Verify your email (if required)

Adding Recipes

Click "Add Recipe" from the dashboard

Fill in recipe details (name, ingredients, instructions)

Add nutritional information (optional)

Upload a photo (optional)

Click "Save Recipe"

Organizing Recipes

Create collections from the dashboard

Add recipes to collections using the "Save to Collection" button

Meal Planning

Navigate to the Meal Planner

Assign recipes to days of the week

Generate shopping lists automatically

Sharing Recipes

Click the "Share" button on any recipe

Choose email sharing or PDF export

Contributing 🤝
Contributions are welcome! Please follow these steps:

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License 📄
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments 🙏
Firebase for backend services

Font Awesome for beautiful icons

All recipe enthusiasts who inspired this project!

Happy Cooking! 👨‍🍳👩‍🍳