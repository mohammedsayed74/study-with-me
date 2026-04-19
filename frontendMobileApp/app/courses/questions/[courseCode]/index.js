import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../../../../src/config/api";
import { COLORS, RADIUS, SPACING, TYPO } from "../../../../src/theme/theme";

export default function ChapterSelectionScreen() {
  const { courseCode } = useLocalSearchParams();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newChapterNumber, setNewChapterNumber] = useState("");

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.role === "teacher") {
            setIsTeacher(true);
          }
        }
        
        const res = await fetch(`${API_BASE_URL}/api/MCQs/${courseCode}/chapters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setChapters(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching chapters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [courseCode]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={COLORS.navy2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Question Bank</Text>
          <Text style={styles.pageSubtitle}>{courseCode}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {isTeacher && (
           <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
             <Feather name="plus" size={20} color={COLORS.white} />
             <Text style={styles.addBtnText}>Add Chapter</Text>
           </TouchableOpacity>
        )}
        
        {loading ? (
            <ActivityIndicator size="large" color={COLORS.navy2} style={{ marginTop: 40 }} />
        ) : chapters.length === 0 ? (
            <Text style={{ textAlign: 'center', color: COLORS.muted, marginTop: 40 }}>No chapters found.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: SPACING.md }}>
              {chapters.map((chapter) => (
                <View key={chapter.id} style={styles.chapterCard}>
                  <View style={styles.chapterIconWrapper}>
                    <Feather name="book-open" size={24} color={COLORS.blue} />
                  </View>
                  <Text style={styles.chapterTitle}>Chapter {chapter.id}</Text>
                  <Text style={styles.chapterSubtitle}>chapter {chapter.id} practice</Text>
                  
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => router.push(`/courses/questions/${courseCode}/chapter-${chapter.id}`)}
                  >
                    <Text style={styles.startBtnText}>Start Practice</Text>
                    <Feather name="arrow-right" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        )}
      </View>

      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Chapter</Text>
            <Text style={styles.modalDesc}>Enter the chapter number. You will be redirected to setup your first question for this chapter.</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              keyboardType="number-pad"
              value={newChapterNumber}
              onChangeText={setNewChapterNumber}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowModal(false); setNewChapterNumber(""); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={() => {
                  if(newChapterNumber.trim() !== '') {
                    setShowModal(false);
                    router.push(`/courses/questions/${courseCode}/chapter-${newChapterNumber.trim()}`);
                  }
                }}
              >
                <Text style={styles.confirmText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
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
  pageTitle: {
    ...TYPO.h2,
    fontSize: 20,
  },
  pageSubtitle: {
    ...TYPO.body,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  addBtn: {
    backgroundColor: COLORS.navy2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.button,
    gap: 8,
    marginBottom: SPACING.md
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16
  },
  chapterCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(125, 160, 202, 0.15)',
    elevation: 2,
    shadowColor: COLORS.navy2,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  chapterIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(43, 140, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy2,
    marginBottom: 4
  },
  chapterSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.lg
  },
  startBtn: {
    backgroundColor: COLORS.navy2,
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  startBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.card,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navy2,
    marginBottom: SPACING.sm,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.lg,
    lineHeight: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(125, 160, 202, 0.3)",
    borderRadius: RADIUS.input,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(125, 160, 202, 0.3)",
    borderRadius: RADIUS.button,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.muted,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.navy2,
    borderRadius: RADIUS.button,
    alignItems: "center",
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
