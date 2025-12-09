import React, { type FC } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useSignout } from '@/api/auth/signout/queries';

interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
    is_active: boolean;
    gender?: 'male' | 'female';
    height?: number;
    weight?: number;
    clothing_sizes?: Record<string, string>;
    full_body_image_url?: string;
}

interface ColorScheme {
    background: string;
    text: string;
    tint: string;
    tabIconDefault: string;
}

interface Preferences {
    backgroundPreference: 'clean' | 'original';
    favoriteStyles: string[];
    preferredColors: string[];
    notifications: boolean;
    darkMode: boolean;
}

interface StyleInsight {
    id: string;
    title: string;
    description: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    icon: 'arrow.up' | 'paintpalette' | 'leaf';
}

interface OutfitHistory {
    id: string;
    date: string;
    items: string[];
    imageUrl: string;
    occasion: string;
    rating: number;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: 'star.fill' | 'leaf.fill' | 'crown.fill' | 'camera.fill';
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
}

interface FashionStats {
    totalOutfits: number;
    favoriteColor: string;
    mostWornItem: string;
    styleScore: number;
    sustainabilityScore: number;
    itemsAddedThisMonth: number;
}

const MOCK_USER: User = {
    id: 1,
    email: 'stylish.user@tryrack.com',
    username: 'stylish_user',
    first_name: 'Alex',
    last_name: 'Taylor',
    profile_picture_url: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&h=200&fit=crop',
    is_active: true,
    gender: 'female',
    height: 168,
    weight: 60,
    clothing_sizes: {
        shoe: '38 EU',
        top: 'M',
    },
    full_body_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=900&fit=crop',
};

const MOCK_PREFERENCES: Preferences = {
    backgroundPreference: 'clean',
    favoriteStyles: ['minimal', 'street'],
    preferredColors: ['black', 'white'],
    notifications: true,
    darkMode: false,
};

const MOCK_STYLE_INSIGHTS: StyleInsight[] = [
    {
        id: 'style-preferences',
        title: 'Style Preferences',
        description: 'Minimal chic is your top style',
        value: '72%',
        trend: 'stable',
        icon: 'arrow.up',
    },
    {
        id: 'color-palette',
        title: 'Color Palette',
        description: 'Black dominates your wardrobe',
        value: '58%',
        trend: 'stable',
        icon: 'paintpalette',
    },
    {
        id: 'formality',
        title: 'Formality',
        description: 'Balanced between smart and casual',
        value: '64%',
        trend: 'stable',
        icon: 'leaf',
    },
];

const MOCK_OUTFIT_HISTORY: OutfitHistory[] = [
    {
        id: '1',
        date: '2024-01-15',
        items: ['Black Blazer', 'White Shirt', 'Dark Jeans'],
        imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
        occasion: 'Work Meeting',
        rating: 4.5,
    },
    {
        id: '2',
        date: '2024-01-14',
        items: ['Navy Dress', 'Black Heels', 'Gold Necklace'],
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
        occasion: 'Date Night',
        rating: 5.0,
    },
    {
        id: '3',
        date: '2024-01-13',
        items: ['White T-Shirt', 'Blue Jeans', 'White Sneakers'],
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
        occasion: 'Casual Weekend',
        rating: 4.0,
    },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: '1',
        title: 'Style Explorer',
        description: 'Try 10 different outfit combinations',
        icon: 'star.fill',
        unlocked: true,
    },
    {
        id: '2',
        title: 'Sustainable Shopper',
        description: 'Add 5 sustainable items to wardrobe',
        icon: 'leaf.fill',
        unlocked: true,
    },
    {
        id: '3',
        title: 'Trend Setter',
        description: 'Create 20 unique outfits',
        icon: 'crown.fill',
        unlocked: false,
        progress: 15,
        maxProgress: 20,
    },
    {
        id: '4',
        title: 'Virtual Try-On Master',
        description: 'Use virtual try-on 25 times',
        icon: 'camera.fill',
        unlocked: false,
        progress: 8,
        maxProgress: 25,
    },
];

const MOCK_FASHION_STATS: FashionStats = {
    totalOutfits: 47,
    favoriteColor: 'Black',
    mostWornItem: 'White Cotton T-Shirt',
    styleScore: 87,
    sustainabilityScore: 92,
    itemsAddedThisMonth: 3,
};

const themeColors: ColorScheme = Colors.light as ColorScheme;
const noop = () => { };

const ProfileSection: FC<{ user: User; colors: ColorScheme }> = ({ user, colors }) => (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
        <View style={styles.profileHeader}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
                {user.profile_picture_url ? (
                    <Image source={{ uri: user.profile_picture_url }} style={styles.avatar} />
                ) : (
                    <IconSymbol name="person.fill" size={40} color="white" />
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                    {`${user.first_name ?? 'User'} ${user.last_name ?? ''}`.trim()}
                </Text>
                <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>{user.email}</Text>
            </View>
        </View>
    </View>
);

const PersonalDetailsSection: FC<{ user: User; colors: ColorScheme }> = ({ user, colors }) => {
    const clothingSizes = user.clothing_sizes || {};
    const details = [];

    if (user.height) details.push({ icon: 'ruler' as const, label: 'Height', value: `${user.height}cm` });
    if (user.weight) details.push({ icon: 'scalemass' as const, label: 'Weight', value: `${user.weight}kg` });
    if (clothingSizes.shoe) details.push({ icon: 'tshirt.fill' as const, label: 'Shoe Size', value: clothingSizes.shoe });
    if (clothingSizes.shirt || clothingSizes.top) {
        details.push({
            icon: 'tshirt.fill' as const,
            label: user.gender === 'male' ? 'Shirt' : 'Top',
            value: clothingSizes.shirt || clothingSizes.top || '',
        });
    }

    return (
        <View style={[styles.section, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Personal Details
                </ThemedText>
                <TouchableOpacity onPress={noop}>
                    <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>Edit</ThemedText>
                </TouchableOpacity>
            </View>

            {details.length > 0 ? (
                <>
                    {user.full_body_image_url && (
                        <View style={styles.fullBodyContainer}>
                            <Image source={{ uri: user.full_body_image_url }} style={styles.fullBodyImage} />
                            <ThemedText style={[styles.fullBodyLabel, { color: colors.tabIconDefault }]}>Full Body Photo</ThemedText>
                        </View>
                    )}

                    <View style={styles.detailsGrid}>
                        {details.map((detail) => (
                            <View key={detail.label} style={[styles.detailCard, { backgroundColor: colors.background }]}>
                                <IconSymbol name={detail.icon} size={24} color={colors.tint} />
                                <ThemedText style={[styles.detailCardValue, { color: colors.text }]}>{detail.value}</ThemedText>
                                <ThemedText style={[styles.detailCardLabel, { color: colors.tabIconDefault }]}>{detail.label}</ThemedText>
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <IconSymbol name="person.circle" size={48} color={colors.tabIconDefault} />
                    <ThemedText style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
                        No personal details added yet
                    </ThemedText>
                    <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: colors.tint }]} onPress={noop}>
                        <ThemedText style={styles.emptyStateButtonText}>Add Details</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const StyleInsightsSection: FC<{ colors: ColorScheme }> = ({ colors }) => (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
        <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Style Insights
            </ThemedText>
            <TouchableOpacity onPress={noop}>
                <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>View All</ThemedText>
            </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightsScroll}>
            {MOCK_STYLE_INSIGHTS.map((insight) => (
                <View key={insight.id} style={[styles.insightCard, { backgroundColor: colors.background }]}>
                    <View style={styles.insightHeader}>
                        <IconSymbol
                            name={insight.icon}
                            size={20}
                            color={insight.trend === 'up' ? '#4CAF50' : insight.trend === 'down' ? '#FF5722' : colors.tint}
                        />
                        <ThemedText style={[styles.insightValue, { color: colors.tint }]}>{insight.value}</ThemedText>
                    </View>
                    <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
                    <ThemedText style={[styles.insightDescription, { color: colors.tabIconDefault }]}>{insight.description}</ThemedText>
                </View>
            ))}
        </ScrollView>
    </View>
);

const FashionStatsSection: FC<{ colors: ColorScheme; stats: FashionStats }> = ({ colors, stats }) => (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
            Fashion Analytics
        </ThemedText>

        <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.statNumber, { color: colors.tint }]}>{stats.totalOutfits}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                    Total Outfits
                </ThemedText>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.statNumber, { color: colors.tint }]}>{stats.styleScore}%</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>Style Score</ThemedText>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.statNumber, { color: colors.tint }]}>{stats.sustainabilityScore}%</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                    Sustainability
                </ThemedText>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.statNumber, { color: colors.tint }]}>{stats.itemsAddedThisMonth}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                    Items Added This Month
                </ThemedText>
            </View>
        </View>

        <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
                <IconSymbol name="paintpalette" size={16} color={colors.tint} />
                <ThemedText style={[styles.quickStatText, { color: colors.text }]}>
                    Favorite Color: {stats.favoriteColor}
                </ThemedText>
            </View>
            <View style={styles.quickStatItem}>
                <IconSymbol name="star.fill" size={16} color={colors.tint} />
                <ThemedText style={[styles.quickStatText, { color: colors.text }]}>
                    Most Worn: {stats.mostWornItem}
                </ThemedText>
            </View>
        </View>
    </View>
);

const OutfitHistorySection: FC<{ colors: ColorScheme }> = ({ colors }) => (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
        <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recent Outfits
            </ThemedText>
            <TouchableOpacity onPress={noop}>
                <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>View All</ThemedText>
            </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outfitScroll}>
            {MOCK_OUTFIT_HISTORY.map((outfit) => (
                <TouchableOpacity key={outfit.id} style={[styles.outfitCard, { backgroundColor: colors.background }]}>
                    <Image source={{ uri: outfit.imageUrl }} style={styles.outfitImage} />
                    <View style={styles.outfitInfo}>
                        <ThemedText style={styles.outfitDate}>{outfit.date}</ThemedText>
                        <ThemedText style={[styles.outfitOccasion, { color: colors.tabIconDefault }]}>{outfit.occasion}</ThemedText>
                        <View style={styles.outfitRating}>
                            <IconSymbol name="star.fill" size={12} color="#FFD700" />
                            <ThemedText style={styles.ratingText}>{outfit.rating}</ThemedText>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

const AchievementsSection: FC<{ colors: ColorScheme }> = ({ colors }) => (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
            Achievements
        </ThemedText>

        <View style={styles.achievementsGrid}>
            {MOCK_ACHIEVEMENTS.map((achievement) => (
                <TouchableOpacity
                    key={achievement.id}
                    style={[
                        styles.achievementCard,
                        { backgroundColor: colors.background, opacity: achievement.unlocked ? 1 : 0.6 },
                    ]}
                >
                    <View
                        style={[
                            styles.achievementIcon,
                            { backgroundColor: achievement.unlocked ? colors.tint : colors.tabIconDefault },
                        ]}
                    >
                        <IconSymbol name={achievement.icon} size={24} color="white" />
                    </View>
                    <View style={styles.achievementInfo}>
                        <ThemedText
                            style={[
                                styles.achievementTitle,
                                { color: achievement.unlocked ? colors.text : colors.tabIconDefault },
                            ]}
                        >
                            {achievement.title}
                        </ThemedText>
                        <ThemedText style={[styles.achievementDescription, { color: colors.tabIconDefault }]}>
                            {achievement.description}
                        </ThemedText>
                        {!achievement.unlocked && achievement.progress && achievement.maxProgress && (
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                                            backgroundColor: colors.tint,
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const PreferencesSection: FC<{
    preferences: Preferences;
    colors: ColorScheme;
    accountMode: 'individual' | 'boutique';
    onSwitchToBoutique: () => void;
}> = ({
    preferences,
    colors,
    accountMode,
    onSwitchToBoutique,
}) => (
        <View style={[styles.section, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

            <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                    <Text style={[styles.preferenceTitle, { color: colors.text }]}>Account Mode</Text>
                    <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
                        Switch between Individual and Boutique modes
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: colors.tint }]}
                    onPress={onSwitchToBoutique}
                >
                    <Text style={styles.toggleButtonText}>
                        {accountMode === 'individual' ? 'Individual' : 'Boutique'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                    <Text style={[styles.preferenceTitle, { color: colors.text }]}>Background Processing</Text>
                    <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
                        {preferences.backgroundPreference === 'clean' ? 'Clean background (studio look)' : 'Keep original background'}
                    </Text>
                </View>
                <TouchableOpacity style={[styles.toggleButton, { backgroundColor: colors.tint }]} onPress={noop}>
                    <Text style={styles.toggleButtonText}>
                        {preferences.backgroundPreference === 'clean' ? 'Clean' : 'Original'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                    <Text style={[styles.preferenceTitle, { color: colors.text }]}>Notifications</Text>
                    <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
                        Get notified about new recommendations and features
                    </Text>
                </View>
                <Switch
                    value={preferences.notifications}
                    onValueChange={noop}
                    trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
                    thumbColor="white"
                />
            </View>

            <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                    <Text style={[styles.preferenceTitle, { color: colors.text }]}>Favorite Styles</Text>
                    <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
                        {preferences.favoriteStyles.join(', ')}
                    </Text>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={noop}>
                    <IconSymbol name="pencil" size={20} color={colors.tint} />
                </TouchableOpacity>
            </View>
        </View>
    );

const SettingsSection: FC<{
    colors: ColorScheme;
    onSignOut: () => void;
    isSigningOut: boolean;
    onSwitchToBoutique: () => void;
}> = ({
    colors,
    onSignOut,
    isSigningOut,
    onSwitchToBoutique,
}) => (
        <View style={[styles.section, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

            <TouchableOpacity
                style={[styles.settingItem, { borderTopWidth: 0 }]}
                onPress={() => {
                    console.log('=== SWITCH TO BOUTIQUE BUTTON PRESSED ===');
                    Alert.alert('Debug', `Handler exists: ${!!onSwitchToBoutique}`);
                    if (onSwitchToBoutique) {
                        console.log('Calling onSwitchToBoutique...');
                        onSwitchToBoutique();
                    } else {
                        console.error('onSwitchToBoutique is undefined!');
                        Alert.alert('Error', 'Handler not found');
                    }
                }}
                activeOpacity={0.7}
            >
                <IconSymbol name="building.2.fill" size={20} color={colors.tint} />
                <Text style={[styles.settingText, { color: colors.text }]}>Switch to Boutique Mode</Text>
                <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.settingItem}
                onPress={() => {
                    console.log('Complete Profile button pressed - TEST');
                    Alert.alert('Test', 'Complete Profile button works!');
                }}
            >
                <IconSymbol name="person.text.rectangle" size={20} color={colors.tint} />
                <Text style={[styles.settingText, { color: colors.text }]}>Complete Profile</Text>
                <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={noop}>
                <IconSymbol name="lock" size={20} color={colors.tint} />
                <Text style={[styles.settingText, { color: colors.text }]}>Privacy & Security</Text>
                <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={noop}>
                <IconSymbol name="questionmark.circle" size={20} color={colors.tint} />
                <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
                <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={noop}>
                <IconSymbol name="info.circle" size={20} color={colors.tint} />
                <Text style={[styles.settingText, { color: colors.text }]}>About TryRack</Text>
                <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.logoutButton,
                    { backgroundColor: '#FF3B30' },
                    isSigningOut && styles.logoutButtonDisabled
                ]}
                onPress={onSignOut}
                disabled={isSigningOut}
            >
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="white" />
                <Text style={styles.logoutText}>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</Text>
            </TouchableOpacity>
        </View>
    );

export default function ProfileScreen() {
    const { mutateAsync: signoutMutation, isPending: isSigningOut } = useSignout();

    const handleSwitchToBoutique = () => {
        console.log('handleSwitchToBoutique called');

        // Use setTimeout to ensure Alert is shown after current execution context
        setTimeout(() => {
            Alert.alert(
                'Switch to Boutique Mode',
                'Switch to boutique mode? You can always switch back in settings.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => console.log('Cancelled mode switch')
                    },
                    {
                        text: 'Switch',
                        onPress: async () => {
                            console.log('Switching to boutique mode...');
                            try {
                                // await setUserType('boutique');
                                console.log('User type set, navigating...');
                                router.replace('/(boutique_tabs)/dashboard');
                            } catch (error) {
                                console.error('Error switching mode:', error);
                                Alert.alert('Error', 'Failed to switch mode. Please try again.');
                            }
                        },
                    },
                ]
            );
        }, 100);
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signoutMutation();
                            // Navigate to sign in screen after successful logout
                            router.replace('/auth/signin');
                        } catch (error) {
                            Alert.alert(
                                'Error',
                                error instanceof Error
                                    ? error.message
                                    : 'Failed to sign out. Please try again.',
                                [{ text: 'OK' }]
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <ProfileSection user={MOCK_USER} colors={themeColors} />
                <PersonalDetailsSection user={MOCK_USER} colors={themeColors} />
                <StyleInsightsSection colors={themeColors} />
                <FashionStatsSection colors={themeColors} stats={MOCK_FASHION_STATS} />
                <OutfitHistorySection colors={themeColors} />
                <AchievementsSection colors={themeColors} />
                <PreferencesSection
                    preferences={MOCK_PREFERENCES}
                    colors={themeColors}
                    accountMode="individual"
                    onSwitchToBoutique={handleSwitchToBoutique}
                />
                <SettingsSection
                    colors={themeColors}
                    onSignOut={handleSignOut}
                    isSigningOut={isSigningOut}
                    onSwitchToBoutique={handleSwitchToBoutique}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    detailCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.2)',
    },
    detailCardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    detailCardLabel: {
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        marginTop: 12,
        marginBottom: 8,
        fontSize: 14,
    },
    emptyStateButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    emptyStateButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    fullBodyContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    fullBodyImage: {
        width: 150,
        height: 200,
        borderRadius: 12,
        marginBottom: 8,
    },
    fullBodyLabel: {
        fontSize: 12,
    },
    insightsScroll: {
        paddingRight: 20,
    },
    insightCard: {
        width: 160,
        marginRight: 12,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    insightValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    insightDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        width: '48%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        textAlign: 'center',
    },
    quickStats: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E7',
    },
    quickStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickStatText: {
        fontSize: 14,
        marginLeft: 8,
    },
    outfitScroll: {
        paddingRight: 20,
    },
    outfitCard: {
        width: 140,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    outfitImage: {
        width: '100%',
        height: 100,
    },
    outfitInfo: {
        padding: 12,
    },
    outfitDate: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    outfitOccasion: {
        fontSize: 11,
        marginBottom: 6,
    },
    outfitRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    achievementCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#E5E5E7',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E7',
    },
    preferenceInfo: {
        flex: 1,
        marginRight: 16,
    },
    preferenceTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    preferenceDescription: {
        fontSize: 14,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    toggleButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    editButton: {
        padding: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E7',
    },
    settingText: {
        fontSize: 16,
        marginLeft: 12,
        flex: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
