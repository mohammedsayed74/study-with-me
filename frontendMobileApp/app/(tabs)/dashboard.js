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
  ActivityIndicator
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Ionicons } from "@expo/vector-icons";
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

  // Shared states
  const [topRated, setTopRated] = useState([]);
  const [contributors, setContributors] = useState([]);

  // Student states
  const [ratings, setRatings] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(true);

  // Teacher states
  const [pending, setPending] = useState([]);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  // Modal
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
        // fallback if decoding fails
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
        <ActivityIndicator size="large" color={COLORS.navy2} />
      </View>
    );
  }

  const isTeacher = user.role === "teacher" || user.role === "doctor";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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

// --- Components ---

function DashHeader({ user, onLogout }) {
  const isTeacher = user.role === "teacher" || user.role === "doctor";
  return (
    <View style={{ marginBottom: SPACING.xl, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
      <View style={{ flex: 1 }}>
        <Text style={[TYPO.h1, { fontSize: 24, marginBottom: 4 }]}>
          {isTeacher ? "Instructor Dashboard" : "Student Dashboard"}
        </Text>
        <Text style={TYPO.body}>Welcome back! Here is your latest overview.</Text>
      </View>
      <View style={{ alignItems: "center", marginLeft: SPACING.md }}>
        <View style={{
          width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.card,
          justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border,
          marginBottom: 4
        }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.navy2 }}>
            {user.name?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>
          {user.role}
        </Text>
        <TouchableOpacity onPress={onLogout} style={{ marginTop: 8 }}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({ icon, color, count, label }) {
  return (
    <View style={{
      flex: 1, minWidth: "45%", backgroundColor: COLORS.card, borderRadius: RADIUS.card,
      padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
      marginHorizontal: 4
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 12, backgroundColor: `${color}15`,
        justifyContent: "center", alignItems: "center", marginBottom: SPACING.sm
      }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.text, marginBottom: 2 }}>{count}</Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.muted }}>{label}</Text>
    </View>
  );
}

function SectionCard({ icon, title, count, loading, children }) {
  return (
    <View style={{
      backgroundColor: COLORS.card, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.border,
      marginBottom: SPACING.lg, overflow: "hidden"
    }}>
      <View style={{
        flexDirection: "row", alignItems: "center", padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white
      }}>
        <Ionicons name={icon} size={20} color={COLORS.navy2} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, flex: 1 }}>{title}</Text>
        {count !== undefined && (
          <View style={{ backgroundColor: COLORS.navy2, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
            <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "700" }}>{count}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: SPACING.md, backgroundColor: COLORS.white }}>
        {loading ? <SkeletonRows /> : children}
      </View>
    </View>
  );
}

function SkeletonRows() {
  return (
    <View>
      {[1, 2, 3].map(i => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.border, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <View style={{ height: 14, backgroundColor: COLORS.border, borderRadius: 4, width: "70%", marginBottom: 8 }} />
            <View style={{ height: 10, backgroundColor: COLORS.border, borderRadius: 4, width: "40%" }} />
          </View>
          <View style={{ width: 50, height: 20, borderRadius: 10, backgroundColor: COLORS.border }} />
        </View>
      ))}
    </View>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: SPACING.xl }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
        <Ionicons name={icon} size={32} color={COLORS.muted} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center" }}>{desc}</Text>
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
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start" }}>
      <Text style={{ color, fontSize: 11, fontWeight: "700", textTransform: "capitalize" }}>{status}</Text>
    </View>
  );
}

function StarRow({ avg, reviewCount }) {
  const rounded = Math.round(avg || 0);
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flexDirection: "row" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Text key={i} style={{ color: i <= rounded ? "#f59e0b" : COLORS.border, fontSize: 14 }}>★</Text>
        ))}
      </View>
      {avg !== undefined && <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.text, marginLeft: 4 }}>{avg}</Text>}
      {reviewCount !== undefined && <Text style={{ fontSize: 12, color: COLORS.muted, marginLeft: 4 }}>({reviewCount})</Text>}
    </View>
  );
}

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
};

// --- Sub-dashboards ---

function StudentDashboard({ ratings, uploads, topRated, contributors, loading }) {
  const totalUploads = uploads.length;
  const approvedCount = uploads.filter(u => u.status === "approved").length;
  const pendingCount = uploads.filter(u => u.status === "pending").length;
  const ratingsCount = ratings.length;

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginHorizontal: -4 }}>
        <StatCard icon="cloud-upload" color="#2b8cee" count={totalUploads} label="Total Uploads" />
        <StatCard icon="checkmark-circle" color={COLORS.success} count={approvedCount} label="Approved" />
        <StatCard icon="time" color="#f59e0b" count={pendingCount} label="Pending" />
        <StatCard icon="star" color="#8b5cf6" count={ratingsCount} label="Ratings Given" />
      </View>

      <SectionCard icon="star" title="My Latest Ratings" count={ratingsCount} loading={loading}>
        {ratings.length === 0 ? (
          <EmptyState icon="star-outline" title="No ratings yet" desc="Your ratings on uploaded materials will appear here." />
        ) : (
          ratings.map((r, i) => (
            <View key={r._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === ratings.length - 1 ? 0 : 1, borderBottomColor: COLORS.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, flex: 1 }} numberOfLines={1}>{r.title}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(r.ratedAt)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 13, color: COLORS.muted }}>{r.courseCode}</Text>
                <StarRow avg={r.score} />
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard icon="cloud-upload" title="My Latest Uploads" count={uploads.length > 3 ? 3 : uploads.length} loading={loading}>
        {uploads.length === 0 ? (
          <EmptyState icon="cloud-offline-outline" title="No uploads yet" desc="Start contributing by uploading study materials." />
        ) : (
          uploads.slice(0, 3).map((u, i) => (
            <View key={u._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === 2 || i === uploads.length - 1 ? 0 : 1, borderBottomColor: COLORS.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, flex: 1 }} numberOfLines={1}>{u.title}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(u.createdAt)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 13, color: COLORS.muted }}>{u.courseCode} • PDF</Text>
                <StatusBadge status={u.status} />
              </View>
              {u.status === "rejected" && u.rejectionReason && (
                <View style={{ marginTop: 8, backgroundColor: `${COLORS.error}10`, padding: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.error, textTransform: "capitalize" }}>
                    Reason: {u.rejectionReason.replace("_", " ")}
                  </Text>
                  {u.rejectionNote && <Text style={{ fontSize: 12, color: COLORS.error, marginTop: 2 }}>{u.rejectionNote}</Text>}
                </View>
              )}
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard icon="medal" title="Highest Rated Files" count={topRated?.length} loading={loading}>
        {(!topRated || topRated.length === 0) ? (
          <EmptyState icon="star-outline" title="No rated files yet" desc="Files will appear here once students start rating." />
        ) : (
          topRated.map((m, i) => (
            <View key={m._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === topRated.length - 1 ? 0 : 1, borderBottomColor: COLORS.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                <StarRow avg={m.averageRating} reviewCount={m.totalRatings} />
              </View>
              <Text style={{ fontSize: 13, color: COLORS.muted }}>
                {m.courseCode} • by {m.uploadedBy?.name || "Unknown"}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard icon="trophy" title="Most Active Contributors" count={contributors?.length} loading={loading}>
        {(!contributors || contributors.length === 0) ? (
          <EmptyState icon="person-outline" title="No contributors yet" desc="Users who upload materials will appear here." />
        ) : (
          contributors.map((c, i) => (
            <View key={c._id || i} style={{ paddingVertical: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: i === contributors.length - 1 ? 0 : 1, borderBottomColor: COLORS.border }}>
              <View style={{ width: 24, alignItems: "center", marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : COLORS.muted }}>#{i + 1}</Text>
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: COLORS.white }}>{c.name?.charAt(0)?.toUpperCase() || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text }}>{c.name}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted, textTransform: "capitalize" }}>{c.role}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.text }}>{c.totalUploads} uploads</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.success }}>{c.approvedUploads} approved</Text>
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
        <StatCard icon="time" color="#f59e0b" count={pending.length} label="Pending Requests" />
        <StatCard icon="trending-up" color="#2b8cee" count={topRated.length} label="Top Rated Files" />
        <StatCard icon="people" color={COLORS.success} count={contributors.length} label="Active Contributors" />
      </View>

      <SectionCard icon="clipboard" title="Pending Upload Requests" count={pending.length} loading={loading}>
        {pending.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="All caught up!" desc="No pending upload requests to review at the moment." />
        ) : (
          pending.map((m, i) => (
            <View key={m._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === pending.length - 1 ? 0 : 1, borderBottomColor: COLORS.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(m.createdAt)}</Text>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>
                {m.courseCode} • PDF • by {m.uploadedBy?.name || "Unknown"}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: COLORS.card, paddingVertical: 8, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: COLORS.border }}
                  onPress={() => Linking.openURL(m.pdfUrl)}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.text }}>View PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: COLORS.success, paddingVertical: 8, borderRadius: 8, alignItems: "center" }}
                  onPress={() => handleApprove(m._id)}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.white }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: COLORS.error, paddingVertical: 8, borderRadius: 8, alignItems: "center" }}
                  onPress={() => setRejectTarget(m)}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.white }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard icon="medal" title="Highest Rated Files" count={topRated.length} loading={loading}>
        {topRated.length === 0 ? (
          <EmptyState icon="star-outline" title="No rated files yet" desc="Files will appear here once students start rating." />
        ) : (
          topRated.map((m, i) => (
            <View key={m._id || i} style={{ paddingVertical: 12, borderBottomWidth: i === topRated.length - 1 ? 0 : 1, borderBottomColor: COLORS.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                <StarRow avg={m.averageRating} reviewCount={m.totalRatings} />
              </View>
              <Text style={{ fontSize: 13, color: COLORS.muted }}>
                {m.courseCode} • by {m.uploadedBy?.name || "Unknown"}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard icon="trophy" title="Most Active Contributors" count={contributors.length} loading={loading}>
        {contributors.length === 0 ? (
          <EmptyState icon="person-outline" title="No contributors yet" desc="Users who upload materials will appear here." />
        ) : (
          contributors.map((c, i) => (
            <View key={c._id || i} style={{ paddingVertical: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: i === contributors.length - 1 ? 0 : 1, borderBottomColor: COLORS.border }}>
              <View style={{ width: 24, alignItems: "center", marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : COLORS.muted }}>#{i + 1}</Text>
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: COLORS.white }}>{c.name?.charAt(0)?.toUpperCase() || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text }}>{c.name}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted, textTransform: "capitalize" }}>{c.role}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.text }}>{c.totalUploads} uploads</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.success }}>{c.approvedUploads} approved</Text>
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
            <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.text }}>Reject Material</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={COLORS.muted} /></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14, color: COLORS.muted, marginBottom: SPACING.md }}>
            Rejecting: <Text style={{ fontWeight: "700", color: COLORS.text }}>{material?.title}</Text>
          </Text>

          <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 8 }}>Rejection Reason</Text>
          {REASONS.map(r => (
            <TouchableOpacity key={r.value} onPress={() => setReason(r.value)} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: reason === r.value ? COLORS.navy2 : COLORS.muted, justifyContent: "center", alignItems: "center", marginRight: 8 }}>
                {reason === r.value && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.navy2 }} />}
              </View>
              <Text style={{ fontSize: 14, color: COLORS.text }}>{r.label}</Text>
            </TouchableOpacity>
          ))}

          <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 8 }}>Additional Notes (optional)</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.input, padding: 12, height: 80, textAlignVertical: "top", marginBottom: SPACING.xl }}
            placeholder="Provide additional feedback..."
            value={note}
            onChangeText={setNote}
            multiline
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: RADIUS.button, alignItems: "center", backgroundColor: COLORS.card }} onPress={onClose}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 14, borderRadius: RADIUS.button, alignItems: "center", backgroundColor: !reason || submitting ? COLORS.border : COLORS.error }}
              onPress={handleSubmit}
              disabled={!reason || submitting}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.white }}>{submitting ? "Rejecting..." : "Reject Material"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
