import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Boutique Tab Layout
 * Different navigation structure for boutique users
 * Based on blueprint requirements for boutique-specific features
 */
export default function BoutiqueTabLayout() {
    const colorScheme = useColorScheme();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}>
            {/* Dashboard Tab */}
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
                }}
            />

            {/* Catalog Tab */}
            <Tabs.Screen
                name="catalog"
                options={{
                    title: 'Catalog',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="tshirt.fill" color={color} />,
                }}
            />


            {/* Orders Tab */}
            {/* <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="bag.fill" color={color} />,
                }}
            /> */}

            {/* Customer Try-On Tab */}
            {/* <Tabs.Screen
                name="customer-tryon"
                options={{
                    title: 'Try-Ons',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
                }}
            /> */}

            {/* Analytics Tab */}
            {/* <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />,
                }}
            /> */}

            {/* Profile Tab */}
            {/* <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            /> */}
        </Tabs>
    );
}
