// DOM Elements
const profileSetupSection = document.getElementById('profileSetupSection');
const loadingSection = document.getElementById('loadingSection');
const dietPlanSection = document.getElementById('dietPlanSection');
const userGreeting = document.getElementById('userGreeting');
const userName = document.getElementById('userName');
const currentDateElement = document.getElementById('currentDate');
const profileForm = document.getElementById('profileForm');
const editProfileBtn = document.getElementById('editProfileBtn');
const updateFridgeBtn = document.getElementById('updateFridgeBtn');
const regeneratePlanBtn = document.getElementById('regeneratePlanBtn');
const fridgeModal = document.getElementById('fridgeModal');
const fridgeForm = document.getElementById('fridgeForm');
const newFridgeContents = document.getElementById('newFridgeContents');
const closeModal = document.querySelector('.close-modal');
const progressBar = document.getElementById('progressBar');

// Voice input elements
const allergiesVoiceBtn = document.getElementById('allergiesVoiceBtn');
const fridgeVoiceBtn = document.getElementById('fridgeVoiceBtn');
const fridgeModalVoiceBtn = document.getElementById('fridgeModalVoiceBtn');

// Meal content elements
const breakfastContent = document.getElementById('breakfastContent');
const lunchContent = document.getElementById('lunchContent');
const dinnerContent = document.getElementById('dinnerContent');
const snacksContent = document.getElementById('snacksContent');

// Default OpenAI API key - using a placeholder
const DEFAULT_API_KEY = "YOUR_OPENAI_API_KEY";

// User data object
let userData = {
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    allergies: '',
    dietaryPreference: '',
    dietType: '',
    fitnessGoal: '',
    fridgeContents: '',
    apiKey: DEFAULT_API_KEY
};

// Function to fetch API key from server
async function fetchApiKey() {
    try {
        const response = await fetch('/api/get-api-key');
        const data = await response.json();
        if (data.apiKey && data.apiKey !== 'API_KEY_NOT_FOUND') {
            userData.apiKey = data.apiKey;
            console.log("Successfully fetched API key from server");
        } else {
            console.log("No API key found on server, using default");
        }
    } catch (error) {
        console.error("Error fetching API key:", error);
    }
}

// Initialize the app
async function initApp() {
    // Try to fetch API key from server first
    await fetchApiKey();
    
    // Check if user data exists in localStorage
    const storedUserData = localStorage.getItem('dietPlannerUserData');
    
    if (storedUserData) {
        // User has visited before
        userData = JSON.parse(storedUserData);
        
        // Ensure API key is set
        if (!userData.apiKey) {
            userData.apiKey = DEFAULT_API_KEY;
        }
        
        // Fill the form with stored data (in case user wants to edit)
        fillFormWithUserData();
        
        // Show greeting with user's name
        userName.textContent = userData.name;
        userGreeting.classList.remove('hidden');
        
        // Hide profile setup, show diet plan
        profileSetupSection.classList.add('hidden');
        
        // Generate diet plan
        generateDietPlan();
    } else {
        // First-time visitor
        profileSetupSection.classList.remove('hidden');
        
        // Pre-fill API key
        document.getElementById('apiKey').value = DEFAULT_API_KEY;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up voice input
    setupVoiceInput();
    
    // Hide API key field
    document.getElementById('apiKey').style.display = 'none';
}

// Fill form with user data
function fillFormWithUserData() {
    document.getElementById('name').value = userData.name;
    document.getElementById('age').value = userData.age;
    document.getElementById('gender').value = userData.gender;
    document.getElementById('weight').value = userData.weight;
    document.getElementById('height').value = userData.height;
    document.getElementById('allergies').value = userData.allergies;
    document.getElementById('dietaryPreference').value = userData.dietaryPreference;
    document.getElementById('dietType').value = userData.dietType;
    document.getElementById('fitnessGoal').value = userData.fitnessGoal;
    document.getElementById('fridgeContents').value = userData.fridgeContents;
}

// Set up event listeners
function setupEventListeners() {
    // Profile form submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveUserData();
        generateDietPlan();
    });
    
    // Edit profile button
    editProfileBtn.addEventListener('click', () => {
        profileSetupSection.classList.remove('hidden');
        dietPlanSection.classList.add('hidden');
    });
    
    // Update fridge button
    updateFridgeBtn.addEventListener('click', () => {
        newFridgeContents.value = userData.fridgeContents;
        fridgeModal.classList.remove('hidden');
    });
    
    // Regenerate plan button
    regeneratePlanBtn.addEventListener('click', () => {
        generateDietPlan();
    });
    
    // Fridge form submission
    fridgeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userData.fridgeContents = newFridgeContents.value;
        localStorage.setItem('dietPlannerUserData', JSON.stringify(userData));
        fridgeModal.classList.add('hidden');
        generateDietPlan();
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
        fridgeModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === fridgeModal) {
            fridgeModal.classList.add('hidden');
        }
    });
}

// Set up voice input
function setupVoiceInput() {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        // Hide voice buttons if not supported
        document.querySelectorAll('.voice-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        console.warn('Speech recognition not supported in this browser');
        return;
    }
    
    // Setup for allergies voice input
    if (allergiesVoiceBtn) {
        allergiesVoiceBtn.addEventListener('click', () => {
            startVoiceRecognition(document.getElementById('allergies'));
        });
    }
    
    // Setup for fridge contents voice input
    if (fridgeVoiceBtn) {
        fridgeVoiceBtn.addEventListener('click', () => {
            startVoiceRecognition(document.getElementById('fridgeContents'));
        });
    }
    
    // Setup for fridge modal voice input
    if (fridgeModalVoiceBtn) {
        fridgeModalVoiceBtn.addEventListener('click', () => {
            startVoiceRecognition(document.getElementById('newFridgeContents'));
        });
    }
}

// Start voice recognition
function startVoiceRecognition(targetInput) {
    // Create speech recognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    // Show recording indicator
    const recordingIndicator = document.createElement('div');
    recordingIndicator.className = 'recording-indicator';
    recordingIndicator.innerHTML = 'Recording... <span class="pulse"></span>';
    targetInput.parentNode.appendChild(recordingIndicator);
    
    // Start recognition
    recognition.start();
    
    // Handle results
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        
        // Append to existing text or replace it
        if (targetInput.value) {
            targetInput.value += ', ' + transcript;
        } else {
            targetInput.value = transcript;
        }
    };
    
    // Handle end of speech recognition
    recognition.onend = () => {
        // Remove recording indicator
        if (recordingIndicator.parentNode) {
            recordingIndicator.parentNode.removeChild(recordingIndicator);
        }
    };
    
    // Handle errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Remove recording indicator
        if (recordingIndicator.parentNode) {
            recordingIndicator.parentNode.removeChild(recordingIndicator);
        }
        
        // Show error message
        alert('Speech recognition error: ' + event.error);
    };
}

// Save user data from form
function saveUserData() {
    userData.name = document.getElementById('name').value;
    userData.age = document.getElementById('age').value;
    userData.gender = document.getElementById('gender').value;
    userData.weight = document.getElementById('weight').value;
    userData.height = document.getElementById('height').value;
    userData.allergies = document.getElementById('allergies').value;
    userData.dietaryPreference = document.getElementById('dietaryPreference').value;
    userData.dietType = document.getElementById('dietType').value;
    userData.fitnessGoal = document.getElementById('fitnessGoal').value;
    userData.fridgeContents = document.getElementById('fridgeContents').value;
    
    // Save to localStorage
    localStorage.setItem('dietPlannerUserData', JSON.stringify(userData));
    
    // Update greeting
    userName.textContent = userData.name;
    userGreeting.classList.remove('hidden');
    
    // Hide profile setup
    profileSetupSection.classList.add('hidden');
}

// Update progress bar
function updateProgress(value) {
    progressBar.value = value;
}

// Function to generate diet plan
async function generateDietPlan() {
    try {
        // Show loading state
        loadingSection.classList.remove('hidden');
        dietPlanSection.classList.add('hidden');
        
        // Set current date
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = today.toLocaleDateString('en-US', options);
        
        // Update progress bar
        progressBar.value = 0;
        updateProgress(10);
        
        // Get user data if not already collected
        if (!userData.name) {
            saveUserData();
        }
        
        // Create prompt for OpenAI
        const prompt = `
            Create a personalized daily diet plan for a ${userData.age}-year-old ${userData.gender.toLowerCase()} who is ${userData.height} tall and weighs ${userData.weight}.
            
            Their dietary preference is ${userData.dietaryPreference} and they follow a ${userData.dietType} diet.
            Their fitness goal is ${userData.fitnessGoal}.
            
            They have the following allergies or foods to avoid: ${userData.allergies || 'None'}.
            
            They currently have these ingredients in their fridge: ${userData.fridgeContents || 'Not specified'}.
            
            Please provide a full day's meal plan including breakfast, lunch, dinner, and snacks.
            For each meal, provide a recipe name, list of ingredients, and brief preparation instructions.
            Highlight any ingredients that are already in their fridge.
            
            Format your response as a JSON object with the following structure:
            {
                "breakfast": {
                    "name": "Recipe Name",
                    "ingredients": ["ingredient 1", "ingredient 2", ...],
                    "instructions": "Brief preparation instructions",
                    "usesFromFridge": ["ingredient from fridge 1", ...]
                },
                "lunch": { ... same structure as breakfast ... },
                "dinner": { ... same structure as breakfast ... },
                "snacks": [
                    {
                        "name": "Snack Name",
                        "ingredients": ["ingredient 1", "ingredient 2", ...],
                        "instructions": "Brief preparation instructions",
                        "usesFromFridge": ["ingredient from fridge 1", ...]
                    },
                    ...
                ]
            }
        `;
        
        updateProgress(30);
        
        // Make API request to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a nutritionist and chef specialized in creating personalized meal plans. Always respond with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });
        
        updateProgress(60);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error connecting to OpenAI API');
        }
        
        const data = await response.json();
        updateProgress(80);
        
        // Parse the response
        const content = data.choices[0].message.content;
        let mealPlan;
        
        try {
            mealPlan = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse JSON response:', content);
            mealPlan = parseMealPlanFromText(content);
        }
        
        // Display the meal plan
        displayMealPlan(mealPlan);
        
        // Hide loading, show diet plan
        updateProgress(100);
        loadingSection.classList.add('hidden');
        dietPlanSection.classList.remove('hidden');
        
        // Save user data to localStorage
        localStorage.setItem('dietPlannerUserData', JSON.stringify(userData));
    } catch (error) {
        console.error('Error generating diet plan:', error);
        
        // If the error is related to the API key, try to fetch it again
        if (error.message.includes('API key')) {
            console.log("API key error detected, trying to fetch again...");
            
            // Try to fetch the API key again
            await fetchApiKey();
            
            // Try generating the diet plan again
            setTimeout(() => {
                generateDietPlan();
            }, 1000);
        } else {
            // Show error message
            alert(`Error: ${error.message || 'Failed to generate meal plan. Please try again.'}`);
            
            // Hide loading
            loadingSection.classList.add('hidden');
        }
    }
}

// Parse meal plan from text response
function parseMealPlanFromText(text) {
    // Default structure
    const mealPlan = {
        breakfast: { name: '', ingredients: [], instructions: '', usesFromFridge: [] },
        lunch: { name: '', ingredients: [], instructions: '', usesFromFridge: [] },
        dinner: { name: '', ingredients: [], instructions: '', usesFromFridge: [] },
        snacks: [{ name: '', ingredients: [], instructions: '', usesFromFridge: [] }]
    };
    
    // Try to extract sections
    const breakfastMatch = text.match(/breakfast:?([\s\S]*?)(?=lunch:|dinner:|snacks:|$)/i);
    const lunchMatch = text.match(/lunch:?([\s\S]*?)(?=breakfast:|dinner:|snacks:|$)/i);
    const dinnerMatch = text.match(/dinner:?([\s\S]*?)(?=breakfast:|lunch:|snacks:|$)/i);
    const snacksMatch = text.match(/snacks:?([\s\S]*?)(?=breakfast:|lunch:|dinner:|$)/i);
    
    // Process breakfast
    if (breakfastMatch && breakfastMatch[1]) {
        mealPlan.breakfast.name = 'Breakfast';
        mealPlan.breakfast.instructions = breakfastMatch[1].trim();
    }
    
    // Process lunch
    if (lunchMatch && lunchMatch[1]) {
        mealPlan.lunch.name = 'Lunch';
        mealPlan.lunch.instructions = lunchMatch[1].trim();
    }
    
    // Process dinner
    if (dinnerMatch && dinnerMatch[1]) {
        mealPlan.dinner.name = 'Dinner';
        mealPlan.dinner.instructions = dinnerMatch[1].trim();
    }
    
    // Process snacks
    if (snacksMatch && snacksMatch[1]) {
        mealPlan.snacks[0].name = 'Snacks';
        mealPlan.snacks[0].instructions = snacksMatch[1].trim();
    }
    
    return mealPlan;
}

// Display meal plan in UI
function displayMealPlan(mealPlan) {
    // Update meal content
    breakfastContent.innerHTML = formatMealContent(mealPlan.breakfast);
    lunchContent.innerHTML = formatMealContent(mealPlan.lunch);
    dinnerContent.innerHTML = formatMealContent(mealPlan.dinner);
    
    // Handle snacks (could be array or single object)
    if (Array.isArray(mealPlan.snacks)) {
        snacksContent.innerHTML = mealPlan.snacks.map(snack => formatMealContent(snack)).join('<hr>');
    } else {
        snacksContent.innerHTML = formatMealContent(mealPlan.snacks);
    }
}

// Format meal content with nice styling
function formatMealContent(meal) {
    // If meal is just a string, return it
    if (typeof meal === 'string') {
        return meal;
    }
    
    // If meal has no name, return instructions
    if (!meal.name && meal.instructions) {
        return meal.instructions;
    }
    
    // Format with all details
    let content = `<h4>${meal.name}</h4>`;
    
    // Add ingredients if available
    if (meal.ingredients && meal.ingredients.length > 0) {
        content += '<p><strong>Ingredients:</strong></p><ul>';
        
        meal.ingredients.forEach(ingredient => {
            // Check if ingredient is from fridge
            const isFromFridge = meal.usesFromFridge && meal.usesFromFridge.some(fridgeItem => 
                ingredient.toLowerCase().includes(fridgeItem.toLowerCase())
            );
            
            // Add ingredient with highlighting if from fridge
            if (isFromFridge) {
                content += `<li><span class="fridge-item">${ingredient}</span> ✓</li>`;
            } else {
                content += `<li>${ingredient}</li>`;
            }
        });
        
        content += '</ul>';
    }
    
    // Add instructions if available
    if (meal.instructions) {
        content += `<p><strong>Instructions:</strong></p><p>${meal.instructions}</p>`;
    }
    
    return content;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initApp().then(() => {
        console.log("App initialized successfully");
    }).catch(error => {
        console.error("Error initializing app:", error);
    });
});
