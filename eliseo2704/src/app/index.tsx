import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RoleData {
  title: string;
  role: string;
  club: string;
  ovr: number;
  badge: string;
  isGps: boolean;
  color: string;
  stat1: { label: string; val: string };
  stat2: { label: string; val: string };
  attrs: { vel: number; tir: number; pas: number; dri: number; def: number; fis: number };
}

const ROLES_DATA: Record<string, RoleData> = {
  calciatore: {
    title: 'Calciatore / Atleta',
    role: 'Centrocampista',
    club: 'ASD Nova Calcio',
    ovr: 84,
    badge: 'Freccia della Fascia',
    isGps: true,
    color: '#10b981',
    stat1: { label: 'Km Percorsi', val: '142 km' },
    stat2: { label: 'Top Speed', val: '32.4 km/h' },
    attrs: { vel: 83, tir: 71, pas: 88, dri: 79, def: 68, fis: 85 },
  },
  mister: {
    title: 'Allenatore / Staff',
    role: 'Mister UEFA Pro',
    club: 'ASD Nova Calcio',
    ovr: 88,
    badge: "Mister dell'Anno",
    isGps: true,
    color: '#ea580c',
    stat1: { label: 'Modulo Top', val: '4-3-3' },
    stat2: { label: 'Fattore Panchina', val: '8 Gol' },
    attrs: { vel: 78, tir: 82, pas: 90, dri: 80, def: 88, fis: 86 },
  },
  scout: {
    title: 'Direttore Sportivo & Scout',
    role: 'Direttore Sportivo',
    club: 'Talent Scout Network',
    ovr: 92,
    badge: 'Re del Calciomercato',
    isGps: false,
    color: '#8b5cf6',
    stat1: { label: 'Card Analizzate', val: '342' },
    stat2: { label: 'Colpo Estate', val: '94% IA' },
    attrs: { vel: 85, tir: 80, pas: 94, dri: 88, def: 90, fis: 85 },
  },
  tifoso: {
    title: 'Tifoso / Community',
    role: 'Super Tifoso',
    club: 'ASD Nova Calcio Supporters',
    ovr: 96,
    badge: 'Collezionista Legend',
    isGps: false,
    color: '#ec4899',
    stat1: { label: 'Card Album', val: '150 Card' },
    stat2: { label: 'Presenze Stadio', val: '18 Gare' },
    attrs: { vel: 90, tir: 92, pas: 95, dri: 91, def: 90, fis: 96 },
  },
};

export default function HomeScreen() {
  const [selectedRole, setSelectedRole] = useState<string>('calciatore');
  const [showWrappedModal, setShowWrappedModal] = useState<boolean>(false);

  const active = ROLES_DATA[selectedRole];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* TOP BAR */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>⚡</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>ELISEE SCOUT</Text>
              <Text style={styles.brandSubtitle}>APP UFFICIALE · EXPO GO</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>2025/26</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* BANNER SEASON WRAPPED */}
          <Pressable
            style={({ pressed }) => [styles.wrappedBanner, pressed && styles.pressed]}
            onPress={() => setShowWrappedModal(!showWrappedModal)}>
            <View style={styles.wrappedBadgeRow}>
              <Text style={styles.wrappedTag}>FEATURE SPECIALE</Text>
              <Text style={styles.wrappedActionText}>
                {showWrappedModal ? 'Chiudi ▲' : 'Apri Story 9:16 ▼'}
              </Text>
            </View>
            <Text style={styles.wrappedTitle}>Season Wrapped 2025/26 🏆</Text>
            <Text style={styles.wrappedDesc}>
              Il recap virale con sistema Card OVR stile FIFA e 21 profili del club.
            </Text>
          </Pressable>

          {/* WRAPPED STORY PREVIEW MODAL / DROPDOWN */}
          {showWrappedModal && (
            <View style={styles.wrappedDetailCard}>
              <Text style={styles.wrappedDetailKicker}>MY SEASON STORY · SLIDE FINALE</Text>
              <Text style={styles.wrappedDetailHero}>{active.badge}</Text>
              <Text style={styles.wrappedDetailText}>
                Sei stato promosso ufficialmente! La tua Card speciale Season Wrapped è
                pronta per essere condivisa su Instagram Stories e TikTok.
              </Text>
              <View style={styles.growthRow}>
                <View style={styles.growthBox}>
                  <Text style={styles.growthYear}>2023/24</Text>
                  <Text style={styles.growthOvr}>72</Text>
                </View>
                <Text style={styles.growthArrow}>→</Text>
                <View style={styles.growthBox}>
                  <Text style={styles.growthYear}>2024/25</Text>
                  <Text style={styles.growthOvr}>78</Text>
                </View>
                <Text style={styles.growthArrow}>→</Text>
                <View style={[styles.growthBox, styles.growthBoxHighlight]}>
                  <Text style={[styles.growthYear, { color: '#fef08a' }]}>2025/26</Text>
                  <Text style={[styles.growthOvr, { color: '#fef08a' }]}>{active.ovr}</Text>
                </View>
              </View>
            </View>
          )}

          {/* SELETTORE RUOLO INTERATTIVO */}
          <Text style={styles.sectionTitle}>Simulatore Ruolo Mobile</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleTabsScroll}>
            {Object.keys(ROLES_DATA).map((rk) => {
              const r = ROLES_DATA[rk];
              const isSel = selectedRole === rk;
              return (
                <Pressable
                  key={rk}
                  style={[styles.roleTab, isSel && styles.roleTabActive]}
                  onPress={() => setSelectedRole(rk)}>
                  <Text style={[styles.roleTabText, isSel && styles.roleTabTextActive]}>
                    {r.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* CARD FIFA STYLE OVR */}
          <View style={styles.cardContainer}>
            <View style={styles.fifaCard}>
              <View style={styles.cardGlow} />
              <View style={styles.cardHeader}>
                <Text style={styles.cardOvrNum}>{active.ovr}</Text>
                <View>
                  <Text style={styles.cardRoleName}>{active.role.toUpperCase()}</Text>
                  <Text style={styles.cardClubName}>{active.club}</Text>
                </View>
              </View>

              <View style={styles.badgeRow}>
                {active.isGps ? (
                  <View style={styles.gpsBadge}>
                    <Text style={styles.gpsBadgeText}>⚡ GPS Validated (1.0x)</Text>
                  </View>
                ) : (
                  <View style={styles.manualBadge}>
                    <Text style={styles.manualBadgeText}>📋 Autocertificato (Cap 90)</Text>
                  </View>
                )}
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{active.badge}</Text>
                </View>
              </View>

              {/* 6 ATTRIBUTI FIFA */}
              <View style={styles.attrGrid}>
                <View style={styles.attrCol}>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLbl}>VEL</Text>
                    <Text style={styles.attrVal}>{active.attrs.vel}</Text>
                  </View>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLbl}>TIR</Text>
                    <Text style={styles.attrVal}>{active.attrs.tir}</Text>
                  </View>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLbl}>PAS</Text>
                    <Text style={styles.attrVal}>{active.attrs.pas}</Text>
                  </View>
                </View>
                <View style={styles.attrCol}>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLbl}>DRI</Text>
                    <Text style={styles.attrVal}>{active.attrs.dri}</Text>
                  </View>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLbl}>DIF</Text>
                    <Text style={styles.attrVal}>{active.attrs.def}</Text>
                  </View>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLbl}>FIS</Text>
                    <Text style={styles.attrVal}>{active.attrs.fis}</Text>
                  </View>
                </View>
              </View>

              {/* STATISTICHE CHIAVE REPARTO */}
              <View style={styles.cardStatsRow}>
                <View style={styles.cardStatBox}>
                  <Text style={styles.cardStatLbl}>{active.stat1.label}</Text>
                  <Text style={styles.cardStatVal}>{active.stat1.val}</Text>
                </View>
                <View style={styles.cardStatBox}>
                  <Text style={styles.cardStatLbl}>{active.stat2.label}</Text>
                  <Text style={styles.cardStatVal}>{active.stat2.val}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* QUICK HUB SERVICES */}
          <Text style={styles.sectionTitle}>Hub Ecosistema Club</Text>
          <View style={styles.hubGrid}>
            <View style={styles.hubTile}>
              <Text style={styles.hubIcon}>📈</Text>
              <Text style={styles.hubTitle}>Secret List</Text>
              <Text style={styles.hubDesc}>Scouting stealth DS</Text>
            </View>
            <View style={styles.hubTile}>
              <Text style={styles.hubIcon}>🔄</Text>
              <Text style={styles.hubTitle}>Wall Mercato</Text>
              <Text style={styles.hubDesc}>Trattative ufficiali FIFA</Text>
            </View>
            <View style={styles.hubTile}>
              <Text style={styles.hubIcon}>📊</Text>
              <Text style={styles.hubTitle}>Match Analysis</Text>
              <Text style={styles.hubDesc}>Dossier e heatmap</Text>
            </View>
            <View style={styles.hubTile}>
              <Text style={styles.hubIcon}>🧤</Text>
              <Text style={styles.hubTitle}>Stanza GK</Text>
              <Text style={styles.hubDesc}>Preparatore portieri</Text>
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Collegato a Expo Go · Sincronizzato con elisee-scout.vercel.app
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050810',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  wrappedBanner: {
    backgroundColor: '#131b2e',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  wrappedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wrappedTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  wrappedActionText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  wrappedTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  wrappedDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  wrappedDetailCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#eab308',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  wrappedDetailKicker: {
    color: '#eab308',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  wrappedDetailHero: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  wrappedDetailText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  growthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 10,
  },
  growthBox: {
    alignItems: 'center',
  },
  growthBoxHighlight: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  growthYear: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  growthOvr: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  growthArrow: {
    color: '#64748b',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  roleTabsScroll: {
    marginBottom: 18,
  },
  roleTab: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: 8,
  },
  roleTabActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  roleTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fifaCard: {
    width: '100%',
    backgroundColor: '#0e1626',
    borderWidth: 2,
    borderColor: '#eab308',
    borderRadius: 22,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  cardOvrNum: {
    color: '#fef08a',
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 46,
  },
  cardRoleName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardClubName: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  gpsBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gpsBadgeText: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '800',
  },
  manualBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderColor: 'rgba(234, 179, 8, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  manualBadgeText: {
    color: '#fde047',
    fontSize: 10,
    fontWeight: '800',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  attrGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  attrCol: {
    flex: 1,
    gap: 6,
  },
  attrItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  attrLbl: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  attrVal: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '900',
  },
  cardStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cardStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  cardStatLbl: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardStatVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  hubTile: {
    width: '48%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
  },
  hubIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  hubTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  hubDesc: {
    color: '#94a3b8',
    fontSize: 10,
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
  },
});
