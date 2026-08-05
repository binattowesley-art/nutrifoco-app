import AsyncStorage from '@react-native-async-storage/async-storage';

export const normalizeUsername = (value = '') => value.trim().toLowerCase();

export const getUserStorageKey = (username) => `user_${normalizeUsername(username)}`;

export const getAllUsers = async () => {
  try {
    const raw = await AsyncStorage.getItem('app_users');
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Erro ao ler usuários:', error);
    return {};
  }
};

export const getUserByUsername = async (username) => {
  const normalized = normalizeUsername(username);
  const users = await getAllUsers();

  if (users[normalized]) {
    return { key: normalized, data: users[normalized] };
  }

  const legacyKey = getUserStorageKey(username);
  const legacyData = await AsyncStorage.getItem(legacyKey);
  if (legacyData) {
    try {
      const parsed = JSON.parse(legacyData);
      await saveUser(parsed);
      return { key: normalized, data: parsed };
    } catch (error) {
      console.error('Erro ao migrar usuário legado:', error);
    }
  }

  return null;
};

export const saveUser = async (userData) => {
  const normalized = normalizeUsername(userData.username);
  const users = await getAllUsers();

  users[normalized] = {
    ...userData,
    username: userData.username,
  };

  await AsyncStorage.setItem('app_users', JSON.stringify(users));
  await AsyncStorage.setItem(`user_${normalized}`, JSON.stringify(users[normalized]));
  await AsyncStorage.setItem('currentUser', normalized);
  return normalized;
};

export const getCurrentUser = async () => {
  try {
    return (await AsyncStorage.getItem('currentUser')) || null;
  } catch (error) {
    console.error('Erro ao ler usuário atual:', error);
    return null;
  }
};

export const setCurrentUser = async (username) => {
  const normalized = normalizeUsername(username);
  await AsyncStorage.setItem('currentUser', normalized);
  return normalized;
};
