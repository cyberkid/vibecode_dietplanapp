# Personalized Diet Planner

A frontend-only web application that generates personalized daily diet recommendations based on user preferences and what's in their fridge.

## Features

- **Personalized Meal Plans**: Get customized meal suggestions based on your:
  - Personal details (age, gender, weight, height)
  - Dietary preferences (vegetarian, vegan, etc.)
  - Diet type (keto, paleo, Mediterranean, etc.)
  - Fitness goals (weight loss, muscle gain, maintenance)
  - Allergies
  - Available ingredients in your fridge

- **Local Storage**: Your preferences are saved locally on your device for convenience
- **Daily Updates**: Generate a fresh meal plan every day
- **Ingredient Highlighting**: Easily see which suggested meals use ingredients you already have

## How It Works

1. Enter your personal details and preferences
2. Provide your OpenAI API key (stored locally only)
3. The app generates a personalized meal plan using OpenAI's GPT-4
4. Update your fridge contents anytime to get new recommendations

## Technology

- **Frontend**: HTML, CSS, JavaScript
- **Storage**: Browser's localStorage
- **AI Integration**: OpenAI API (requires your own API key)

## Getting Started

1. Open `index.html` in your web browser
2. Fill in your personal details and preferences
3. Enter your OpenAI API key
4. Click "Generate Plan" to see your personalized meal suggestions

## Privacy

This app runs entirely in your browser. Your personal data is stored locally on your device and is never sent to any server except OpenAI for generating meal plans.

## Deployment to Vercel

You can easily deploy this application to Vercel by following these steps:

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one
2. Install Git if you don't have it already
3. Push your code to a GitHub, GitLab, or Bitbucket repository
4. Go to the Vercel dashboard and click "New Project"
5. Import your repository
6. Configure the project:
   - Set the Framework Preset to "Other"
   - Set the Root Directory to "frontend"
   - Set the Build Command to blank (not needed for static sites)
   - Set the Output Directory to "."
7. Click "Deploy"

Alternatively, you can use the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to the frontend directory
cd frontend

# Deploy to Vercel
vercel
```

## Requirements

- Modern web browser with JavaScript enabled
- Internet connection for API calls to OpenAI
