# Part 1 - Building a Weather Dashboard App with Expo Navigation

Welcome to this beginner-friendly tutorial for building a multi-page Weather Dashboard app using Expo and React Navigation! This guide is designed to walk you through the process step-by-step with clear explanations of what each part does.

## What We'll Build

By the end of this tutorial, you'll have created a Weather Dashboard app with:

- Three screens (Home, Forecast, and Settings)
- Bottom tab navigation
- Real-time weather data
- User-customizable settings

## Prerequisites

- Basic JavaScript knowledge
- A computer with Node.js installed
- A smartphone with the Expo Go app installed (for testing)

## Step 1: Setting Up Your Project

Let's start by creating a new Expo project:

```bash
# Install the Expo CLI if you don't have it
npm install -g expo-cli

# Create a new Expo project
npx create-expo-app --template

# When prompted, choose "blank" template

# Name the app weather-dashboard
```

Navigate to your project folder:

```bash
cd weather-dashboard
```

## Step 2: Installing Navigation Dependencies

Expo projects don't come with navigation pre-installed, so we need to add it:

```bash
# Install navigation libraries
npx expo install @react-navigation/native @react-navigation/bottom-tabs

# Install supporting libraries
npx expo install react-native-screens react-native-safe-area-context

# Install AsyncStorage for saving user preferences
npx expo install @react-native-async-storage/async-storage

# Install Icons
npx expo install @expo/vector-icons

# Run in browser
npx expo install react-dom react-native-web @expo/metro-runtime
```

> 💡 **TIP:** Using `npx expo install` instead of `npm install` ensures that you get versions compatible with your Expo SDK version.

## Step 3: Setting Up Your Project Structure

Let's organize our project:

```bash
# Create a screens directory for our different pages
mkdir screens

# Create a screens folder for our main components
touch screens/HomeScreen.js
touch screens/ForecastScreen.js
touch screens/SettingsScreen.js
```

## Step 4: Getting a Weather API Key

We'll use OpenWeatherMap's free API:

1. Go to [OpenWeatherMap](https://openweathermap.org/api) and create a free account
2. Once registered, go to the "API Keys" tab
3. Copy your API key - we'll use it in our app
4. For use today : `204e4c6455b32a870afe53535fe728c4`

> ⚠️ **Note:** In a real project, you should never hardcode your API key or include it in GitHub repositories. For simplicity in this tutorial, we'll place it directly in our code.

## Step 5: Setting Up Navigation

Open `App.js` and replace its contents with:

```javascript
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Import our screens
import HomeScreen from './screens/HomeScreen';
import ForecastScreen from './screens/ForecastScreen';
import SettingsScreen from './screens/SettingsScreen';

// Create our tab navigator
const Tab = createBottomTabNavigator();

// Your OpenWeatherMap API key (get yours at openweathermap.org)
const API_KEY = 'your_api_key_here'; // Replace with your actual API key

export default function App() {
  // State to store weather data and user settings
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    location: 'London',
    units: 'metric' // 'metric' for Celsius, 'imperial' for Fahrenheit
  });

  // Load saved settings when app starts
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
    // When settings change, fetch new weather data
    fetchWeatherData();
  }, [settings]);

  // Function to load settings from device storage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('weatherSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  // Function to save settings to device storage
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('weatherSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  // Function to fetch weather data from the API
  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Get current weather using axios
      const weatherResponse = await axios.get(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            q: settings.location,
            units: settings.units,
            appid: API_KEY
          }
        }
      );
      
      // With axios, we don't need to check response.ok or call .json()
      // Data is already in the response.data property
      setWeatherData(weatherResponse.data);
      
      // Get forecast data (5 days, every 3 hours)
      const forecastResponse = await axios.get(
        'https://api.openweathermap.org/data/2.5/forecast',
        {
          params: {
            q: settings.location,
            units: settings.units,
            appid: API_KEY
          }
        }
      );
      
      setForecastData(forecastResponse.data);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // With axios, error handling is a bit cleaner
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server responded with error:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request error:', error.message);
      }
      // In a real app, you'd want to show an error message to the user
    } finally {
      setLoading(false);
    }
  };


  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Configure the icons for each tab
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Forecast') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // Tab bar styling
          tabBarActiveTintColor: '#0096c7',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        {/* Define our screens */}
        <Tab.Screen 
          name="Home" 
          options={{ title: 'Current Weather' }}
        >
          {/* Pass props to our screen components */}
          {(props) => (
            <HomeScreen 
              {...props} 
              weatherData={weatherData} 
              loading={loading} 
              settings={settings} 
              refreshData={fetchWeatherData}
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Forecast" 
          options={{ title: '5-Day Forecast' }}
        >
          {(props) => (
            <ForecastScreen 
              {...props} 
              forecastData={forecastData} 
              loading={loading} 
              settings={settings}
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Settings" 
          options={{ title: 'Settings' }}
        >
          {(props) => (
            <SettingsScreen 
              {...props} 
              settings={settings} 
              setSettings={setSettings}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### What's Happening in App.js?

Let's break down what this code does:

1. **Imports**: We're bringing in navigation components from React Navigation and other needed libraries.

2. **State Variables**:
   - `weatherData`: Stores current weather information
   - `forecastData`: Stores the 5-day forecast
   - `loading`: Tracks when we're fetching data
   - `settings`: Stores user preferences

3. **Functions**:
   - `loadSettings()`: Loads saved settings when the app starts
   - `saveSettings()`: Saves settings whenever they change
   - `fetchWeatherData()`: Gets weather data from the API

4. **Navigation Setup**:
   - Creates a bottom tab navigator
   - Configures icons for each tab
   - Passes data to each screen as props

## Step 6: Building the Home Screen

Now let's create our first screen that shows the current weather. Open `screens/HomeScreen.js` and add:

```javascript
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  ScrollView, 
  RefreshControl,
  SafeAreaView 
} from 'react-native';

const HomeScreen = ({ weatherData, loading, settings, refreshData }) => {
  const [refreshing, setRefreshing] = React.useState(false);

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshData().then(() => setRefreshing(false));
  }, [refreshData]);

  // Show loading indicator when we're fetching data
  if (loading && !weatherData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0096c7" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  // Show error message if we don't have weather data
  if (!weatherData) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={64} color="#6c757d" />
        <Text style={styles.errorText}>Weather data unavailable</Text>
        <Text>Check your connection and try again</Text>
      </View>
    );
  }

  // Get correct temperature symbol based on user settings
  const tempSymbol = settings.units === 'metric' ? '°C' : '°F';
  const windUnit = settings.units === 'metric' ? 'm/s' : 'mph';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Location and current date */}
        <Text style={styles.location}>
          {weatherData.name}, {weatherData.sys.country}
        </Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Current weather display */}
        <View style={styles.weatherContainer}>
          {weatherData.weather && weatherData.weather[0] && (
            <Image
              style={styles.weatherIcon}
              source={{
                uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`,
              }}
            />
          )}
          
          <Text style={styles.temperature}>
            {Math.round(weatherData.main.temp)}{tempSymbol}
          </Text>
          
          <Text style={styles.weatherDescription}>
            {weatherData.weather && weatherData.weather[0]
              ? weatherData.weather[0].description
              : 'Unknown'}
          </Text>
        </View>

        {/* Weather details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Feels Like</Text>
              <Text style={styles.detailValue}>
                {Math.round(weatherData.main.feels_like)}{tempSymbol}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weatherData.main.humidity}%</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Wind Speed</Text>
              <Text style={styles.detailValue}>
                {Math.round(weatherData.wind.speed)} {windUnit}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pressure</Text>
              <Text style={styles.detailValue}>
                {weatherData.main.pressure} hPa
              </Text>
            </View>
          </View>
        </View>

        {/* Sunrise and sunset times */}
        <View style={styles.sunInfoContainer}>
          <View style={styles.sunInfoItem}>
            <Text style={styles.sunInfoLabel}>Sunrise</Text>
            <Text style={styles.sunInfoTime}>
              {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          
          <View style={styles.sunInfoItem}>
            <Text style={styles.sunInfoLabel}>Sunset</Text>
            <Text style={styles.sunInfoTime}>
              {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  location: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212529',
  },
  date: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  weatherContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  weatherIcon: {
    width: 150,
    height: 150,
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#0096c7',
  },
  weatherDescription: {
    fontSize: 20,
    color: '#495057',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  sunInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sunInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  sunInfoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  sunInfoTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
});

export default HomeScreen;
```

### What's Happening in HomeScreen.js?

This screen:

1. **Receives props** from our App.js:
   - `weatherData`: The current weather information
   - `loading`: Whether we're fetching data
   - `settings`: User preferences for location and units
   - `refreshData`: A function to refresh the weather data

2. **Shows different views** based on the state:
   - Loading indicator while fetching data
   - Error message if no data is available
   - Current weather information when data is loaded

3. **Implements pull-to-refresh** so users can manually update the weather data

4. **Displays weather details** including:
   - Current temperature and weather condition
   - "Feels like" temperature, humidity, wind speed, and pressure
   - Sunrise and sunset times

## Step 7: Creating the Forecast Screen

Now let's build the Forecast screen to show the 5-day forecast. Open `screens/ForecastScreen.js` and add:

```javascript
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  Image,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ForecastScreen = ({ forecastData, loading, settings }) => {
  // Show loading indicator when fetching data
  if (loading && !forecastData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0096c7" />
        <Text style={styles.loadingText}>Loading forecast data...</Text>
      </View>
    );
  }

  // Show error message if no forecast data
  if (!forecastData || !forecastData.list) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={64} color="#6c757d" />
        <Text style={styles.errorText}>Forecast data unavailable</Text>
        <Text>Check your connection and try again</Text>
      </View>
    );
  }

  // Get correct temperature symbol
  const tempSymbol = settings.units === 'metric' ? '°C' : '°F';

  // Group forecast data by day
  // The API gives us data in 3-hour blocks, so we need to group them
  const groupedByDay = {};
  
  forecastData.list.forEach(item => {
    // Get date without time
    const date = new Date(item.dt * 1000).toLocaleDateString();
    
    // Create array for this date if it doesn't exist
    if (!groupedByDay[date]) {
      groupedByDay[date] = [];
    }
    
    // Add this forecast to the array
    groupedByDay[date].push(item);
  });

  // Convert the grouped forecast into an array for our FlatList
  const dailyForecasts = Object.keys(groupedByDay).map(date => {
    // Get all forecasts for this day
    const items = groupedByDay[date];
    
    // Calculate min and max temperature for the day
    const minTemp = Math.min(...items.map(item => item.main.temp_min));
    const maxTemp = Math.max(...items.map(item => item.main.temp_max));
    
    // Count occurrences of each weather condition to find the most common
    const weatherCounts = {};
    items.forEach(item => {
      const condition = item.weather[0].main;
      weatherCounts[condition] = (weatherCounts[condition] || 0) + 1;
    });
    
    // Find the most common weather condition
    let mostCommonWeather = items[0].weather[0];
    let maxCount = 0;
    
    Object.keys(weatherCounts).forEach(condition => {
      if (weatherCounts[condition] > maxCount) {
        maxCount = weatherCounts[condition];
        // Find an item with this condition to get its details
        mostCommonWeather = items.find(item => 
          item.weather[0].main === condition
        ).weather[0];
      }
    });
    
    // Return the processed data for this day
    return {
      date: new Date(items[0].dt * 1000),
      minTemp,
      maxTemp,
      weather: mostCommonWeather,
      items // Keep all items for detailed view if needed
    };
  });

  // Sort by date
  dailyForecasts.sort((a, b) => a.date - b.date);

  // Render each day's forecast
  const renderForecastItem = ({ item }) => {
    const dayName = item.date.toLocaleDateString(undefined, { weekday: 'long' });
    const formattedDate = item.date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    
    return (
      <View style={styles.forecastItem}>
        <View style={styles.forecastHeader}>
          <Text style={styles.forecastDay}>{dayName}</Text>
          <Text style={styles.forecastDate}>{formattedDate}</Text>
        </View>
        
        <View style={styles.forecastContent}>
          <Image
            style={styles.forecastIcon}
            source={{
              uri: `https://openweathermap.org/img/wn/${item.weather.icon}@2x.png`
            }}
          />
          
          <View style={styles.forecastDetails}>
            <Text style={styles.forecastDescription}>
              {item.weather.description}
            </Text>
            
            <View style={styles.tempRow}>
              <Text style={styles.maxTemp}>
                {Math.round(item.maxTemp)}{tempSymbol}
              </Text>
              <Text style={styles.minTemp}>
                {Math.round(item.minTemp)}{tempSymbol}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dailyForecasts}
        renderItem={renderForecastItem}
        keyExtractor={(item) => item.date.toISOString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  forecastItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  forecastDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  forecastDate: {
    fontSize: 16,
    color: '#6c757d',
  },
  forecastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastIcon: {
    width: 70,
    height: 70,
  },
  forecastDetails: {
    flex: 1,
    marginLeft: 8,
  },
  forecastDescription: {
    fontSize: 16,
    color: '#495057',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maxTemp: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginRight: 12,
  },
  minTemp: {
    fontSize: 20,
    color: '#6c757d',
  },
});

export default ForecastScreen;
```

### What's Happening in ForecastScreen.js?

This screen handles the 5-day forecast:

1. **Data processing**:
   - Groups the 3-hour forecast data by day
   - Calculates minimum and maximum temperatures for each day
   - Determines the most common weather condition for each day

2. **Display**:
   - Shows a list of days with their forecast information
   - Each item includes the day name, date, weather icon, description, and temperature range

3. **Error handling**:
   - Shows a loading indicator while data is being fetched
   - Displays an error message if data is unavailable

## Step 8: Building the Settings Screen

Finally, let's create the Settings screen. Open `screens/SettingsScreen.js` and add:

```javascript
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  SafeAreaView
} from 'react-native';

// List of popular cities for quick selection
const POPULAR_CITIES = [
  'London',
  'New York',
  'Tokyo',
  'Paris',
  'Sydney',
  'Berlin',
  'Cairo',
  'Rio de Janeiro'
];

const SettingsScreen = ({ settings, setSettings }) => {
  // Local state for the location input
  const [locationInput, setLocationInput] = useState(settings.location);
  
  // Function to update location
  const updateLocation = () => {
    // Check if location is not empty
    if (locationInput.trim() === '') {
      Alert.alert('Error', 'Please enter a valid location');
      return;
    }
    
    // Update location in settings
    setSettings({
      ...settings,
      location: locationInput.trim()
    });
    
    Alert.alert('Success', `Location updated to ${locationInput.trim()}`);
  };
  
  // Function to toggle temperature units
  const toggleUnits = () => {
    const newUnits = settings.units === 'metric' ? 'imperial' : 'metric';
    setSettings({
      ...settings,
      units: newUnits
    });
  };
  
  // Function to select a popular city
  const selectCity = (city) => {
    setLocationInput(city);
    setSettings({
      ...settings,
      location: city
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Weather Settings</Text>
        
        {/* Location input section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            value={locationInput}
            onChangeText={setLocationInput}
            placeholder="Enter city name"
            placeholderTextColor="#adb5bd"
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={updateLocation}
          >
            <Text style={styles.buttonText}>Update Location</Text>
          </TouchableOpacity>
        </View>
        
        {/* Popular cities section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Popular Cities</Text>
          <View style={styles.citiesContainer}>
            {POPULAR_CITIES.map(city => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityButton,
                  city === settings.location && styles.activeCity
                ]}
                onPress={() => selectCity(city)}
              >
                <Text 
                  style={[
                    styles.cityButtonText,
                    city === settings.location && styles.activeCityText
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Temperature units section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Temperature Units</Text>
          <View style={styles.unitsContainer}>
            <Text style={styles.unitText}>Celsius (°C)</Text>
            <Switch
              trackColor={{ false: '#0096c7', true: '#0096c7' }}
              thumbColor={'#ffffff'}
              ios_backgroundColor="#adb5bd"
              onValueChange={toggleUnits}
              value={settings.units === 'imperial'} // on = imperial, off = metric
            />
            <Text style={styles.unitText}>Fahrenheit (°F)</Text>
          </View>
        </View>
        
        {/* About section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Weather Dashboard v1.0{'\n'}
            Created with React Native and Expo{'\n'}
            Data provided by OpenWeatherMap
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0096c7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
  },
  cityButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  activeCity: {
    backgroundColor: '#0096c7',
  },
  activeCityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  unitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 16,
    marginHorizontal: 12,
    color: '#495057',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#6c757d',
  }

# React Native Components Cheat Sheet

## Core Components

### View
**When to use:** The fundamental building block for UI, similar to a div in web.

```javascript
<View style={styles.container}>
  {/* Child components go here */}
</View>
```
**Best for:** Creating containers, layouts, and invisible structural elements.

### Text
**When to use:** For displaying any text content.

```javascript
<Text style={styles.title}>Hello World</Text>
```
**Best for:** Labels, paragraphs, headings, and any textual content.

### Image
**When to use:** To display images from various sources.

```javascript
// Local image
<Image source={require('./assets/logo.png')} style={styles.image} />

// Remote image
<Image source={{uri: 'https://example.com/image.jpg'}} style={styles.image} />
```
**Best for:** Displaying icons, photos, illustrations, and visual content.

### ScrollView
**When to use:** When content needs to be scrollable but the amount of items is small and known.

```javascript
<ScrollView>
  {/* Content that needs to scroll */}
</ScrollView>
```
**Best for:** Forms, detailed content pages, when all items need to be rendered at once.

### FlatList
**When to use:** For long lists of data where performance matters.

```javascript
<FlatList
  data={itemsArray}
  renderItem={({item}) => <Item title={item.title} />}
  keyExtractor={item => item.id}
/>
```
**Best for:** Long scrollable lists, feeds, large datasets, when only visible items should be rendered.

### SectionList
**When to use:** For sectioned lists with headers.

```javascript
<SectionList
  sections={[
    {title: 'Main dishes', data: ['Pizza', 'Burger']},
    {title: 'Sides', data: ['Fries', 'Salad']}
  ]}
  renderItem={({item}) => <Item title={item} />}
  renderSectionHeader={({section}) => <Header title={section.title} />}
  keyExtractor={(item, index) => item + index}
/>
```
**Best for:** Contact lists, categorized items, grouped data.

## Input Components

### TextInput
**When to use:** For text entry.

```javascript
<TextInput
  style={styles.input}
  onChangeText={setText}
  value={text}
  placeholder="Enter text here"
/>
```
**Best for:** Search bars, forms, text fields, user input collection.

### Button
**When to use:** For simple actions that look like native buttons.

```javascript
<Button
  title="Press me"
  onPress={() => alert('Button pressed')}
  color="#841584"
/>
```
**Best for:** Simple actions where native button look is desired.

### Switch
**When to use:** For binary choices (on/off).

```javascript
<Switch
  value={isEnabled}
  onValueChange={setIsEnabled}
/>
```
**Best for:** Toggles, settings, boolean options.

## Touchable Components

### TouchableOpacity
**When to use:** For touchable elements with opacity feedback.

```javascript
<TouchableOpacity onPress={() => console.log('Pressed!')}>
  <Text>Press Me</Text>
</TouchableOpacity>
```
**Best for:** Custom buttons, interactive elements, cards, list items.

### TouchableHighlight
**When to use:** For touchable elements with background highlight.

```javascript
<TouchableHighlight 
  onPress={() => console.log('Pressed!')}
  underlayColor="#DDDDDD"
>
  <Text>Press Me</Text>
</TouchableHighlight>
```
**Best for:** When you want visual feedback that looks more like traditional button highlights.

### Pressable (newer API)
**When to use:** For highly customizable touch interactions.

```javascript
<Pressable
  onPress={() => console.log('Pressed!')}
  style={({pressed}) => [
    {backgroundColor: pressed ? '#ddd' : 'white'}
  ]}
>
  <Text>Press Me</Text>
</Pressable>
```
**Best for:** Complex touch handling, custom interaction states.

## Layout Components

### SafeAreaView
**When to use:** To render content within the safe area boundaries of a device.

```javascript
<SafeAreaView style={styles.container}>
  {/* Content here will avoid notches and home indicators */}
</SafeAreaView>
```
**Best for:** Root component of screens to avoid notches, home indicators, etc.

### KeyboardAvoidingView
**When to use:** To ensure the keyboard doesn't cover input fields.

```javascript
<KeyboardAvoidingView 
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={styles.container}
>
  <TextInput placeholder="Type here" />
</KeyboardAvoidingView>
```
**Best for:** Forms, chat inputs, any screen with input fields near the bottom.

## Feedback Components

### ActivityIndicator
**When to use:** To show that a process is happening.

```javascript
<ActivityIndicator size="large" color="#0000ff" />
```
**Best for:** Loading states, processing indicators.

### Modal
**When to use:** For content that temporarily overlays the main view.

```javascript
<Modal
  visible={modalVisible}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContent}>
    <Text>Modal Content</Text>
    <Button title="Close" onPress={() => setModalVisible(false)} />
  </View>
</Modal>
```
**Best for:** Dialogs, confirmation screens, detailed views that overlay the main content.

### Alert
**When to use:** For simple messages that require user acknowledgment.

```javascript
Alert.alert(
  "Title",
  "Message goes here",
  [
    { text: "Cancel", style: "cancel" },
    { text: "OK", onPress: () => console.log("OK Pressed") }
  ]
);
```
**Best for:** Error messages, confirmations, simple user notifications.

## Performance Best Practices

1. **Use FlatList instead of ScrollView** for long lists.
2. **Use memo and useCallback** for component and function optimization.
3. **Avoid inline styles** and use StyleSheet for better performance.
4. **Use images with appropriate dimensions** to avoid excessive memory usage.
5. **Implement virtualization** for large datasets with FlatList's windowSize prop.

## Common Patterns

### Pull to Refresh
```javascript
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
  // other props
/>
```

### Loading State
```javascript
{isLoading ? (
  <ActivityIndicator size="large" color="#0000ff" />
) : (
  <FlatList data={data} renderItem={renderItem} />
)}
```

### Form Submission
```javascript
const handleSubmit = () => {
  if (validate()) {
    setSubmitting(true);
    submitApi(formData)
      .then(response => {
        // Handle success
      })
      .catch(error => {
        // Handle error
      })
      .finally(() => {
        setSubmitting(false);
      });
  }
};
```

### Conditional Rendering
```javascript
{user ? (
  <ProfileScreen user={user} />
) : (
  <LoginScreen onLogin={handleLogin} />
)}
```