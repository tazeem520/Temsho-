import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { C, R } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';

let WebView = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    WebView = null;
  }
}

const VISME_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #F4F6FB;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .visme_d {
      width: 100%;
      height: 100vh;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div class="visme_d"
       data-title="Email Capture Form Template"
       data-domain="forms"
       data-full-page="true"
       data-min-height="100vh"
       data-form-id="192189">
  </div>
  <script src="https://static-bundles.visme.co/forms/vismeforms-embed.js"></script>
</body>
</html>
`;

export default function VismeFormModal({ onClose }) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={st.container}>
      <View style={st.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={st.iconBadge}>
            <MC name="email-fast-outline" size={20} color="#fff" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={st.headerTitle}>Interactive Login & Capture</Text>
            <Text style={st.headerSub}>Visme Animated Form (ID: 192189)</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={st.closeBtn}>
            <MC name="close" size={22} color={C.ink} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <View style={st.loaderWrap}>
            <ActivityIndicator size="large" color={C.brand} />
            <Text style={{ marginTop: 10, color: C.ink2, fontSize: 13, fontWeight: '700' }}>
              Loading Interactive Animation…
            </Text>
          </View>
        )}

        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={VISME_HTML}
            style={{ width: '100%', height: '100%', border: 'none' }}
            onLoad={() => setLoading(false)}
            title="Visme Interactive Form"
          />
        ) : WebView ? (
          <WebView
            source={{ html: VISME_HTML }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            onLoadEnd={() => setLoading(false)}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Text style={{ color: C.ink2, textAlign: 'center' }}>
              Interactive view available in browser and preview.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 44 : 16, paddingBottom: 14,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  iconBadge: {
    width: 36, height: 36, borderRadius: R.sm, backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '900', color: C.ink },
  headerSub: { fontSize: 11, color: C.ink3, fontWeight: '600' },
  closeBtn: { padding: 6, borderRadius: R.pill, backgroundColor: '#F3F4F6' },
  loaderWrap: {
    ...StyleSheet.absoluteFillObject, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
});
