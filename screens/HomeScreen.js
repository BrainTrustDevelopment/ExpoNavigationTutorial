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