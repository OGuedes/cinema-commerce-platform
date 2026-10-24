import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const screenTitle = 'Cinema Commerce Mobile';
  const [cartItems, setCartItems] = useState(0);

  function addItemToCart() {
    setCartItems((currentItems) => currentItems + 1);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.label}>Aplicativo móvel</Text>
        <Text style={styles.title}>{screenTitle}</Text>
        <Text style={styles.description}>Itens no carrinho: {cartItems}</Text>

        <Pressable style={styles.button} onPress={addItemToCart}>
          <Text style={styles.buttonText}>Adicionar item de teste</Text>
        </Pressable>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  card: {
    padding: 28,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  label: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    marginTop: 10,
    color: '#4b5563',
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#b91c1c',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
