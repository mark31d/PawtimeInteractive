// File: App.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { View, ImageBackground, StatusBar, Platform } from 'react-native';
import { IMAGES } from './Components/AssetRegistry';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Loader from './Components/Loader';
import OnboardingScreen from './Components/OnboardingScreen';
import MainTabs from './Components/MainTabs';
import BreedDetailsScreen from './Components/BreedDetailsScreen';
import SettingsScreen from './Components/SettingsScreen';

enableScreens();

// ─── Utilities ────────────────────────────────────────────────────────────────
export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function addDaysToISO(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) { return ''; }
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function shortDay(isoDate) {
  if (!isoDate) { return ''; }
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function calcStreak(logs) {
  if (!logs || logs.length === 0) { return 0; }
  const sorted = [...logs].sort((a, b) =>
    b.dateISO.localeCompare(a.dateISO),
  );
  let streak = 0;
  let expected = todayISO();
  for (const log of sorted) {
    if (
      log.dateISO === expected &&
      log.doneTaskIds &&
      log.doneTaskIds.length > 0
    ) {
      streak++;
      const d = new Date(expected + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }
  return streak;
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = '@cat_atlas_v1';

export const DEFAULT_STATE = {
  onboardingDone: false,
  profile: {
    name: '',
    avatarUri: null,
  },
  preferences: {
    units: 'metric',
    themeMode: 'dark',
  },
  favorites: [],
  notes: [],
};

// ─── Context ──────────────────────────────────────────────────────────────────
export const AppContext = createContext({
  state: DEFAULT_STATE,
  setState: () => {},
  resetAll: async () => {},
  finishOnboarding: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

// ─── Navigation theme (dark — no white flash) ─────────────────────────────────
const NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
    text: '#FFFFFF',
    border: '#3D1A00',
    notification: '#FFD700',
    primary: '#FFD700',
  },
};

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timerRef = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback(
    (...args) => {
      if (timerRef.current) { clearTimeout(timerRef.current); }
      timerRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [appState, setAppStateRaw] = useState(DEFAULT_STATE);
  const [booting, setBooting] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) {
          try {
            const saved = JSON.parse(raw);
            setAppStateRaw(prev => {
              const merged = {
                ...DEFAULT_STATE,
                ...saved,
                preferences: {
                  ...DEFAULT_STATE.preferences,
                  ...(saved.preferences || {}),
                },
              };
              return merged;
            });
          } catch (_) {}
        }
      })
      .catch(() => {});
  }, []);

  const saveToStorage = useCallback(s => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s)).catch(() => {});
  }, []);

  const debouncedSave = useDebounce(saveToStorage, 600);

  const setState = useCallback(
    updater => {
      setAppStateRaw(prev => {
        const next =
          typeof updater === 'function'
            ? updater(prev)
            : { ...prev, ...updater };
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave],
  );

  const resetAll = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setAppStateRaw({ ...DEFAULT_STATE });
  }, []);

  return (
    <AppContext.Provider value={{ state: appState, setState, resetAll, finishOnboarding: () => setOnboardingDone(true) }}>
      <ImageBackground source={IMAGES.bg} style={{ flex: 1 }} resizeMode="cover">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent={Platform.OS === 'android'}
          />
          {booting ? (
            <Loader spinnerDuration={8000} onDone={() => setBooting(false)} />
          ) : (
            <NavigationContainer theme={NAV_THEME}>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  contentStyle: { backgroundColor: 'transparent' },
                }}>
                {!onboardingDone ? (
                  <Stack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                  />
                ) : (
                  <React.Fragment>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen
                      name="BreedDetails"
                      component={BreedDetailsScreen}
                    />
                    <Stack.Screen
                      name="Settings"
                      component={SettingsScreen}
                    />
                  </React.Fragment>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          )}
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ImageBackground>
    </AppContext.Provider>
  );
}
