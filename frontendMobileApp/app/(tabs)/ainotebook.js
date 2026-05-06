import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/theme/theme';
import { getDocuments, uploadDocument } from '../../src/services/aiService';

export default function AiNotebook() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDocs();
    }, [])
  );

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        setUploading(true);
        const newDoc = await uploadDocument(file.uri, file.name);
        
        // Refresh or add locally
        setDocuments([newDoc, ...documents]);
        Alert.alert("Success", "Document processed successfully!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Upload Failed", error.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.docCard}
      onPress={() => router.push(`/ainotebook/${item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.docIconContainer}>
        <Ionicons name="document-text" size={32} color={COLORS.navy2} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.docDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Study Notebook</Text>
        <Text style={styles.headerSubtitle}>
          Upload a PDF textbook or lecture notes, and let AI generate a study roadmap, flashcards, and answer your questions!
        </Text>
      </View>

      <View style={styles.uploadSection}>
        <TouchableOpacity 
          style={[styles.uploadButton, uploading && styles.uploadingButton]} 
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={24} color={COLORS.white} style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Upload & Process PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Your Study Documents</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.navy2} style={{ marginTop: 20 }} />
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>No documents uploaded yet.</Text>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.navy2,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  uploadSection: {
    padding: 20,
    paddingTop: 24,
  },
  uploadButton: {
    backgroundColor: COLORS.navy2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.navy2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadingButton: {
    opacity: 0.8,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy2,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  docIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  docDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  emptyText: {
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
