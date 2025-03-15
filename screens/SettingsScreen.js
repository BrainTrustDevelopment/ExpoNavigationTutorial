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
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  helpButtonText: {
    fontSize: 14,
    color: '#0096c7',
    marginLeft: 8,
  }
});

export default SettingsScreen;