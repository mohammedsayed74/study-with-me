import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Linking,
  Alert,
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../../src/services/profileService";
import { toggleFollowCourse, getCourses } from "../../src/services/coursesService";
import { toggleFavoriteMaterial, getFavoriteMaterials } from "../../src/services/materialsService";

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState("courses"); // 'courses' or 'materials'
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) return;
          const profileRes = await getProfile(token);
          
          // Get followed course codes
          const followedCodes = profileRes.user?.followedCourses || [];
          
          // Fetch all courses to get the details
          const allCourses = await getCourses();
          const followedCoursesData = allCourses.filter(c => followedCodes.includes(c.courseCode));
          setCourses(followedCoursesData);

          // Fetch full favorite materials (populated)
          const favMats = await getFavoriteMaterials();
          setMaterials(favMats);
        } catch (err) {
          console.error("Failed to load saved items:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const handleToggleFollow = async (courseCode) => {
    try {
      await toggleFollowCourse(courseCode);
      setCourses((prev) => prev.filter((c) => c !== courseCode && c.courseCode !== courseCode));
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update follow status.");
    }
  };

  const handleToggleFavorite = async (materialId) => {
    try {
      await toggleFavoriteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m !== materialId && m._id !== materialId));
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update favorite status.");
    }
  };

  const handleViewMaterial = async (pdfUrl) => {
    try {
      await Linking.openURL(pdfUrl);
    } catch {
      Alert.alert("Error", "Could not open this file.");
    }
  };

  const renderCourse = ({ item, index }) => {
    // Determine if populated or just string. If string, we might not have title.
    const isPopulated = typeof item === 'object';
    const cCode = isPopulated ? item.courseCode : item;
    const cTitle = isPopulated ? item.title : `Course: ${item}`;
    const cDesc = isPopulated ? item.description : "";

    return (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(500).springify()}>
        <TouchableOpacity
          style={styles.courseCard}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/courses/[courseCode]",
              params: { courseCode: cCode },
            })
          }
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
                {cTitle}
              </Text>
            </View>
            <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
              <TouchableOpacity onPress={() => handleToggleFollow(cCode)} style={{padding: 2}}>
                <Ionicons name="star" size={24} color="#f5a623" />
              </TouchableOpacity>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cCode}</Text>
              </View>
            </View>
          </View>
          {cDesc ? (
            <Text style={styles.description} numberOfLines={2}>
              {cDesc}
            </Text>
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMaterial = ({ item, index }) => {
    const isPopulated = typeof item === 'object';
    if (!isPopulated) return null; // Can't render without details

    return (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(500).springify()}>
        <View style={styles.materialCard}>
          <View style={styles.cardLeft}>
            <View style={styles.pdfIcon}>
              <Feather name="file-text" size={22} color={COLORS.navy2} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardMeta}>
                <Feather name="book" size={11} color={COLORS.grey} />{" "}
                {item.courseCode}
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleViewMaterial(item.pdfUrl)}
            >
              <Feather name="eye" size={16} color={COLORS.blue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleToggleFavorite(item._id)}
            >
              <FontAwesome name="heart" size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const activeData = activeTab === "courses" ? courses : materials;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#052859', '#021024']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      
      <View style={styles.headerContent}>
        <Animated.Text entering={FadeInDown.duration(600).springify()} style={styles.pageTitle}>
          Saved
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(100).duration(600).springify()} style={styles.pageSubtitle}>
          Your followed courses and favorite materials.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === "courses" && styles.tabBtnActive]} 
            onPress={() => setActiveTab("courses")}
          >
            <Text style={[styles.tabText, activeTab === "courses" && styles.tabTextActive]}>Followed Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === "materials" && styles.tabBtnActive]} 
            onPress={() => setActiveTab("materials")}
          >
            <Text style={[styles.tabText, activeTab === "materials" && styles.tabTextActive]}>Favorite Materials</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.FlatList
        data={activeData}
        keyExtractor={(item, index) => typeof item === 'object' ? item._id : item + index}
        renderItem={activeTab === "courses" ? renderCourse : renderMaterial}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="bookmark-outline" size={48} color={COLORS.authTextMuted} />
              <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.authTextMuted, fontFamily: "PlusJakartaSans_500Medium" }}>
                Nothing saved yet.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.authBg },
  headerGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 260,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  headerContent: {
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.sm,
  },
  pageTitle: { fontSize: 28, fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.white, marginBottom: 4 },
  pageSubtitle: { fontSize: 15, fontFamily: "PlusJakartaSans_500Medium", color: "rgba(255, 255, 255, 0.8)", marginBottom: SPACING.xl },
  tabsContainer: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabBtnActive: { backgroundColor: COLORS.white },
  tabText: { fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: "rgba(255,255,255,0.7)" },
  tabTextActive: { color: COLORS.navy2 },
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  courseCard: {
    backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.card,
    marginBottom: 16, shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 15, elevation: 4,
  },
  materialCard: {
    backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.card,
    marginBottom: 16, shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 15, elevation: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  title: { fontSize: 18, fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.authTextMain },
  badge: { backgroundColor: COLORS.authInputBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: COLORS.authPrimary, fontSize: 12, fontFamily: "PlusJakartaSans_800ExtraBold" },
  description: { marginTop: 10, color: COLORS.authTextMuted, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", lineHeight: 22 },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: SPACING.sm },
  pdfIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.sky, justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.grey, marginTop: 3 },
  cardActions: { flexDirection: "row", gap: 6, alignItems: "center" },
  actionBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, justifyContent: "center", alignItems: "center" },
});
