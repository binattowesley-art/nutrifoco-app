import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const questions = [
  {
    id: 1,
    question: "Qual o seu sexo?",
    type: "radio",
    options: ["Masculino", "Feminino"]
  },
  {
    id: 2,
    question: "Você quer perder peso, ganhar massa magra ou ter superávit calórico?",
    type: "radio",
    options: ["Perder peso", "Ganhar massa magra", "Superávit calórico"]
  },
  {
    id: 3,
    question: "Você pratica exercícios? Se sim, qual é o seu gasto calórico?",
    type: "exercise",
    options: ["Não pratico", "Sim, pratico"]
  },
  {
    id: 4,
    question: "Gostaria de receber lembretes com os horários de alimentação e de beber água?",
    type: "radio",
    options: ["Sim", "Não"]
  },
  {
    id: 5,
    question: "Você está pronto(a) para se desafiar e alcançar a melhor versão de você mesmo com passos simples e coisas que temos em nosso dia a dia?",
    type: "radio",
    options: ["Sim, estou pronto(a)!", "Não, ainda não"]
  }
];

export default function QuestionnaireScreen({ navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [exerciseCalories, setExerciseCalories] = useState('');

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    const question = questions[currentQuestion];

    if (question.type === 'exercise' && answers[question.id] === 'Sim, pratico' && !exerciseCalories.trim()) {
      Alert.alert("Atenção", "Por favor, informe seu gasto calórico semanal.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      saveQuestionnaire();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const saveQuestionnaire = async () => {
    try {
      const username = await AsyncStorage.getItem('currentUser');
      const questionnaireData = {
        ...answers,
        exerciseCalories: answers[3] === 'Sim, pratico' ? exerciseCalories : '0',
        completed: true
      };

      await AsyncStorage.setItem(`${username}_questionnaire`, JSON.stringify(questionnaireData));
      navigation.replace('Home');
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar questionário.");
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Questionário Nutricional</Text>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          {currentQuestion + 1} de {questions.length}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>{question.question}</Text>

        {question.type === 'radio' && (
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[question.id] === option && styles.selectedOption
                ]}
                onPress={() => handleAnswer(question.id, option)}
              >
                <Text style={[
                  styles.optionText,
                  answers[question.id] === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'exercise' && (
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[question.id] === option && styles.selectedOption
                ]}
                onPress={() => handleAnswer(question.id, option)}
              >
                <Text style={[
                  styles.optionText,
                  answers[question.id] === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            {answers[question.id] === 'Sim, pratico' && (
              <TextInput
                style={styles.input}
                placeholder="Gasto calórico semanal (kcal)"
                keyboardType="numeric"
                value={exerciseCalories}
                onChangeText={setExerciseCalories}
              />
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={[styles.button, styles.previousButton]} onPress={handlePrevious}>
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 30,
    justifyContent: 'center'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 10
  },
  progressText: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#333',
    fontWeight: 'bold'
  },
  questionContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  optionsContainer: {
    gap: 10
  },
  optionButton: {
    padding: 15,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF'
  },
  selectedOption: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF5E6'
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center'
  },
  selectedOptionText: {
    color: '#FF7A00',
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    fontSize: 16,
    backgroundColor: '#FFF'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20
  },
  button: {
    flex: 1,
    backgroundColor: '#FF7A00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  previousButton: {
    backgroundColor: '#666'
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});