import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../theme/theme';

const Flashcard = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => setIsFlipped(!isFlipped)}
      style={styles.container}
    >
      <View style={[styles.card, isFlipped ? styles.cardBack : styles.cardFront]}>
        {!isFlipped ? (
          <View style={styles.content}>
            <Text style={styles.label}>Question:</Text>
            <Text style={styles.text}>{question}</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.labelAnswer}>Answer:</Text>
            <Text style={styles.text}>{answer}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    minHeight: 150,
    justifyContent: 'center',
    shadowColor: COLORS.navy2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardFront: {
    backgroundColor: COLORS.white,
  },
  cardBack: {
    backgroundColor: COLORS.navy2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelAnswer: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.teal,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontSize: 18,
    color: COLORS.navy,
    lineHeight: 24,
  },
});

export default Flashcard;
