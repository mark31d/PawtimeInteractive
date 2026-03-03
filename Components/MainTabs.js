// File: Components/MainTabs.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './CustomTabBar';
import CatCatalogScreen from './CatCatalogScreen';
import CareGuidesScreen from './CareGuidesScreen';
import NotesScreen from './NotesScreen';
import StatsScreen from './StatsScreen';
import MapScreen from './MapScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            shadowColor: 'transparent',
            height: 0,
          },
        }}>
        <Tab.Screen name="CatsTab" component={CatCatalogScreen} />
        <Tab.Screen name="CareTab" component={CareGuidesScreen} />
        <Tab.Screen name="NotesTab" component={NotesScreen} />
        <Tab.Screen name="StatsTab" component={StatsScreen} />
        <Tab.Screen name="MapTab" component={MapScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
