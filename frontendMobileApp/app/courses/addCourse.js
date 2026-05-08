import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { COLORS, RADIUS, SPACING, TYPO } from '../../src/theme/theme';
import { createCourse } from '../../src/services/coursesService';

const DEPARTMENT_ITEMS = [
  { label: 'Computer Science', value: 'Computer Science' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Statistics', value: 'Statistics' },
];

const YEAR_ITEMS = [
  { label: 'Year 1', value: 1 },
  { label: 'Year 2', value: 2 },
  { label: 'Year 3', value: 3 },
  { label: 'Year 4', value: 4 },
];

export default function AddCourse() {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCourse = async () => {
    setError('');

    if (!title.trim()) return setError('Course title is required.');
    if (!courseCode.trim()) return setError('Course code is required.');
    if (!description.trim()) return setError('Description is required.');

    setLoading(true);
    try {
      await createCourse(title.trim(), courseCode.trim().toUpperCase(), description.trim(), department, year);
      Alert.alert('Success', 'Course created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/courses') },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to create course.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Feather name="arrow-left" size={22} color={COLORS.navy2} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Add New Course</Text>
        </View>

        <View style={styles.card}>
          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={15} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Course Title</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Introduction to React"
            placeholderTextColor={COLORS.muted}
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            autoFocus
          />

          <Text style={styles.label}>Course Code</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. CS101"
            placeholderTextColor={COLORS.muted}
            value={courseCode}
            onChangeText={setCourseCode}
            editable={!loading}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Department</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              value={department}
              onValueChange={(value) => setDepartment(value)}
              items={DEPARTMENT_ITEMS}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
              disabled={loading}
            >
              <View style={styles.pickerCustomChild}>
                <Text style={styles.pickerCustomText}>{department}</Text>
                <Feather name="chevron-down" size={18} color={COLORS.muted} />
              </View>
            </RNPickerSelect>
          </View>

          <Text style={styles.label}>Academic Year</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              value={year}
              onValueChange={(value) => setYear(Number(value))}
              items={YEAR_ITEMS}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
              disabled={loading}
            >
              <View style={styles.pickerCustomChild}>
                <Text style={styles.pickerCustomText}>Year {year}</Text>
                <Feather name="chevron-down" size={18} color={COLORS.muted} />
              </View>
            </RNPickerSelect>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the course..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            textAlignVertical="top"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleAddCourse}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="plus-circle" size={16} color="#fff" />
                  <Text style={styles.btnPrimaryText}>Create Course</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    ...TYPO.h2,
    fontSize: 20,
  },
  card: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: SPACING.sm,
    borderRadius: RADIUS.input,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pickerCustomChild: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
  },
  pickerCustomText: {
    fontSize: 14,
    color: COLORS.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
  },
  btnSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 0.8,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
  },
  btnPrimary: {
    backgroundColor: COLORS.navy2,
    flex: 1.2,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

