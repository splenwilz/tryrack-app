import { View, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ProfileImageUploadProps = {
    type: 'profile' | 'fullBody';
    imageUri?: string;
    isUploading: boolean;
    onPress: () => void;
    tintColor: string;
    iconColor: string;
};

/**
 * Profile Image Upload Component
 * 
 * Handles display and upload of profile or full-body images
 * 
 * @see https://reactnative.dev/docs/image - React Native Image component
 */
export function ProfileImageUpload({
    type,
    imageUri,
    isUploading,
    onPress,
    tintColor,
    iconColor,
}: ProfileImageUploadProps) {
    const isProfile = type === 'profile';

    return (
        <TouchableOpacity
            style={isProfile ? styles.imageContainer : styles.fullBodyImageContainer}
            onPress={onPress}
            disabled={isUploading}
            activeOpacity={0.7}
        >
            {isUploading ? (
                <View style={[isProfile ? styles.imagePlaceholder : styles.fullBodyImagePlaceholder, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <ThemedText style={[styles.placeholderText, { color: iconColor, marginTop: 8 }]}>
                        Processing...
                    </ThemedText>
                </View>
            ) : imageUri ? (
                <Image source={{ uri: imageUri }} style={isProfile ? styles.profileImage : styles.fullBodyImage} />
            ) : (
                <View style={isProfile ? styles.imagePlaceholder : styles.fullBodyImagePlaceholder}>
                    <IconSymbol name="camera.fill" size={40} color={iconColor} />
                    <ThemedText style={[styles.placeholderText, { color: iconColor }]}>
                        {isProfile ? 'Tap to add photo' : 'Tap to add full-body photo'}
                    </ThemedText>
                    {!isProfile && (
                        <ThemedText style={[styles.placeholderHint, { color: iconColor }]}>
                            Stand straight, full view
                        </ThemedText>
                    )}
                </View>
            )}
            {!isUploading && imageUri && (
                <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
                    <IconSymbol name="pencil" size={16} color="white" />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    fullBodyImageContainer: {
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    fullBodyImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    fullBodyImagePlaceholder: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 12,
    },
    placeholderHint: {
        marginTop: 4,
        fontSize: 11,
        opacity: 0.6,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

