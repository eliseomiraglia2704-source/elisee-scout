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
  SafeAreaView,
  AppState,
  AppStateStatus,
  Animated,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

const ELISEE_URL = 'https://elisee-scout.vercel.app';
const VERSION_URL = 'https://elisee-scout.vercel.app/version.json';
const POLL_INTERVAL_MS = 3000; // Controlla aggiornamenti ogni 3 secondi

export default function MobileHomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const bannerAnim = useRef(new Animated.Value(-60)).current;

  // Mostra banner animato durante l'auto-reload
  const triggerAutoReload = useCallback(() => {
    setShowUpdateBanner(true);
    Animated.spring(bannerAnim, {
      toValue: 12,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      webViewRef.current?.reload();
      setTimeout(() => {
        Animated.timing(bannerAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowUpdateBanner(false));
      }, 1500);
    }, 400);
  }, [bannerAnim]);

  // Polling continuo di version.json per Live Auto-Reload istantaneo senza F5
  useEffect(() => {
    let isMounted = true;

    const checkVersion = async () => {
      try {
        const res = await fetch(`${VERSION_URL}?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
        if (!res.ok) return;
        const data = await res.json();
        const verId = data.version || data.updatedAt || '';

        if (!isMounted) return;

        if (currentVersion === null) {
          // Primo caricamento
          setCurrentVersion(verId);
        } else if (verId && verId !== currentVersion) {
          // Nuova versione rilevata: ricarica automatica istantanea!
          console.log('[AutoReload] Nuova versione rilevata:', verId, 'Precedente:', currentVersion);
          setCurrentVersion(verId);
          triggerAutoReload();
        }
      } catch (_) {
        // Silenzioso in caso di rete temporaneamente assente
      }
    };

    // Controllo immediato poi a intervalli regolari
    checkVersion();
    const interval = setInterval(checkVersion, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentVersion, triggerAutoReload]);

  // Auto-refresh quando l'utente sblocca il telefono o torna nell'app Expo Go
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Ricontrolla versione immediatamente
        fetch(`${VERSION_URL}?_t=${Date.now()}`, { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => {
            const verId = data.version || data.updatedAt || '';
            if (verId && currentVersion && verId !== currentVersion) {
              setCurrentVersion(verId);
              triggerAutoReload();
            }
          })
          .catch(() => {});
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [currentVersion, triggerAutoReload]);

  // Gestione tasto "Indietro" su dispositivi Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    if (!navState.loading) {
      setIsLoading(false);
    }
  };

  const handleManualReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Banner animato di Auto-Reload */}
        {showUpdateBanner && (
          <Animated.View style={[styles.updateBanner, { transform: [{ translateY: bannerAnim }] }]}>
            <Text style={styles.updateBannerDot}>⚡</Text>
            <Text style={styles.updateBannerText}>Sincronizzazione modifiche in corso...</Text>
          </Animated.View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: ELISEE_URL }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.statusCode >= 500) {
              setHasError(true);
            }
          }}
          // Pull-to-refresh nativo abilitato: basta trascinare verso il basso dall'alto
          pullToRefreshEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          databaseEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures={true}
          mixedContentMode="compatibility"
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 EliseeScoutApp/1.0"
          onShouldStartLoadWithRequest={(request) => {
            const { url } = request;
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

        {/* Loader iniziale durante il primissimo caricamento */}
        {isLoading && !showUpdateBanner && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loaderBox}>
              <Text style={styles.loaderLogo}>⚡ ELISEE SCOUT</Text>
              <ActivityIndicator size="large" color="#38bdf8" style={styles.spinner} />
              <Text style={styles.loaderText}>Caricamento piattaforma...</Text>
            </View>
          </View>
        )}

        {/* Schermata di errore se offline con tasto Riprova */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>📡</Text>
              <Text style={styles.errorTitle}>Connessione non riuscita</Text>
              <Text style={styles.errorDesc}>
                Impossibile raggiungere la piattaforma Elisee Scout. Controlla la tua connessione
                Internet e riprova.
              </Text>
              <Pressable style={styles.retryButton} onPress={handleManualReload}>
                <Text style={styles.retryText}>Riprova ora</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050810',
  },
  container: {
    flex: 1,
    backgroundColor: '#050810',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#050810',
  },
  updateBanner: {
    position: 'absolute',
    top: 8,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: 'rgba(6, 18, 38, 0.96)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  updateBannerDot: {
    fontSize: 16,
  },
  updateBannerText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050810',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loaderBox: {
    alignItems: 'center',
    padding: 24,
  },
  loaderLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 14,
  },
  loaderText: {
    fontSize: 14,
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
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
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  retryButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
