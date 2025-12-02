import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useState } from 'react';

/**
 * Onboarding Screen - User Type Selection
 * Allows users to choose between Individual (personal use) or Boutique (business) accounts
 * Based on blueprint requirements for role-based access and different user experiences
 * 
 * TODO: Implement user type selection logic and navigation
 */
export default function OnboardingScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');

    const [selectedType, setSelectedType] = useState<'individual' | 'boutique' | null>(null);

    const handleSelectType = (type: 'individual' | 'boutique') => {
        // TODO: Persist the user type
        setSelectedType(type);
        // Navigate to next step or save selection
        if (type === 'individual') {
            router.push('/onboarding/profile-completion');
        } else {
            router.push('/onboarding/boutique-profile');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        Welcome to TryRack
                    </ThemedText>
                    <ThemedText style={[styles.subtitle, { color: iconColor }]}>
                        Choose how you&apos;d like to use the app
                    </ThemedText>
                </View>

                {/* User Type Selection Cards */}
                <View style={styles.selectionContainer}>
                    {/* Individual User Card */}
                    <TouchableOpacity
                        style={[styles.userTypeCard, { backgroundColor }]}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => handleSelectType('individual')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: tintColor }]}>
                            <IconSymbol name="person.fill" size={32} color="white" />
                        </View>
                        <ThemedText type="subtitle" style={styles.cardTitle}>
                            Individual
                        </ThemedText>
                        <ThemedText style={[styles.cardDescription, { color: iconColor }]}>
                            Personal wardrobe management and virtual try-on
                        </ThemedText>
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Upload your clothes</ThemedText>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Virtual try-on</ThemedText>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Outfit recommendations</ThemedText>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Shop from boutiques</ThemedText>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Boutique User Card */}
                    <TouchableOpacity
                        style={[styles.userTypeCard, { backgroundColor }]}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => handleSelectType('boutique')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: tintColor }]}>
                            <IconSymbol name="bag.fill" size={32} color="white" />
                        </View>
                        <ThemedText type="subtitle" style={styles.cardTitle}>
                            Boutique
                        </ThemedText>
                        <ThemedText style={[styles.cardDescription, { color: iconColor }]}>
                            Sell your fashion items and reach customers
                        </ThemedText>
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Upload product catalog</ThemedText>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Customer virtual try-on</ThemedText>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Sales analytics</ThemedText>
                            </View>
                            <View style={styles.featureItem}>
                                <IconSymbol name="plus" size={12} color={tintColor} />
                                <ThemedText style={styles.featureText}>Order management</ThemedText>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <ThemedText style={[styles.footerText, { color: iconColor }]}>
                        No worries! You can have both account types and switch between them anytime in settings
                    </ThemedText>

                    {/* Development Reset Button */}
                    {/* <TouchableOpacity
                        style={[styles.devResetButton, { borderColor: iconColor }]}
                        activeOpacity={0.7}
                    >
                        <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color={iconColor} />
                        <ThemedText style={[styles.devResetText, { color: iconColor }]}>
                            Development Reset
                        </ThemedText>
                    </TouchableOpacity> */}
                </View>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
    selectionContainer: {
        gap: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    userTypeCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    featuresList: {
        width: '100%',
        gap: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 14,
        opacity: 0.8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 16,
    },
    devResetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    devResetText: {
        fontSize: 12,
        fontWeight: '500',
    },
});