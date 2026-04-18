import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getQuestions, verifyAnswer } from "../services/quizService";
import { COLORS, RADIUS, SPACING, TYPO } from "../theme/theme";
import { router } from "expo-router";

export default function StudentQuiz({ courseCode, chapter, level }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const quizStateKey = `quiz_${courseCode}_${chapter}_${level}`;

  const [quizState, setQuizState] = useState({
    answers: {},
    currentIndex: 0,
    quizFinished: false,
  });

  const loadInitialState = async () => {
    try {
      const saved = await AsyncStorage.getItem(quizStateKey);
      if (saved) {
        setQuizState(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const data = await getQuestions(courseCode, chapter, level, token);
      setQuestions(data);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [courseCode, chapter, level]);

  useEffect(() => {
    loadInitialState();
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    AsyncStorage.setItem(quizStateKey, JSON.stringify(quizState));
  }, [quizState, quizStateKey]);

  const { answers, currentIndex, quizFinished } = quizState;

  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const incorrectCount = Object.values(answers).filter(a => a.selectedOption && !a.isCorrect).length;

  const currentAnswer = answers[currentIndex] || {};
  const selectedOption = currentAnswer.selectedOption || "";
  const verificationResult = currentAnswer.verificationResult || null;

  const handleOptionSelect = (opt) => {
    if (verificationResult) return;
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentIndex]: {
          ...prev.answers[prev.currentIndex],
          selectedOption: opt,
        }
      }
    }));
  };

  const handleVerify = async () => {
    if (!selectedOption || isVerifying || verificationResult) return;
    setIsVerifying(true);
    
    try {
      const token = await AsyncStorage.getItem("token");
      const currentQ = questions[currentIndex];
      
      const res = await verifyAnswer(currentQ._id, selectedOption, token);
      
      setQuizState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [prev.currentIndex]: {
            ...prev.answers[prev.currentIndex],
            verificationResult: { 
              isCorrect: res.isCorrect, 
              explanation: res.explanation, 
              correctAnswer: res.correctAnswer 
            },
            isCorrect: res.isCorrect,
          }
        }
      }));
    } catch (err) {
      Alert.alert("Error", err.message || "Error verifying answer");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setQuizState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      setQuizState(prev => ({ ...prev, quizFinished: true }));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setQuizState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }
  };

  const handleResetQuiz = async () => {
    const newState = { answers: {}, currentIndex: 0, quizFinished: false };
    setQuizState(newState);
    await AsyncStorage.setItem(quizStateKey, JSON.stringify(newState));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.navy2} />
      </View>
    );
  }

  const formattedChapter = chapter?.replace("-", " ");

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={COLORS.navy2} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Feather name="folder-minus" size={48} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No questions yet!</Text>
        </View>
      </View>
    );
  }

  if (quizFinished) {
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={COLORS.navy2} />
          </TouchableOpacity>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Quiz Completed!</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{percentage}%</Text>
          </View>
          <Text style={styles.scoreDesc}>
            You answered <Text style={{ fontWeight: "700", color: COLORS.success }}>{correctCount}</Text> correctly out of <Text style={{ fontWeight: "700" }}>{total}</Text> questions.
          </Text>

          <View style={styles.scoreActions}>
            <TouchableOpacity style={styles.reviewBtn} onPress={() => setQuizState(prev => ({ ...prev, quizFinished: false, currentIndex: 0 }))}>
              <Text style={styles.reviewText}>Review Answers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleResetQuiz}>
              <Text style={styles.retakeText}>Retake Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={COLORS.navy2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle} style={{textTransform: 'capitalize'}}>{formattedChapter} Quiz</Text>
          <Text style={styles.pageSubtitle} style={{textTransform: 'capitalize'}}>{level}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Question {currentIndex + 1} of {totalQ}</Text>
        </View>

        <Text style={styles.questionText}>
          <Text style={{ color: COLORS.navy2 }}>Q{currentIndex + 1}:</Text> {currentQ.questionText}
        </Text>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const disabled = !!verificationResult;
            let optionStyle = [styles.optionCard];
            if (isSelected) optionStyle.push(styles.optionCardSelected);
            if (disabled && !isSelected && verificationResult?.correctAnswer !== opt) {
              optionStyle.push(styles.optionCardFaded);
            }

            return (
              <TouchableOpacity
                key={i}
                style={optionStyle}
                onPress={() => handleOptionSelect(opt)}
                disabled={disabled}
              >
                <View style={[styles.optionDot, isSelected && styles.optionDotSelected]} />
                <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}:</Text>
                <Text style={styles.optionValue}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!verificationResult ? (
          <TouchableOpacity
            style={[styles.verifyBtn, (!selectedOption || isVerifying) && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={!selectedOption || isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.verifyText}>Verify Answer</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={[styles.resultBox, verificationResult.isCorrect ? styles.resultBoxCorrect : styles.resultBoxIncorrect]}>
            <View style={styles.resultTitleRow}>
              <Feather name={verificationResult.isCorrect ? "check-circle" : "x-circle"} size={20} color={verificationResult.isCorrect ? COLORS.success : COLORS.error} />
              <Text style={[styles.resultTitle, { color: verificationResult.isCorrect ? COLORS.success : COLORS.error }]}>
                {verificationResult.isCorrect ? "Correct!" : "Incorrect!"}
              </Text>
            </View>

            {!verificationResult.isCorrect && (
              <Text style={styles.resultCorrectAnswer}>
                Correct Answer: <Text style={{ color: COLORS.success, fontWeight: "700" }}>{verificationResult.correctAnswer}</Text>
              </Text>
            )}

            {verificationResult.explanation ? (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>Explanation:</Text>
                <Text style={styles.explanationText}>{verificationResult.explanation}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.statsRow}>
          <Text style={styles.statText}><Feather name="check" size={14} color={COLORS.success} /> {correctCount}</Text>
          <Text style={styles.statText}><Feather name="x" size={14} color={COLORS.error} /> {incorrectCount}</Text>
        </View>
        <View style={styles.navActions}>
          <TouchableOpacity style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]} onPress={handlePrevious} disabled={currentIndex === 0}>
            <Feather name="chevron-left" size={24} color={currentIndex === 0 ? COLORS.border : COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navBtnNext} 
            onPress={() => {
              if (!verificationResult) {
                if (!selectedOption) Alert.alert("Select an Option", "Please select an answer first!");
                else handleVerify();
              } else {
                handleNext();
              }
            }}
          >
            <Text style={styles.navBtnNextText}>{currentIndex + 1 === totalQ && verificationResult ? "View Score" : "Next"}</Text>
            <Feather name="chevron-right" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: { ...TYPO.h2, fontSize: 18 },
  pageSubtitle: { ...TYPO.body, marginTop: 2 },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  progressHeader: { marginBottom: 16 },
  progressText: { fontSize: 14, fontWeight: "700", color: COLORS.grey },
  questionText: { fontSize: 18, fontWeight: "700", color: COLORS.text, lineHeight: 26, marginBottom: 24 },
  optionsContainer: { gap: 12 },
  optionCard: {
    flexDirection: "row", alignItems: "center", padding: 16, borderRadius: RADIUS.card,
    backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.border
  },
  optionCardSelected: { borderColor: COLORS.navy2, backgroundColor: "rgba(2, 16, 36, 0.05)" },
  optionCardFaded: { opacity: 0.5 },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.border, marginRight: 12 },
  optionDotSelected: { borderColor: COLORS.navy2, backgroundColor: COLORS.navy2 },
  optionLetter: { fontSize: 16, fontWeight: "700", marginRight: 8, color: COLORS.text },
  optionValue: { fontSize: 15, color: COLORS.text, flex: 1 },
  verifyBtn: { backgroundColor: COLORS.navy2, paddingVertical: 16, borderRadius: RADIUS.button, alignItems: "center", marginTop: 32 },
  verifyBtnDisabled: { opacity: 0.5 },
  verifyText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  resultBox: { marginTop: 24, padding: 16, borderRadius: RADIUS.card, borderWidth: 1 },
  resultBoxCorrect: { backgroundColor: "rgba(46, 204, 113, 0.1)", borderColor: "#2ecc71" },
  resultBoxIncorrect: { backgroundColor: "rgba(231, 76, 60, 0.1)", borderColor: "#e74c3c" },
  resultTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  resultTitle: { fontSize: 18, fontWeight: "800" },
  resultCorrectAnswer: { fontSize: 14, color: COLORS.text, marginBottom: 12 },
  explanationBox: { marginTop: 8 },
  explanationLabel: { fontSize: 13, fontWeight: "700", color: COLORS.grey, marginBottom: 4 },
  explanationText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bottomBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white
  },
  statsRow: { flexDirection: "row", gap: 16 },
  statText: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  navActions: { flexDirection: "row", gap: 12, alignItems: "center" },
  navBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  navBtnDisabled: { opacity: 0.5 },
  navBtnNext: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.navy2, paddingHorizontal: 20, height: 44, borderRadius: 22 },
  navBtnNextText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  scoreContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl },
  scoreTitle: { ...TYPO.h1, fontSize: 24, marginBottom: 32 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.card, borderWidth: 8, borderColor: COLORS.navy2, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  scoreText: { fontSize: 32, fontWeight: "800", color: COLORS.navy2 },
  scoreDesc: { fontSize: 16, color: COLORS.text, textAlign: "center", lineHeight: 24, marginBottom: 40 },
  scoreActions: { flexDirection: "row", gap: 16, width: "100%" },
  reviewBtn: { flex: 1, paddingVertical: 16, borderRadius: RADIUS.button, backgroundColor: "#3498db", alignItems: "center" },
  reviewText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  retakeBtn: { flex: 1, paddingVertical: 16, borderRadius: RADIUS.button, backgroundColor: "#e74c3c", alignItems: "center" },
  retakeText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
});
