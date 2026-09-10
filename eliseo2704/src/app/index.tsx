import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  Linking,
  AppState,
  AppStateStatus,
  Animated,
  LogBox,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';

// Sopprime tutti i toast/avvisi di debug interni
LogBox.ignoreAllLogs(true);

const ELISEE_URL = 'https://elisee-scout.vercel.app';
const VERSION_URL = 'https://elisee-scout.vercel.app/version.json';
const POLL_INTERVAL_MS = 5000; // 5s — bilanciamento freschezza vs batteria

// Iniezione CSS/JS immediata: elimina cookie banner, abilita scroll nativo fluido
const CLEANUP_JS = `
  (function() {
    if (window.__ELISEE_MOBILE_INIT__) return;
    window.__ELISEE_MOBILE_INIT__ = true;
    window.__ELISEE_MOBILE_APP__ = true;

    // Accetta cookie in modo silenzioso
    try {
      var c = JSON.stringify({
        version: 2, technical: true, analytics: true,
        profiling: true, marketing: true,
        updatedAt: new Date().toISOString(), source: 'mobile_app'
      });
      localStorage.setItem('elisee_cookie_consent_v2', c);
      localStorage.setItem('elisee_cookie_consent', 'all');
      localStorage.setItem('elisee_cookies_accepted', 'true');
    } catch (e) {}

    // Rimozione immediata banner e badge invasivi
    var style = document.createElement('style');
    style.id = 'elisee-mobile-overrides';
    style.textContent = [
      '#cookie-banner,#elisee-cookie-banner,#elisee-cookie-settings-btn,',
      '.cookie-banner,.elisee-cookie-badge-btn{',
      'display:none!important;visibility:hidden!important;',
      'opacity:0!important;pointer-events:none!important;height:0!important}',
      'body{-webkit-tap-highlight-color:transparent;',
      'padding-bottom:env(safe-area-inset-bottom,16px)!important}',
      /* Scroll più fluido su WebKit */
      '*{-webkit-overflow-scrolling:touch}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);

    // Rimozione diretta elementi DOM già presenti
    ['cookie-banner','elisee-cookie-settings-btn'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  })();
  true;
`;

export default function MobileHomeScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Ref per versione — non causa re-render (evita il loop useEffect)
  const currentVersionRef = useRef<string | null>(null);

  // Banner di aggiornamento automatico
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const bannerAnim = useRef(new Animated.Value(-60)).current;

  const triggerAutoReload = useCallback(() => {
    setShowUpdateBanner(true);
    Animated.spring(bannerAnim, { toValue: 12, useNativeDriver: true, tension: 120, friction: 10 }).start();
    setTimeout(() => {
      webViewRef.current?.reload();
      setTimeout(() => {
        Animated.timing(bannerAnim, { toValue: -60, duration: 250, useNativeDriver: true }).start(
          () => setShowUpdateBanner(false)
        );
      }, 1200);
    }, 200);
  }, [bannerAnim]);

  const checkVersion = useCallback(async () => {
    try {
      const res = await fetch(`${VERSION_URL}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) return;
      const data = await res.json();
      const verId: string = data.version || data.updatedAt || '';
      if (!verId) return;
      if (currentVersionRef.current === null) {
        currentVersionRef.current = verId;
      } else if (verId !== currentVersionRef.current) {
        currentVersionRef.current = verId;
        triggerAutoReload();
      }
    } catch (_) {}
  }, [triggerAutoReload]);

  // Polling — dipende solo da checkVersion (stabile), nessun loop
  useEffect(() => {
    checkVersion();
    const interval = setInterval(checkVersion, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkVersion]);

  // Refresh al risveglio app
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') checkVersion();
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [checkVersion]);

  // Tasto Indietro Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBack = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [canGoBack]);

  const handleNavStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    if (!navState.loading) setIsLoading(false);
  }, []);

  const handleManualReload = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, 8),
          paddingBottom: Math.max(insets.bottom, 12),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <View style={styles.container}>

        {/* Banner aggiornamento automatico */}
        {showUpdateBanner && (
          <Animated.View style={[styles.updateBanner, { transform: [{ translateY: bannerAnim }] }]}>
            <Text style={styles.updateBannerDot}>⚡</Text>
            <Text style={styles.updateBannerText}>Sincronizzazione in corso…</Text>
          </Animated.View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: ELISEE_URL }}
          style={styles.webview}
          onNavigationStateChange={handleNavStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 500) setHasError(true);
          }}
          // Cache HTTP del browser interno (ricariche più veloci)
          cacheEnabled={true}
          // Funzionalità
          pullToRefreshEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          databaseEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures={true}
          mixedContentMode="compatibility"
          // Iniezione per eliminare elementi invasivi
          injectedJavaScriptBeforeContentLoaded={CLEANUP_JS}
          injectedJavaScript={CLEANUP_JS}
          // UA mobile per layout responsive corretto
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 EliseeScoutApp/1.0"
          // Gestione link esterni (tel, mailto, WhatsApp)
          onShouldStartLoadWithRequest={({ url }) => {
            if (
              url.startsWith('tel:') ||
              url.startsWith('mailto:') ||
              url.startsWith('whatsapp:') ||
              url.startsWith('https://wa.me/')
            ) {
              Linking.openURL(url).catch(() => {});
              return false;
            }
            return true;
          }}
        />

        {/* Loader iniziale */}
        {isLoading && !showUpdateBanner && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loaderBox}>
              <Text style={styles.loaderLogo}>⚡ ELISEE SCOUT</Text>
              <ActivityIndicator size="large" color="#38bdf8" style={styles.spinner} />
              <Text style={styles.loaderText}>Caricamento…</Text>
            </View>
          </View>
        )}

        {/* Schermata di errore */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>📡</Text>
              <Text style={styles.errorTitle}>Connessione non riuscita</Text>
              <Text style={styles.errorDesc}>
                Impossibile raggiungere Elisee Scout. Controlla la connessione Internet e riprova.
              </Text>
              <Pressable style={styles.retryButton} onPress={handleManualReload}>
                <Text style={styles.retryText}>Riprova ora</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050810' },
  container: { flex: 1, backgroundColor: '#050810', position: 'relative' },
  webview: { flex: 1, backgroundColor: '#050810' },
  updateBanner: {
    position: 'absolute',
    top: 4,
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: 'rgba(6,18,38,0.96)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  updateBannerDot: { fontSize: 15 },
  updateBannerText: { color: '#38bdf8', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050810',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loaderBox: { alignItems: 'center', padding: 24 },
  loaderLogo: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 2, marginBottom: 16 },
  spinner: { marginBottom: 14 },
  loaderText: { fontSize: 14, color: '#94a3b8', letterSpacing: 0.5 },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050810',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorCard: {
    backgroundColor: '#0d1527',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 10, textAlign: 'center' },
  errorDesc: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  retryButton: { backgroundColor: '#0284c7', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 999 },
  retryText: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});
