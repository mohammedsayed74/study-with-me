import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Linking,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import {
  getStudentRatings,
  getStudentUploads,
  getDoctorTopRated,
  getDoctorContributors,
  getDoctorPending,
  approveMaterial,
  rejectMaterial,
} from "../../src/services/dashboardService";

const AVATAR_COLORS = [
  "#2b8cee", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#6366f1", "#14b8a6", "#f97316",
];

const REASONS = [
  { value: "duplicate", label: "Duplicate — This file already exists" },
  { value: "incomplete", label: "Incomplete — Missing content or pages" },
  { value: "not_appropriate", label: "Not Appropriate — Irrelevant or incorrect" },
  { value: "other", label: "Other" },
];

export default function DashboardScreen() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [topRated, setTopRated] = useState([]);
  const [contributors, setContributors] = useState([]);

  const [ratings, setRatings] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const [pending, setPending] = useState([]);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  const [rejectTarget, setRejectTarget] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        router.replace("/auth/login");
        return;
      }
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        setUser(decoded);
        fetchData(decoded, storedToken);
      } catch (err) {
        const name = await AsyncStorage.getItem("user_name");
        const role = await AsyncStorage.getItem("user_role");
        const fallbackUser = { name, role };
        setUser(fallbackUser);
        fetchData(fallbackUser, storedToken);
      }
    } catch (error) {
      console.log("Error loading user:", error);
    }
  };

  const fetchData = async (currentUser, currentToken) => {
    if (currentUser?.role === "student") {
      setLoadingStudent(true);
      try {
        const [rRes, uRes, tRes, cRes] = await Promise.all([
          getStudentRatings(currentToken),
          getStudentUploads(currentToken),
          getDoctorTopRated(currentToken),
          getDoctorContributors(currentToken)
        ]);
        setRatings(rRes);
        setUploads(uRes);
        setTopRated(tRes);
        setContributors(cRes);
      } catch (err) {
        console.log("Error fetching student data", err);
      } finally {
        setLoadingStudent(false);
      }
    } else if (currentUser?.role === "teacher" || currentUser?.role === "doctor") {
      setLoadingTeacher(true);
      try {
        const [tRes, cRes, pRes] = await Promise.all([
          getDoctorTopRated(currentToken),
          getDoctorContributors(currentToken),
          getDoctorPending(currentToken)
        ]);
        setTopRated(tRes);
        setContributors(cRes);
        setPending(pRes);
      } catch (err) {
        console.log("Error fetching teacher data", err);
      } finally {
        setLoadingTeacher(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(user, token);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/auth/login");
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.authPrimary} />
      </View>
    );
  }

  const isTeacher = user.role === "teacher" || user.role === "doctor";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.authBg }}>
      <LinearGradient
        colors={['#052859', '#021024']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        <DashHeader user={user} onLogout={handleLogout} />

        {isTeacher ? (
          <TeacherDashboard
            token={token}
            topRated={topRated}
            contributors={contributors}
            pending={pending}
            setPending={setPending}
            loading={loadingTeacher}
            setRejectTarget={setRejectTarget}
          />
        ) : (
          <StudentDashboard
            ratings={ratings}
            uploads={uploads}
            topRated={topRated}
            contributors={contributors}
            loading={loadingStudent}
          />
        )}
      </ScrollView>

      <RejectModal
        visible={!!rejectTarget}
        material={rejectTarget}
        onClose={() => setRejectTarget(null)}
        token={token}
        onSuccess={(id) => setPending(p => p.filter(m => m._id !== id))}
      />
    </View>
  );
}


function DashHeader({ user, onLogout }) {
  const isTeacher = user.role === "teacher" || user.role === "doctor";
  return (
    <Animated.View entering={FadeInUp.duration(600).springify()} style={{ marginBottom: SPACING.xl, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
      <View style={{ flex: 1 }}>
        <Text style={[TYPO.h1, { fontSize: 24, marginBottom: 4, color: COLORS.white }]}>
          {isTeacher ? "Instructor Dashboard" : "Student Dashboard"}
        </Text>
        <Text style={[TYPO.body, { color: "rgba(255, 255, 255, 0.8)" }]}>Welcome back! Here is your latest overview.</Text>
      </View>
      <View style={{ alignItems: "center", marginLeft: SPACING.md }}>
        <View style={{
          width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white,
          justifyContent: "center", alignItems: "center",
          marginBottom: 4, shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5
        }}>
          <Text style={{ fontSize: 20, fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.authPrimary }}>
            {user.name?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={{ fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", color: "rgba(255, 255, 255, 0.8)", textTransform: "uppercase" }}>
          {user.role}
        </Text>
        <TouchableOpacity onPress={onLogout} style={{ marginTop: 8 }}>
            <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function StatCard({ icon, color, count, label, delay = 0 }) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600).springify()} style={{
      flex: 1, minWidth: "45%", backgroundColor: COLORS.white, borderRadius: RADIUS.card,
      padding: SPACING.md, marginBottom: SPACING.md,
      marginHorizontal: 4,
      shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 12, backgroundColor: `${color}15`,
        justifyContent: "center", alignItems: "center", marginBottom: SPACING.md
      }}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={{ fontSize: 28, fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.authTextMain, marginBottom: 2 }}>{count}</Text>
      <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold", color: COLORS.authTextMuted }}>{label}</Text>
    </Animated.View>
  );
}

function SectionCard({ icon, title, count, loading, children, delay = 0 }) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600).springify()} style={{
      backgroundColor: COLORS.white, borderRadius: RADIUS.card, 
      marginBottom: SPACING.lg, overflow: "hidden",
      shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 4,
    }}>
      <View style={{
        flexDirection: "row", alignItems: "center", padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.authInputBorder,
        backgroundColor: COLORS.white
      }}>
        <Ionicons name={icon} size={20} color={COLORS.authPrimary} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, flex: 1 }}>{title}</Text>
        {count !== undefined && (
          <View style={{ backgroundColor: COLORS.authInputBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: COLORS.authPrimary, fontSize: 12, fontFamily: "PlusJakartaSans_700Bold" }}>{count}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: SPACING.md, backgroundColor: COLORS.white }}>
        {loading ? <SkeletonRows /> : children}
      </View>
    </Animated.View>
  );
}

function SkeletonRows() {
  return (
    <View>
      {[1, 2, 3].map(i => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.authInputBg, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <View style={{ height: 14, backgroundColor: COLORS.authInputBg, borderRadius: 4, width: "70%", marginBottom: 8 }} />
            <View style={{ height: 10, backgroundColor: COLORS.authInputBg, borderRadius: 4, width: "40%" }} />
          </View>
          <View style={{ width: 50, height: 20, borderRadius: 10, backgroundColor: COLORS.authInputBg }} />
        </View>
      ))}
    </View>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: SPACING.xl }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.authInputBg, justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
        <Ionicons name={icon} size={32} color={COLORS.authTextMuted} />
      </View>
      <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted, textAlign: "center" }}>{desc}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  let color = COLORS.grey;
  let bg = `${COLORS.grey}20`;
  if (status === "approved") {
    color = COLORS.success;
    bg = `${COLORS.success}20`;
  } else if (status === "pending") {
    color = "#f59e0b";
    bg = "#f59e0b20";
  } else if (status === "rejected") {
    color = COLORS.error;
    bg = `${COLORS.error}20`;
  }
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start" }}>
      <Text style={{ color, fontSize: 11, fontFamily: "PlusJakartaSans_700Bold", textTransform: "capitalize" }}>{status}</Text>
    </View>
  );
}

function StarRow({ avg, reviewCount }) {
  const rounded = Math.round(avg || 0);
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flexDirection: "row" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Text key={i} style={{ color: i <= rounded ? "#f59e0b" : COLORS.authInputBorder, fontSize: 14 }}>★</Text>
        ))}
      </View>
      {avg !== undefined && <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, marginLeft: 4 }}>{avg}</Text>}
      {reviewCount !== undefined && <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted, marginLeft: 4 }}>({reviewCount})</Text>}
    </View>
  );
}

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
};


function StudentDashboard({ ratings, uploads, topRated, contributors, loading }) {
  const totalUploads = uploads.length;
  const approvedCount = uploads.filter(u => u.status === "approved").length;
  const pendingCount = uploads.filter(u => u.status === "pending").length;
  const ratingsCount = ratings.length;

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginHorizontal: -4 }}>
        <StatCard delay={100} icon="cloud-upload" color={COLORS.authPrimary} count={totalUploads} label="Total Uploads" />
        <StatCard delay={150} icon="checkmark-circle" color={COLORS.success} count={approvedCount} label="Approved" />
        <StatCard delay={200} icon="time" color="#f59e0b" count={pendingCount} label="Pending" />
        <StatCard delay={250} icon="star" color="#8b5cf6" count={ratingsCount} label="Ratings Given" />
      </View>

      <SectionCard delay={300} icon="star" title="My Latest Ratings" count={ratingsCount} loading={loading}>
        {ratings.length === 0 ? (
          <EmptyState icon="star-outline" title="No ratings yet" desc="Your ratings on uploaded materials will appear here." />
        ) : (
          ratings.map((r, i) => (
            <View key={r._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === ratings.length - 1 ? 0 : 1, borderBottomColor: COLORS.authInputBorder }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, flex: 1 }} numberOfLines={1}>{r.title}</Text>
                <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted }}>{formatDate(r.ratedAt)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted }}>{r.courseCode}</Text>
                <StarRow avg={r.score} />
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard delay={400} icon="cloud-upload" title="My Latest Uploads" count={uploads.length > 3 ? 3 : uploads.length} loading={loading}>
        {uploads.length === 0 ? (
          <EmptyState icon="cloud-offline-outline" title="No uploads yet" desc="Start contributing by uploading study materials." />
        ) : (
          uploads.slice(0, 3).map((u, i) => (
            <View key={u._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === 2 || i === uploads.length - 1 ? 0 : 1, borderBottomColor: COLORS.authInputBorder }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, flex: 1 }} numberOfLines={1}>{u.title}</Text>
                <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted }}>{formatDate(u.createdAt)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted }}>{u.courseCode} • PDF</Text>
                <StatusBadge status={u.status} />
              </View>
              {u.status === "rejected" && u.rejectionReason && (
                <View style={{ marginTop: 8, backgroundColor: `${COLORS.error}10`, padding: 10, borderRadius: RADIUS.input }}>
                  <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.error, textTransform: "capitalize" }}>
                    Reason: {u.rejectionReason.replace("_", " ")}
                  </Text>
                  {u.rejectionNote && <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.error, marginTop: 4 }}>{u.rejectionNote}</Text>}
                </View>
              )}
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard delay={500} icon="medal" title="Highest Rated Files" count={topRated?.length > 5 ? 5 : topRated?.length} loading={loading}>
        {(!topRated || topRated.length === 0) ? (
          <EmptyState icon="star-outline" title="No rated files yet" desc="Files will appear here once students start rating." />
        ) : (
          topRated.slice(0, 5).map((m, i) => (
            <View key={m._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === topRated.length - 1 ? 0 : 1, borderBottomColor: COLORS.authInputBorder }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                <StarRow avg={m.averageRating} reviewCount={m.totalRatings} />
              </View>
              <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted }}>
                {m.courseCode} • by {m.uploadedBy?.name || "Unknown"}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard delay={600} icon="trophy" title="Most Active Contributors" count={contributors?.length > 5 ? 5 : contributors?.length} loading={loading}>
        {(!contributors || contributors.length === 0) ? (
          <EmptyState icon="person-outline" title="No contributors yet" desc="Users who upload materials will appear here." />
        ) : (
          contributors.slice(0, 5).map((c, i) => (
            <View key={c._id || i} style={{ paddingVertical: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: i === contributors.length - 1 ? 0 : 1, borderBottomColor: COLORS.authInputBorder }}>
              <View style={{ width: 24, alignItems: "center", marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_800ExtraBold", color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : COLORS.authTextMuted }}>#{i + 1}</Text>
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.white }}>{c.name?.charAt(0)?.toUpperCase() || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain }}>{c.name}</Text>
                <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted, textTransform: "capitalize" }}>{c.role}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain }}>{c.totalUploads} uploads</Text>
                <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold", color: COLORS.success }}>{c.approvedUploads} approved</Text>
              </View>
            </View>
          ))
        )}
      </SectionCard>
    </View>
  );
}

function TeacherDashboard({ token, topRated, contributors, pending, setPending, loading, setRejectTarget }) {
  const handleApprove = async (id) => {
    try {
      await approveMaterial(id, token);
      setPending(p => p.filter(m => m._id !== id));
    } catch (err) {
      alert("Failed to approve");
    }
  };

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginHorizontal: -4 }}>
        <StatCard delay={100} icon="time" color="#f59e0b" count={pending.length} label="Pending Requests" />
        <StatCard delay={150} icon="trending-up" color={COLORS.authPrimary} count={topRated.length} label="Top Rated Files" />
        <StatCard delay={200} icon="people" color={COLORS.success} count={contributors.length} label="Active Contributors" />
      </View>

      <SectionCard delay={300} icon="clipboard" title="Pending Upload Requests" count={pending.length} loading={loading}>
        {pending.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="All caught up!" desc="No pending upload requests to review at the moment." />
        ) : (
          pending.map((m, i) => (
            <View key={m._id || i} style={{ paddingVertical: 14, borderBottomWidth: i === pending.length - 1 ? 0 : 1, borderBottomColor: COLORS.authInputBorder }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted }}>{formatDate(m.createdAt)}</Text>
              </View>
              <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted, marginBottom: 12 }}>
                {m.courseCode} • PDF • by {m.uploadedBy?.name || "Unknown"}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: COLORS.authInputBg, paddingVertical: 10, borderRadius: RADIUS.input, alignItems: "center", borderWidth: 1, borderColor: COLORS.authInputBorder }}
                  onPress={() => Linking.openURL(m.pdfUrl)}
                >
                  <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain }}>View PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: COLORS.success, paddingVertical: 10, borderRadius: RADIUS.input, alignItems: "center" }}
                  onPress={() => handleApprove(m._id)}
                >
                  <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.white }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: COLORS.error, paddingVertical: 10, borderRadius: RADIUS.input, alignItems: "center" }}
                  onPress={() => setRejectTarget(m)}
                >
                  <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.white }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard delay={400} icon="medal" title="Highest Rated Files" count={topRated.length > 5 ? 5 : topRated.length} loading={loading}>
        {topRated.length === 0 ? (
          <EmptyState icon="star-outline" title="No rated files yet" desc="Files will appear here once students start rating." />
        ) : (
          topRated.slice(0, 5).map((m, i) => (
            <View key={m._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === topRated.length - 1 ? 0 : 1, borderBottomColor: COLORS.authInputBorder }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                <StarRow avg={m.averageRating} reviewCount={m.totalRatings} />
              </View>
              <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted }}>
                {m.courseCode} • by {m.uploadedBy?.name || "Unknown"}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard delay={500} icon="trophy" title="Most Active Contributors" count={contributors.length > 5 ? 5 : contributors.length} loading={loading}>
        {contributors.length === 0 ? (
          <EmptyState icon="person-outline" title="No contributors yet" desc="Users who upload materials will appear here." />
        ) : (
          contributors.slice(0, 5).map((c, i) => (
            <View key={c._id || i} style={{ paddingVertical: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: i === contributors.length - 1 ? 0 : 1, borderBottomColor: COLORS.authInputBorder }}>
              <View style={{ width: 24, alignItems: "center", marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_800ExtraBold", color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : COLORS.authTextMuted }}>#{i + 1}</Text>
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.white }}>{c.name?.charAt(0)?.toUpperCase() || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain }}>{c.name}</Text>
                <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted, textTransform: "capitalize" }}>{c.role}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain }}>{c.totalUploads} uploads</Text>
                <Text style={{ fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold", color: COLORS.success }}>{c.approvedUploads} approved</Text>
              </View>
            </View>
          ))
        )}
      </SectionCard>
    </View>
  );
}

function RejectModal({ visible, material, onClose, token, onSuccess }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await rejectMaterial(material._id, reason, note, token);
      onSuccess(material._id);
      onClose();
      setReason("");
      setNote("");
    } catch (err) {
      alert("Failed to reject");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card, padding: SPACING.lg, paddingBottom: 40 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md }}>
            <Text style={{ fontSize: 18, fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.authTextMain }}>Reject Material</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={COLORS.authTextMuted} /></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted, marginBottom: SPACING.md }}>
            Rejecting: <Text style={{ fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain }}>{material?.title}</Text>
          </Text>

          <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, marginBottom: 8 }}>Rejection Reason</Text>
          {REASONS.map(r => (
            <TouchableOpacity key={r.value} onPress={() => setReason(r.value)} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: reason === r.value ? COLORS.authPrimary : COLORS.authTextMuted, justifyContent: "center", alignItems: "center", marginRight: 8 }}>
                {reason === r.value && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.authPrimary }} />}
              </View>
              <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMain }}>{r.label}</Text>
            </TouchableOpacity>
          ))}

          <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain, marginTop: SPACING.sm, marginBottom: 8 }}>Additional Notes (optional)</Text>
          <TextInput
            style={{ backgroundColor: COLORS.authInputBg, borderWidth: 1, borderColor: COLORS.authInputBorder, borderRadius: RADIUS.input, padding: 14, height: 100, textAlignVertical: "top", marginBottom: SPACING.xl, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMain }}
            placeholder="Provide additional feedback..."
            placeholderTextColor={COLORS.authTextMuted}
            value={note}
            onChangeText={setNote}
            multiline
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: RADIUS.button, alignItems: "center", backgroundColor: COLORS.authInputBg }} onPress={onClose}>
              <Text style={{ fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 14, borderRadius: RADIUS.button, alignItems: "center", backgroundColor: !reason || submitting ? COLORS.authTextMuted : COLORS.error }}
              onPress={handleSubmit}
              disabled={!reason || submitting}
            >
              <Text style={{ fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.white }}>{submitting ? "Rejecting..." : "Reject Material"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  }
});
