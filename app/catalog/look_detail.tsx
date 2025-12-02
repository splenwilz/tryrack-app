/**
 * Look Detail Screen
 * View a single look with full details and actions
 *
 * @see app/wardrobe/item_detail.tsx - Similar pattern for wardrobe items
 */

import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/custom-header';
import { useLook, useDeleteLook } from '@/api/looks/queries';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export default function LookDetailScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { lookId } = useLocalSearchParams<{ lookId: string }>();

    const { data: look, isLoading, error } = useLook(lookId || null);
    const deleteLookMutation = useDeleteLook();
    const [isSharing, setIsSharing] = React.useState(false);

    const handleBackPress = () => {
        router.back();
    };

    const ensureLocalImageUri = async (imageUrl: string): Promise<string> => {
        // If it's already a local file, return it
        if (imageUrl.startsWith('file://')) {
            return imageUrl;
        }

        // Download the image to a local file
        const filename = `look-${look?.id || Date.now()}-${Date.now()}.jpg`;
        const downloadResult = await FileSystem.downloadAsync(
            imageUrl,
            `${FileSystem.cacheDirectory}${filename}`
        );

        return downloadResult.uri;
    };

    const handleShare = async () => {
        if (!look || isSharing) {
            return;
        }

        setIsSharing(true);
        try {
            // Calculate total price
            const products = look.products || [];
            const totalPrice = look.total_price ?? products.reduce((sum, p) => sum + (p.discount_price || p.price), 0);

            // Create share message with look details
            const productsList = products.map((p) => `• ${p.name} (${p.category})`).join('\n') || 'No products';
            const shareMessage = `Check out this ${look.style} look: ${look.title}\n\n${look.description || ''}\n\nProducts:\n${productsList}\n\nTotal Price: ₦${totalPrice.toLocaleString()}`;

            // Share image if available, otherwise share text
            if (look.image_url) {
                try {
                    // Download image to local file
                    const localImageUri = await ensureLocalImageUri(look.image_url);

                    // Check if sharing is available
                    if (await Sharing.isAvailableAsync()) {
                        // Share the image file
                        await Sharing.shareAsync(localImageUri, {
                            mimeType: 'image/jpeg',
                            dialogTitle: `Share ${look.title}`,
                        });
                    } else {
                        // Fallback to React Native Share with image
                        await Share.share({
                            url: localImageUri,
                            message: shareMessage,
                            title: look.title,
                        });
                    }
                } catch (imageError) {
                    console.error('[Look Detail] Image share error:', imageError);
                    // Fallback to text-only sharing if image sharing fails
                    await Share.share({
                        message: shareMessage,
                        title: look.title,
                    });
                }
            } else {
                // Text-only sharing if no image
                await Share.share({
                    message: shareMessage,
                    title: look.title,
                });
            }
        } catch (error) {
            console.error('[Look Detail] Share error:', error);
            Alert.alert(
                'Share Failed',
                error instanceof Error ? error.message : 'Unable to share the look. Please try again.'
            );
        } finally {
            setIsSharing(false);
        }
    };

    const handleEdit = () => {
        if (!look) return;
        router.push({
            pathname: '/(boutique_tabs)/catalog',
            params: {
                editLookId: String(look.id),
                activeSection: 'looks',
            },
        });
    };

    const handleDelete = () => {
        if (!look) return;
        Alert.alert(
            'Delete Look',
            'Are you sure you want to delete this look?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLookMutation.mutateAsync(String(look.id));
                            Alert.alert('Success', 'Look deleted successfully!');
                            router.back();
                        } catch {
                            Alert.alert('Error', 'Failed to delete look. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader title="Look Details" showBackButton onBackPress={handleBackPress} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <ThemedText style={styles.loadingText}>Loading look...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !look) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader title="Look Details" showBackButton onBackPress={handleBackPress} />
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Failed to load look.</ThemedText>
                    <ThemedText style={[styles.errorSubtext, { color: iconColor }]}>
                        {error instanceof Error ? error.message : 'Unknown error'}
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    const products = look.products || [];
    const totalPrice = look.total_price ?? products.reduce((sum, p) => sum + (p.discount_price || p.price), 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <View style={[styles.header, { backgroundColor }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                >
                    <IconSymbol
                        name="chevron.right"
                        size={24}
                        color={iconColor}
                        style={{ transform: [{ rotate: '180deg' }] }}
                    />
                    <ThemedText type="title" style={styles.headerTitle}>
                        Look Details
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    disabled={isSharing || !look}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                >
                    {isSharing ? (
                        <ActivityIndicator size="small" color={tintColor} />
                    ) : (
                        <IconSymbol name="square.and.arrow.up" size={24} color={tintColor} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Look Image */}
                <View style={styles.imageContainer}>
                    {look.image_url ? (
                        <Image source={{ uri: look.image_url }} style={styles.lookImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: iconColor + '20' }]}>
                            <IconSymbol name="photo" size={64} color={iconColor} />
                            <ThemedText style={[styles.placeholderText, { color: iconColor }]}>
                                No image available
                            </ThemedText>
                        </View>
                    )}
                    {look.is_featured && (
                        <View style={[styles.featuredBadge, { backgroundColor: tintColor }]}>
                            <IconSymbol name="star.fill" size={14} color={isDark ? '#000' : 'white'} />
                            <ThemedText style={[styles.featuredText, { color: isDark ? '#000' : 'white' }]}>
                                Featured
                            </ThemedText>
                        </View>
                    )}
                    <View style={[styles.styleBadge, { backgroundColor: tintColor, opacity: 0.9 }]}>
                        <ThemedText style={[styles.styleText, { color: isDark ? '#000' : 'white' }]}>
                            {look.style}
                        </ThemedText>
                    </View>
                </View>

                {/* Look Info */}
                <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                    <ThemedText type="title" style={styles.title}>
                        {look.title}
                    </ThemedText>
                    {look.description && (
                        <ThemedText style={[styles.description, { color: iconColor }]}>
                            {look.description}
                        </ThemedText>
                    )}

                    <View style={styles.priceRow}>
                        <ThemedText style={styles.priceLabel}>Total Price:</ThemedText>
                        <ThemedText style={[styles.priceValue, { color: tintColor }]}>
                            ₦{totalPrice.toLocaleString()}
                        </ThemedText>
                    </View>

                    <View style={styles.itemsRow}>
                        <IconSymbol name="tshirt.fill" size={16} color={iconColor} />
                        <ThemedText style={[styles.itemsText, { color: iconColor }]}>
                            {products.length} {products.length === 1 ? 'item' : 'items'} in this look
                        </ThemedText>
                    </View>
                </View>

                {/* Products in Look */}
                {products.length > 0 && (
                    <View style={[styles.productsCard, { backgroundColor: cardBg }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Products in This Look
                        </ThemedText>
                        {products.map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={[styles.productItem, { borderColor: iconColor + '20' }]}
                                onPress={() => {
                                    router.push({
                                        pathname: '/catalog/product_detail',
                                        params: { productId: String(product.id) },
                                    });
                                }}
                            >
                                <Image
                                    source={{ uri: product.image_url }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.productInfo}>
                                    <ThemedText style={styles.productName}>{product.name}</ThemedText>
                                    <ThemedText style={[styles.productCategory, { color: iconColor }]}>
                                        {product.category}
                                    </ThemedText>
                                    <ThemedText style={[styles.productPrice, { color: tintColor }]}>
                                        ₦{(product.discount_price || product.price).toLocaleString()}
                                    </ThemedText>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color={iconColor} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.shareActionButton, { borderColor: tintColor }]}
                        onPress={handleShare}
                        disabled={isSharing || !look}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color={tintColor} />
                        ) : (
                            <IconSymbol name="square.and.arrow.up" size={18} color={tintColor} />
                        )}
                        <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
                            {isSharing ? 'Sharing...' : 'Share Look'}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton, { backgroundColor: tintColor }]}
                        onPress={handleEdit}
                    >
                        <IconSymbol name="pencil" size={18} color={isDark ? '#000' : 'white'} />
                        <ThemedText style={[styles.actionButtonText, { color: isDark ? '#000' : 'white' }]}>
                            Edit Look
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton, { borderColor: '#FF3B30' }]}
                        onPress={handleDelete}
                        disabled={deleteLookMutation.isPending}
                    >
                        {deleteLookMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FF3B30" />
                        ) : (
                            <IconSymbol name="trash" size={18} color="#FF3B30" />
                        )}
                        <ThemedText style={[styles.actionButtonText, { color: '#FF3B30' }]}>
                            {deleteLookMutation.isPending ? 'Deleting...' : 'Delete Look'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    shareButton: {
        padding: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        opacity: 0.7,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 8,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
    },
    errorSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 400,
        position: 'relative',
    },
    lookImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    placeholderText: {
        fontSize: 16,
    },
    featuredBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
    },
    featuredText: {
        fontSize: 12,
        fontWeight: '600',
    },
    styleBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        zIndex: 10,
    },
    styleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    infoCard: {
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    priceLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    itemsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemsText: {
        fontSize: 14,
    },
    productsCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
        gap: 12,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 14,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionsContainer: {
        margin: 20,
        marginBottom: 40,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    shareActionButton: {
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    editButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deleteButton: {
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

