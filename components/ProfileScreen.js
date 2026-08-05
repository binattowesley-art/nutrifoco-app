import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, normalizeUsername } from './storage';

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const normalizedUser = normalizeUsername(user);
        setUsername(normalizedUser);
        const userDataStr = await AsyncStorage.getItem(`user_${normalizedUser}`);
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setEmail(userData.email);
          setPassword(userData.password);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const saveProfile = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Atenção", "Preencha e-mail e senha atual.");
      return;
    }

    try {
      const userData = { username, email, password: newPassword || password };
      await AsyncStorage.setItem(`user_${username}`, JSON.stringify(userData));
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar perfil.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      
      <Text style={styles.label}>Nome de usuário (não editável)</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: '#EEE' }]} 
        value={username}
        editable={false}
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput 
        style={styles.input} 
        placeholder="E-mail" 
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Senha Atual</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Senha atual" 
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Nova Senha (opcional)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Nova senha" 
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#666' }]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>CANCELAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFF'
  },
  button: { 
    backgroundColor: '#FF7A00', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});