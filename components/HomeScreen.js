import { useEffect, useState } from 'react';
import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  StatusBar
} from 'react-native';
import { Svg, G, Path, Circle } from 'react-native-svg';
// Importação correta para evitar o aviso amarelo
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, normalizeUsername } from './storage';

const alimentosEbook = [
  { id: '1', nome: 'Bife Contra Filé', calorias: 249, carb: 0, prot: 24.7 },
  { id: '2', nome: 'Filé de Peito de Frango', calorias: 81, carb: 0, prot: 16.8 },
  { id: '3', nome: 'Ovo de Galinha', calorias: 89, carb: 0.8, prot: 7.0 },
  { id: '4', nome: 'Arroz Integral Cozido', calorias: 124, carb: 25.8, prot: 2.6 },
  { id: '5', nome: 'Feijão Carioca Cozido', calorias: 76, carb: 13.6, prot: 4.8 },
  { id: '6', nome: 'Pão Integral (2 fatias)', calorias: 130, carb: 23, prot: 5.5 },
];

const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${x} ${y}`,
    'Z',
  ].join(' ');
};

const PieChart = ({ data, size = 180 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  let startAngle = 0;

  return (
    <Svg width={size} height={size}>
      <G x={size / 2} y={size / 2}>
        {data.map((slice, index) => {
          const sliceAngle = (slice.value / total) * 360;
          const path = describeArc(0, 0, radius, startAngle, startAngle + sliceAngle);
          startAngle += sliceAngle;
          return <Path key={index} d={path} fill={slice.color} />;
        })}
        <Circle cx="0" cy="0" r={radius * 0.45} fill="#F8F9FA" />
      </G>
    </Svg>
  );
};

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [objetivo, setObjetivo] = useState('perder_peso'); // 'perder_peso' ou 'ganhar_massa'
  const [resultado, setResultado] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState('');
  const [mealProt, setMealProt] = useState('');
  const [mealCarb, setMealCarb] = useState('');
  const [mealFat, setMealFat] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const normalizedUser = normalizeUsername(user);
        setUsername(normalizedUser);
        const userDataStr = await AsyncStorage.getItem(`user_${normalizedUser}`);
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setEmail(userData.email);
        }
        const questionnaireStr = await AsyncStorage.getItem(`${user}_questionnaire`);
        if (questionnaireStr) {
          setQuestionnaire(JSON.parse(questionnaireStr));
        }
        const savedPeso = await AsyncStorage.getItem(`${user}_peso`) || '';
        const savedAltura = await AsyncStorage.getItem(`${user}_altura`) || '';
        const savedIdade = await AsyncStorage.getItem(`${user}_idade`) || '';
        const savedResultado = await AsyncStorage.getItem(`${user}_resultado`);
        const savedMeals = await AsyncStorage.getItem(`${user}_meals`);
        setPeso(savedPeso);
        setAltura(savedAltura);
        setIdade(savedIdade);
        if (savedResultado) {
          setResultado(JSON.parse(savedResultado));
        }
        if (savedMeals) {
          setMeals(JSON.parse(savedMeals));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const saveUserData = async (key, value) => {
    try {
      await AsyncStorage.setItem(`${username}_${key}`, value);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const saveMeals = async (newMeals) => {
    try {
      await AsyncStorage.setItem(`${username}_meals`, JSON.stringify(newMeals));
    } catch (error) {
      console.error('Erro ao salvar refeições:', error);
    }
  };

  const handleAddMeal = async () => {
    if (!mealName.trim() || !mealProt.trim() || !mealCarb.trim() || !mealFat.trim()) {
      Alert.alert("Atenção", "Preencha o nome e os macronutrientes da refeição.");
      return;
    }

    const newMeal = {
      id: Date.now().toString(),
      name: mealName.trim(),
      prot: parseFloat(mealProt),
      carb: parseFloat(mealCarb),
      fat: parseFloat(mealFat),
    };

    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    await saveMeals(updatedMeals);
    setMealName('');
    setMealProt('');
    setMealCarb('');
    setMealFat('');
  };

  const agendarLembretes = async () => {
    Alert.alert("Lembretes", "Funcionalidade de notificações será implementada em breve com desenvolvimento build. Por enquanto, você pode usar os lembretes do seu celular!");
  };

  const calcularPlano = async () => {
    if (!peso || !altura || !idade || !questionnaire) {
      Alert.alert("Atenção", "Preencha todos os campos e complete o questionário.");
      return;
    }

    const p = parseFloat(peso);
    const a = parseFloat(altura);
    const i = parseInt(idade);

    // Cálculo da TMB baseado no sexo
    let tmb;
    if (questionnaire[1] === 'Masculino') {
      tmb = 66.5 + (13.75 * p) + (5 * a) - (6.75 * i);
    } else {
      tmb = 655.1 + (9.563 * p) + (1.85 * a) - (4.676 * i);
    }

    // Adicionar gasto calórico dos exercícios
    const exerciseCalories = parseFloat(questionnaire.exerciseCalories || 0);
    const tmbComExercicio = tmb + (exerciseCalories / 7); // Média diária

    // Calcular déficit ou superávit baseado no objetivo
    let caloriasObjetivo;
    if (questionnaire[2] === 'Perder peso') {
      caloriasObjetivo = tmbComExercicio - 500; // Déficit de 500 kcal
    } else {
      caloriasObjetivo = tmbComExercicio + 300; // Superávit de 300 kcal para ganho de massa
    }

    const agua = p * 0.035;
    const thisObjective = questionnaire?.[2] ||
      (objetivo === 'perder_peso'
        ? 'Perder peso'
        : objetivo === 'superavit_calorico'
          ? 'Superávit calórico'
          : 'Ganhar massa magra');
    const isGain = thisObjective === 'Ganhar massa magra' || thisObjective === 'Superávit calórico';

    const proteinaGramas = isGain ? Math.round(p * 3) : Math.round(p * 1.8);
    const proteinaCalorias = proteinaGramas * 4;
    const restanteCalorias = Math.max(caloriasObjetivo - proteinaCalorias, 0);
    const carbsRatio = isGain ? 0.5 : 0.35;
    const fatRatio = isGain ? 0.35 : 0.45;

    const carboidratos = Math.round((restanteCalorias * carbsRatio) / 4);
    const gorduras = Math.round((restanteCalorias * fatRatio) / 9);
    const formulaProteina = isGain
      ? '3g de proteína por kg corporal'
      : '1,8g de proteína por kg corporal';

    const res = {
      calorias: caloriasObjetivo.toFixed(0),
      agua: agua.toFixed(1),
      proteina: proteinaGramas,
      carboidratos,
      gorduras,
      objetivo: thisObjective,
      exercicio: questionnaire?.[3] === 'Sim, pratico' ? 'Sim' : 'Não',
      formulaProteina
    };

    setResultado(res);

    // Salvar dados
    await saveUserData('peso', peso);
    await saveUserData('altura', altura);
    await saveUserData('idade', idade);
    await saveUserData('resultado', JSON.stringify(res));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    navigation.replace('Login');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>NutriFoco</Text>
            <Text style={styles.subtitle}>Plano de Emagrecimento</Text>
            <Text style={styles.user}>Usuário: {username}</Text>
            {email ? <Text style={styles.user}>E-mail: {email}</Text> : null}
            <View style={styles.orangeLine} />
          </View>

          <View style={styles.cardForm}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 70" 
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
            />

            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 165" 
              keyboardType="numeric"
              value={altura}
              onChangeText={setAltura}
            />

            <Text style={styles.label}>Idade</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 30" 
              keyboardType="numeric"
              value={idade}
              onChangeText={setIdade}
            />

            <Text style={styles.label}>Objetivo</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity 
                style={[styles.radioButton, objetivo === 'perder_peso' && styles.radioSelected]}
                onPress={() => setObjetivo('perder_peso')}
              >
                <Text style={styles.radioText}>Perder Peso</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, objetivo === 'ganhar_massa' && styles.radioSelected]}
                onPress={() => setObjetivo('ganhar_massa')}
              >
                <Text style={styles.radioText}>Ganhar Massa Magra</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, objetivo === 'superavit_calorico' && styles.radioSelected]}
                onPress={() => setObjetivo('superavit_calorico')}
              >
                <Text style={styles.radioText}>Superávit Calórico</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={calcularPlano}>
              <Text style={styles.buttonText}>CALCULAR AGORA</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#2196F3', marginTop: 10 }]} 
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.buttonText}>EDITAR PERFIL</Text>
          </TouchableOpacity>

          {resultado && (
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Resultado Nutricional</Text>
              <View style={styles.chartCard}>
                <PieChart
                  data={[
                    { label: 'Proteína', value: resultado.proteina, color: '#FF7A00' },
                    { label: 'Carboidratos', value: resultado.carboidratos, color: '#4CAF50' },
                    { label: 'Gorduras', value: resultado.gorduras, color: '#2196F3' },
                  ]}
                  size={190}
                />
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF7A00' }]} />
                    <Text style={styles.legendText}>Proteína: {resultado.proteina}g</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.legendText}>Carboidratos: {resultado.carboidratos}g</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
                    <Text style={styles.legendText}>Gorduras: {resultado.gorduras}g</Text>
                  </View>
                </View>
                <Text style={styles.formulaText}>
                  {resultado.formulaProteina}
                </Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Calorias</Text>
                    <Text style={styles.summaryValue}>{resultado.calorias} kcal</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Água</Text>
                    <Text style={styles.summaryValue}>{resultado.agua} L</Text>
                  </View>
                </View>
              </View>

              <View style={styles.addMealCard}>
                <Text style={styles.addMealTitle}>Adicionar Refeição</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da refeição"
                  value={mealName}
                  onChangeText={setMealName}
                />
                <View style={styles.mealInputRow}>
                  <TextInput
                    style={[styles.input, styles.mealInput]}
                    placeholder="Proteína (g)"
                    keyboardType="numeric"
                    value={mealProt}
                    onChangeText={setMealProt}
                  />
                  <TextInput
                    style={[styles.input, styles.mealInput]}
                    placeholder="Carboidratos (g)"
                    keyboardType="numeric"
                    value={mealCarb}
                    onChangeText={setMealCarb}
                  />
                </View>
                <View style={styles.mealInputRow}>
                  <TextInput
                    style={[styles.input, styles.mealInput]}
                    placeholder="Gorduras (g)"
                    keyboardType="numeric"
                    value={mealFat}
                    onChangeText={setMealFat}
                  />
                  <TouchableOpacity style={[styles.button, styles.addMealButton]} onPress={handleAddMeal}>
                    <Text style={styles.buttonText}>ADICIONAR</Text>
                  </TouchableOpacity>
                </View>

                {meals.length > 0 && (
                  <View style={styles.mealList}>
                    <Text style={[styles.addMealTitle, { marginBottom: 10 }]}>Refeições adicionadas</Text>
                    {meals.map((meal) => (
                      <View key={meal.id} style={styles.mealItem}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealMacros}>P: {meal.prot}g • C: {meal.carb}g • G: {meal.fat}g</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.foodListContainer}>
            <Text style={styles.sectionTitle}>Sugestões do seu eBook</Text>
            {alimentosEbook.map((item) => (
              <View key={item.id} style={styles.foodItem}>
                <View>
                  <Text style={styles.foodName}>{item.nome}</Text>
                  <Text style={styles.foodMacros}>P: {item.prot}g | C: {item.carb}g</Text>
                </View>
                <Text style={styles.foodKcal}>{item.calorias} kcal</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#f44336', marginTop: 20 }]} 
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>SAIR</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },
  user: { fontSize: 14, color: '#999', marginTop: 5 },
  orangeLine: { height: 4, width: 60, backgroundColor: '#FF7A00', marginTop: 8 },
  cardForm: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    padding: 20, 
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 15,
    fontSize: 16
  },
  button: { 
    backgroundColor: '#FF7A00', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    margin: 20 
  },
  resultItem: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center',
    width: '45%',
    elevation: 2
  },
  resultEmoji: { fontSize: 24 },
  resultValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  resultLabel: { fontSize: 12, color: '#999' },
  resultSubLabel: { fontSize: 10, color: '#666', marginTop: 2 },
  resultSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 10
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20
  },
  chartLegend: {
    width: '100%',
    marginTop: 15
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10
  },
  legendText: {
    fontSize: 14,
    color: '#333'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  summaryItem: {
    alignItems: 'center',
    width: '48%'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  formulaText: {
    fontSize: 12,
    color: '#FF7A00',
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center'
  },
  addMealCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  addMealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  mealInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10
  },
  mealInput: {
    flex: 1
  },
  addMealButton: {
    flex: 1,
    backgroundColor: '#4CAF50'
  },
  mealList: {
    marginTop: 15
  },
  mealItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  mealName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  mealMacros: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  foodListContainer: { paddingHorizontal: 20, marginTop: 10 },
  listTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  foodItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A00'
  },
  foodName: { fontSize: 15, fontWeight: 'bold', color: '#444' },
  foodMacros: { fontSize: 12, color: '#999' },
  foodKcal: { fontSize: 15, fontWeight: 'bold', color: '#FF7A00' },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  radioButton: { 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    backgroundColor: '#FFF',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  radioSelected: { backgroundColor: '#FF7A00', borderColor: '#FF7A00' },
  radioText: { color: '#333', fontWeight: 'bold' }
});