import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import diagnosticsTool from '../services/DiagnosticsTool';

interface DiagnosticsScreenProps {
  navigation: NavigationProp<any>;
}

const DiagnosticsScreen = ({navigation}: DiagnosticsScreenProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionQuality, setConnectionQuality] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Update logs every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(diagnosticsTool.getLogs());
      setConnectionQuality(diagnosticsTool.getConnectionQuality());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshDiagnostics = async () => {
    setRefreshing(true);
    try {
      const quality = await diagnosticsTool.checkConnectionQuality();
      setConnectionQuality(quality);
      setLogs(diagnosticsTool.getLogs());
    } catch (error) {
      console.error('Error refreshing diagnostics:', error);
    }
    setRefreshing(false);
  };

  // Get color based on connection quality
  const getQualityColor = (quality: number) => {
    if (quality >= 80) return '#4CAF50'; // Green
    if (quality >= 50) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connection Diagnostics</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Connection quality indicator */}
      <View style={styles.qualityContainer}>
        <Text style={styles.qualityLabel}>Connection Quality</Text>
        <View style={styles.qualityBarContainer}>
          <View 
            style={[
              styles.qualityBar, 
              {
                width: `${connectionQuality}%`, 
                backgroundColor: getQualityColor(connectionQuality)
              }
            ]} 
          />
        </View>
        <Text style={[styles.qualityText, {color: getQualityColor(connectionQuality)}]}>
          {connectionQuality}%
        </Text>

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={refreshDiagnostics}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? 'Checking...' : 'Check Connection'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Connection Logs</Text>
      <FlatList
        data={logs}
        renderItem={({item}) => <Text style={styles.logItem}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
        style={styles.logList}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Debug logs are automatically saved for troubleshooting
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  qualityContainer: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qualityBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
  },
  qualityBar: {
    height: '100%',
    borderRadius: 10,
  },
  qualityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  logList: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  logItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#757575',
    fontSize: 12,
  },
});

export default DiagnosticsScreen;
