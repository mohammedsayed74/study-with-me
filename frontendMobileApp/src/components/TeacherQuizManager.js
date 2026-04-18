import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from "../services/quizService";
import { COLORS, RADIUS, SPACING, TYPO } from "../theme/theme";
import { router } from "expo-router";

export default function TeacherQuizManager({ courseCode, chapter, level }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

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
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async () => {
    if (!formData.questionText || formData.options.some(o => !o.trim()) || !formData.correctAnswer) {
      Alert.alert("Validation Error", "Please fill all fields and select a correct answer.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const chapterNumber = chapter.replace("chapter-", "");
      const payload = {
        ...formData,
        courseCode,
        chapter: chapterNumber,
        difficulty: level,
      };

      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, payload, token);
      } else {
        await addQuestion(payload, token);
      }
      setShowModal(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save question");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Question", "Are you sure you want to delete this question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await deleteQuestion(id, token);
            fetchQuestions();
          } catch (err) {
            Alert.alert("Error", "Failed to delete question");
          }
        },
      },
    ]);
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    });
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      questionText: q.questionText,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.navy2} />
      </View>
    );
  }

  const formattedChapter = chapter?.replace("-", " ");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={COLORS.navy2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle} style={{textTransform: 'capitalize'}}>{formattedChapter}</Text>
          <Text style={styles.pageSubtitle} style={{textTransform: 'capitalize'}}>{courseCode} - {level}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Feather name="plus" size={18} color={COLORS.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No questions found for this level.</Text>
          </View>
        ) : (
          questions.map((q, index) => (
            <View key={q._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.questionNum}>Q{index + 1}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEditModal(q)} style={styles.iconBtn}>
                    <Feather name="edit-2" size={16} color={COLORS.blue} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(q._id)} style={[styles.iconBtn, { backgroundColor: '#fee2e2', borderColor: '#f87171' }]}>
                    <Feather name="trash-2" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.questionText}>{q.questionText}</Text>
              
              <View style={styles.optionsList}>
                {q.options.map((opt, i) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <View key={i} style={[styles.optionRow, isCorrect && styles.correctOptionRow]}>
                      <Text style={[styles.optionLetter, isCorrect && styles.correctOptionText]}>
                        {String.fromCharCode(65 + i)}:
                      </Text>
                      <Text style={[styles.optionValue, isCorrect && styles.correctOptionText]}>
                        {opt} {isCorrect && "(Correct)"}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {q.explanation ? (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>Explanation:</Text>
                  <Text style={styles.explanationText}>{q.explanation}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingQuestion ? "Edit Question" : "Add Question"}</Text>
              
              <Text style={styles.label}>Question Text</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={formData.questionText}
                onChangeText={(val) => setFormData({ ...formData, questionText: val })}
                multiline
              />

              {formData.options.map((opt, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>Option {String.fromCharCode(65 + i)}</Text>
                  <TextInput
                    style={styles.input}
                    value={opt}
                    onChangeText={(val) => handleOptionChange(i, val)}
                  />
                  <TouchableOpacity
                    style={[styles.correctSelectBtn, formData.correctAnswer === opt && opt.trim() !== "" && styles.correctSelectBtnActive]}
                    onPress={() => {
                      if (opt.trim()) setFormData({ ...formData, correctAnswer: opt });
                    }}
                  >
                    <Feather name={formData.correctAnswer === opt && opt.trim() !== "" ? "check-circle" : "circle"} size={16} color={formData.correctAnswer === opt && opt.trim() !== "" ? COLORS.success : COLORS.grey} />
                    <Text style={{ fontSize: 12, color: formData.correctAnswer === opt && opt.trim() !== "" ? COLORS.success : COLORS.grey }}>
                      Mark as Correct
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.label}>Explanation (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: "top" }]}
                value={formData.explanation}
                onChangeText={(val) => setFormData({ ...formData, explanation: val })}
                multiline
              />

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  pageTitle: { ...TYPO.h2, fontSize: 20 },
  pageSubtitle: { ...TYPO.body, marginTop: 2 },
  addBtn: {
    backgroundColor: COLORS.navy2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: "700" },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  emptyState: { alignItems: "center", marginTop: 40, gap: 12 },
  emptyText: { color: COLORS.muted, fontSize: 14 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  questionNum: { fontSize: 14, fontWeight: "800", color: COLORS.navy2 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: "#eff6ff", borderColor: "#bfdbfe", borderWidth: 1,
    justifyContent: "center", alignItems: "center"
  },
  questionText: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  optionsList: { gap: 8 },
  optionRow: {
    flexDirection: "row", padding: 10, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1, borderColor: COLORS.border
  },
  correctOptionRow: { backgroundColor: "rgba(46, 204, 113, 0.1)", borderColor: "#2ecc71" },
  optionLetter: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginRight: 8 },
  optionValue: { fontSize: 14, color: COLORS.text, flex: 1 },
  correctOptionText: { color: "#27ae60", fontWeight: "700" },
  explanationBox: { marginTop: 16, padding: 10, backgroundColor: "#f8fafc", borderRadius: 8 },
  explanationLabel: { fontSize: 12, fontWeight: "700", color: COLORS.grey, marginBottom: 4 },
  explanationText: { fontSize: 13, color: COLORS.muted },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, height: "80%" },
  modalTitle: { ...TYPO.h2, fontSize: 18, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.input, padding: 12, fontSize: 14, backgroundColor: COLORS.card, marginBottom: 6 },
  correctSelectBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  modalFooter: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 40 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.button, backgroundColor: COLORS.border, alignItems: "center" },
  cancelText: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.button, backgroundColor: COLORS.navy2, alignItems: "center" },
  saveText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});
