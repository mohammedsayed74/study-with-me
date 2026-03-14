import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import {
  getMaterials,
  getPendingMaterials,
  approveMaterial,
  deleteMaterial,
} from "../../src/services/materialsService";

export default function CourseMaterialsScreen() {
  const { courseCode } = useLocalSearchParams();

  const [materials, setMaterials] = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("approved");
  const [isTeacher, setIsTeacher] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // materialId being acted on

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("token");
      const decoded = jwtDecode(token);
      const teacher = decoded.role === "teacher";
      setIsTeacher(teacher);

      const approved = await getMaterials(courseCode);
      setMaterials(approved);

      if (teacher) {
        const pending = await getPendingMaterials(courseCode);
        setPendingMaterials(pending);
      }
    } catch (err) {
      setError(err.message || "Failed to load materials.");
    } finally {
      setLoading(false);
    }
  }, [courseCode]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveMaterial(id);
      const approved = pendingMaterials.find((m) => m._id === id);
      if (approved) {
        setPendingMaterials((prev) => prev.filter((m) => m._id !== id));
        setMaterials((prev) => [...prev, { ...approved, status: "approved" }]);
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to approve material.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (id, isPending) => {
    const action = isPending ? "reject" : "delete";
    Alert.alert(
      `${isPending ? "Reject" : "Delete"} Material`,
      `Are you sure you want to ${action} this material?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isPending ? "Reject" : "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(id);
            try {
              await deleteMaterial(id);
              if (isPending) {
                setPendingMaterials((prev) => prev.filter((m) => m._id !== id));
              } else {
                setMaterials((prev) => prev.filter((m) => m._id !== id));
              }
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete material.");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleView = async (pdfUrl) => {
    try {
      await Linking.openURL(pdfUrl);
    } catch {
      Alert.alert("Error", "Could not open this file.");
    }
  };

  const renderMaterialCard = ({ item }, isPendingView = false) => {
    const isBusy = actionLoading === item._id;
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.pdfIcon}>
            <Feather name="file-text" size={22} color={COLORS.navy2} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardMeta}>
              <Feather name="user" size={11} color={COLORS.grey} />{" "}
              {item.uploadedBy?.name || "Unknown"}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleView(item.pdfUrl)}
            disabled={isBusy}
          >
            <Feather name="eye" size={16} color={COLORS.blue} />
          </TouchableOpacity>

          {isTeacher && isPendingView && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleApprove(item._id)}
              disabled={isBusy}
            >
              {isBusy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="check" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          )}

          {isTeacher && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(item._id, isPendingView)}
              disabled={isBusy}
            >
              {isBusy && !isPendingView ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather
                  name={isPendingView ? "x" : "trash-2"}
                  size={16}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const activeData = activeTab === "approved" ? materials : pendingMaterials;
  const isPendingView = activeTab === "pending";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={COLORS.navy2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{courseCode}</Text>
          <Text style={styles.pageSubtitle}>Course Materials</Text>
        </View>
      </View>

      {isTeacher && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "approved" && styles.activeTab]}
            onPress={() => setActiveTab("approved")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "approved" && styles.activeTabText,
              ]}
            >
              Approved ({materials.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending ({pendingMaterials.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.navy2} />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
      ) : activeData.length === 0 ? (
        <View style={styles.centered}>
          <Feather
            name={isPendingView ? "check-circle" : "folder"}
            size={56}
            color={COLORS.border}
          />
          <Text style={styles.emptyTitle}>
            {isPendingView ? "All caught up!" : "No materials yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isPendingView
              ? "No pending materials to review."
              : "Upload the first material for this course."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeData}
          keyExtractor={(item) => item._id}
          renderItem={(info) => renderMaterialCard(info, isPendingView)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: "/courses/uploadMaterial",
            params: { courseCode },
          })
        }
      >
        <Feather name="upload" size={22} color="#fff" />
        <Text style={styles.fabText}>Upload</Text>
      </TouchableOpacity>
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

  tabs: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.button,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.button - 2,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: COLORS.navy2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },
  activeTabText: {
    color: COLORS.white,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: SPACING.sm,
  },
  pdfIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.sky,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 3,
  },
  cardActions: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  deleteBtn: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPO.body,
    marginTop: SPACING.sm,
  },
  emptyTitle: {
    ...TYPO.h2,
    fontSize: 18,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    ...TYPO.body,
    textAlign: "center",
  },
  errorBox: {
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: "#FFEBEE",
    borderRadius: RADIUS.input,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    right: SPACING.lg,
    bottom: 32,
    backgroundColor: COLORS.navy2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
