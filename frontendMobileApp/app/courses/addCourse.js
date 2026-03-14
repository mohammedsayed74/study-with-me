import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { COLORS } from '../../src/theme/theme';

const initialCourseData = {
  title: '',
  description: '',
  courseCode: '',
};

export default function AddCourse() {
  const [course, setCourse] = useState(initialCourseData);

  const handleChange = (field, value) => {
    setCourse({ ...course, [field]: value });
  };

  const handleAddCourse = () => {
    
    router.push('/(tabs)/courses');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.header}>Add New Course</Text>

        <Text style={styles.label}>Course Title</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. Introduction to React"
          value={course.title}
          onChangeText={(value) => handleChange('title', value)}
        />

        <Text style={styles.label}>Course Code</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. CS101"
          value={course.courseCode}
          onChangeText={(value) => handleChange('courseCode', value)}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the course..."
          multiline
          numberOfLines={4}
          value={course.description}
          onChangeText={(value) => handleChange('description', value)}
        />

        <TouchableOpacity style={styles.button} onPress={handleAddCourse}>
          <Text style={styles.buttonText}>Create Course</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(tabs)/courses')}>
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e6edf2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    backgroundColor: '#dbe7ef',
    padding: 25,
    borderRadius: 20,
  },

  header: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1a2a3a',
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1a2a3a',
  },

  input: {
    backgroundColor: '#f1f4f6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 18,
  },

  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor:COLORS.blueSoft,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  backText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
