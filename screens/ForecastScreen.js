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