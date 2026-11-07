import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { C, R } from '../theme';

export default function VismeFormModal({ visible = true, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={st.container}>
        <View style={st.header}>
          <TouchableOpacity onPress={onClose} style={st.closeBtn}>
            <MC name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={st.title}>Seller Registration & Inquiries</Text>
        </View>

        {Platform.OS === 'web' ? (
          <iframe
            src="https://my.visme.co/view/ep616q0d-temsho-seller-inquiry"
            title="Temsho Inquiry Form"
            style={{ width: '100%', height: '100%', border: 'none', flex: 1 }}
          />
        ) : (
          <View style={st.fallback}>
            <MC name="form-select" size={48} color={C.brand} />
            <Text style={st.fallbackTitle}>Seller Onboarding Form</Text>
            <Text style={st.fallbackSub}>
              Please use our instant seller registration directly inside the app under Account ➔ Become a Seller!
            </Text>
            <TouchableOpacity onPress={onClose} style={st.actionBtn}>
              <Text style={st.actionBtnText}>Back to App</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: C.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  closeBtn: {
    padding: 6,
    marginRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.ink,
    marginTop: 14,
  },
  fallbackSub: {
    fontSize: 13,
    color: C.ink2,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: C.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
