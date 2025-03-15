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