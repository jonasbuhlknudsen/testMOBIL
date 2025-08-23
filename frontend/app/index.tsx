import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  // Auto-navigate to tabs after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/connect');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nerdværket</Text>
      <Text style={styles.subtitle}>Starter app...</Text>
      
      <Link href="/(tabs)/connect" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Gå til App Nu</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e1a',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f0f4f8',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#00d4ff',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#001a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});