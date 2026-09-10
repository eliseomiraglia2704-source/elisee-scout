import React, { useRef, useState, useEffect } from 'react';
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
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

const ELISEE_URL = 'https://elisee-scout.vercel.app';

export default function MobileHomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
          // Abilita tutte le API necessarie per il funzionamento completo di Elisee Scout
          javaScriptEnabled={true}
          domStorageEnabled={true}
          databaseEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures={true}
          mixedContentMode="compatibility"
          // Iniezione user agent mobile standard per assicurare layout 100% responsive come da browser
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 EliseeScoutApp/1.0"
          onShouldStartLoadWithRequest={(request) => {
            const { url } = request;
            // Gestisci link esterni (WhatsApp, telefono, email)
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

        {/* Loader iniziale durante il caricamento */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loaderBox}>
              <Text style={styles.loaderLogo}>⚡ ELISEE SCOUT</Text>
              <ActivityIndicator size="large" color="#38bdf8" style={styles.spinner} />
              <Text style={styles.loaderText}>Caricamento piattaforma...</Text>
            </View>
          </View>
        )}

        {/* Schermata di errore con tasto Riprova */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>📡</Text>
              <Text style={styles.errorTitle}>Connessione non riuscita</Text>
              <Text style={styles.errorDesc}>
                Impossibile raggiungere la piattaforma Elisee Scout. Controlla la tua connessione
                Internet e riprova.
              </Text>
              <Pressable style={styles.retryButton} onPress={handleReload}>
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
