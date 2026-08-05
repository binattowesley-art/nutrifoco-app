import React, { useState } from 'react';
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
import { getUserByUsername, saveUser, setCurrentUser, normalizeUsername } from './storage';
import { supabase } from './supabaseClient';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (mode === 'signup') {
      if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
        Alert.alert("Atenção", "Preencha todos os campos para cadastrar.");
        return;
      }

      const existingUser = await getUserByUsername(trimmedUsername);
      if (existingUser) {
        Alert.alert("Erro", "Usuário já existe. Tente fazer login.");
        return;
      }

      const normalizedUsername = normalizeUsername(trimmedUsername);
      const userData = {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
      };

      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          console.error('Supabase signUp error:', error);
        }

        if (data?.user) {
          console.log('Usuário criado no Supabase:', data.user.id);
        }
      } catch (supabaseError) {
        console.error('Erro ao criar usuário no Supabase:', supabaseError);
      }

      await saveUser(userData);
      await setCurrentUser(normalizedUsername);
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      navigation.replace('Questionnaire');
    } else {
      if (!trimmedUsername || !trimmedPassword) {
        Alert.alert("Atenção", "Preencha usuário e senha.");
        return;
      }

      const existingUser = await getUserByUsername(trimmedUsername);
      if (!existingUser) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      const userData = existingUser.data;
      if (userData.password !== trimmedPassword) {
        Alert.alert("Erro", "Senha incorreta.");
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: trimmedPassword,
        });

        if (error) {
          console.error('Supabase signIn error:', error);
        } else if (data?.user) {
          console.log('Usuário autenticado no Supabase:', data.user.id);
        }
      } catch (supabaseError) {
        console.error('Erro ao autenticar no Supabase:', supabaseError);
      }

      const normalizedUsername = normalizeUsername(trimmedUsername);
      await setCurrentUser(normalizedUsername);
      const questionnaireData = await AsyncStorage.getItem(`${normalizedUsername}_questionnaire`);
      if (questionnaireData) {
        navigation.replace('Home');
      } else {
        navigation.replace('Questionnaire');
      }
    }
  };

  const forgotPassword = async () => {
    Alert.alert(
      "Recuperação de Senha",
      "Insira seu nome de usuário e e-mail para recuperar sua senha",
      [
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]
    );
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>NutriFoco</Text>
      <Text style={styles.subtitle}>
        {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
      </Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Nome de usuário" 
        value={username}
        onChangeText={setUsername}
      />

      {mode === 'signup' && (
        <TextInput 
          style={styles.input} 
          placeholder="E-mail" 
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      )}

      <TextInput 
        style={styles.input} 
        placeholder="Senha" 
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {mode === 'login' ? 'ENTRAR' : 'CADASTRAR'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleMode}>
        <Text style={styles.toggleText}>
          {mode === 'login' ? 'Novo usuário? Cadastre-se' : 'Já tem conta? Faça login'}
        </Text>
      </TouchableOpacity>

      {mode === 'login' && (
        <TouchableOpacity onPress={forgotPassword}>
          <Text style={styles.forgotText}>Esqueci a senha</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA',
    padding: 20
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 30 },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 15, 
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFF'
  },
  button: { 
    backgroundColor: '#FF7A00', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  toggleText: { color: '#FF7A00', fontSize: 16, textDecorationLine: 'underline' },
  forgotText: { color: '#666', fontSize: 14, textDecorationLine: 'underline', marginTop: 10 }
});