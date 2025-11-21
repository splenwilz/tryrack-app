/**
 * Wardrobe Skeleton Components
 * Loading placeholders for wardrobe screen content
 * 
 * @see https://reactnative.dev/docs/components - React Native component patterns
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Skeleton for featured wardrobe item card
 */
export const FeaturedItemSkeleton: React.FC = () => {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <View style={[styles.featuredCard, { backgroundColor }]}>
            <ShimmerPlaceholder width="100%" height={200} borderRadius={0} />
            <View style={styles.featuredContent}>
                <ShimmerPlaceholder width="60%" height={20} borderRadius={4} />
                <View style={{ height: 8 }} />
                <ShimmerPlaceholder width="80%" height={16} borderRadius={4} />
                <View style={{ height: 12 }} />
                <View style={styles.tagsContainer}>
                    <ShimmerPlaceholder width={60} height={28} borderRadius={12} />
                    <View style={{ width: 8 }} />
                    <ShimmerPlaceholder width={70} height={28} borderRadius={12} />
                    <View style={{ width: 8 }} />
                    <ShimmerPlaceholder width={65} height={28} borderRadius={12} />
                </View>
            </View>
        </View>
    );
};

/**
 * Skeleton for wardrobe item card (used in carousels)
 */
export const WardrobeItemCardSkeleton: React.FC = () => {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <View style={[styles.itemCard, { backgroundColor }]}>
            <ShimmerPlaceholder width="100%" height={140} borderRadius={0} />
            <View style={styles.itemDetails}>
                <ShimmerPlaceholder width="90%" height={16} borderRadius={4} />
                <View style={{ height: 8 }} />
                <ShimmerPlaceholder width="60%" height={12} borderRadius={4} />
                <View style={{ height: 8 }} />
                <View style={styles.tagsContainer}>
                    <ShimmerPlaceholder width={50} height={20} borderRadius={8} />
                    <View style={{ width: 4 }} />
                    <ShimmerPlaceholder width={55} height={20} borderRadius={8} />
                </View>
            </View>
        </View>
    );
};

/**
 * Skeleton for wardrobe carousel section
 */
export const WardrobeCarouselSkeleton: React.FC<{ title?: string }> = ({ title }) => {
    return (
        <View style={styles.carouselContainer}>
            {title && (
                <View style={styles.carouselHeader}>
                    <ShimmerPlaceholder width={150} height={20} borderRadius={4} />
                    <ShimmerPlaceholder width={70} height={16} borderRadius={4} />
                </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
                <WardrobeItemCardSkeleton />
                <WardrobeItemCardSkeleton />
                <WardrobeItemCardSkeleton />
                <WardrobeItemCardSkeleton />
            </ScrollView>
        </View>
    );
};

/**
 * Skeleton for status grid item (worn/dirty items)
 */
export const StatusGridItemSkeleton: React.FC = () => {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <View style={[styles.statusCard, { backgroundColor }]}>
            <ShimmerPlaceholder width="100%" height={120} borderRadius={0} />
            <View style={styles.statusCardInfo}>
                <ShimmerPlaceholder width="85%" height={14} borderRadius={4} />
                <View style={{ height: 8 }} />
                <ShimmerPlaceholder width="60%" height={12} borderRadius={4} />
                <View style={{ height: 12 }} />
                <ShimmerPlaceholder width="100%" height={28} borderRadius={6} />
            </View>
        </View>
    );
};

/**
 * Skeleton for status grid section
 */
export const StatusGridSkeleton: React.FC<{ title?: string; subtitle?: string }> = ({ title, subtitle }) => {
    return (
        <View style={styles.statusSection}>
            {title && <ShimmerPlaceholder width={120} height={20} borderRadius={4} style={{ marginBottom: 8 }} />}
            {subtitle && <ShimmerPlaceholder width="80%" height={14} borderRadius={4} style={{ marginBottom: 16 }} />}
            <View style={styles.statusGrid}>
                <StatusGridItemSkeleton />
                <StatusGridItemSkeleton />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    featuredCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featuredContent: {
        padding: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    itemCard: {
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
    itemDetails: {
        padding: 12,
    },
    carouselContainer: {
        marginBottom: 32,
    },
    carouselHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    carouselContent: {
        paddingRight: 20,
    },
    statusSection: {
        marginTop: 32,
        marginBottom: 20,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statusCard: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusCardInfo: {
        padding: 12,
    },
});

