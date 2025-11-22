import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';

import { FormInput, PrimaryButton } from '@/components/auth/FormComponents';
import type { ResetPasswordRequest } from '@/api/auth/reset-password/types';
import { ResetPasswordRequestSchema } from '@/api/auth/reset-password/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';


/**
 * Reset Password Screen Component
 * Allows users to set a new password after following a password reset link
 *
 * @see https://react-hook-form.com/ - Form validation library
 * @see https://docs.expo.dev/router/ - Expo Router navigation
 */
export default function ResetPasswordScreen() {
    const params = useLocalSearchParams<{ token?: string }>();

    const resetToken = useMemo(() => {
        const tokenParam = params.token;
        return typeof tokenParam === 'string' ? tokenParam : '';
    }, [params.token]);


    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<ResetPasswordRequest>({
        resolver: zodResolver(ResetPasswordRequestSchema),
        defaultValues: {
            token: resetToken,
            new_password: '',
            confirm_new_password: '',
        },
    });

    /**
     * Handle password reset submission
     * Sends new password and token to backend
     */
    // const onSubmit = async (data: ResetPasswordFormData) => {
    //   try {
    //     const result = await resetPassword(data);
    //     if (result.success) {
    //       router.replace('/auth/signin');
    //     } else {
    //       setError('root', {
    //         type: 'manual',
    //         message: result.error || 'Reset password failed',
    //       });
    //     }
    //   } catch (error) {
    //     console.error('Reset password error:', error);
    //     setError('root', {
    //       type: 'manual',
    //       message: 'An unexpected error occurred',
    //     });
    //   }
    // };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>TryRack</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>Update your password</Text>
                    <Text style={styles.subtitle}>
                        Set your new password with minimum 8 characters with a combination of letters and numbers
                    </Text>

                    <View style={styles.form}>
                        <Controller
                            control={control}
                            name="new_password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormInput
                                    label="New Password"
                                    placeholder="Enter new password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.new_password?.message}
                                    isPassword
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="confirm_new_password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormInput
                                    label="Confirm Password"
                                    placeholder="Re-enter new password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.confirm_new_password?.message}
                                    isPassword
                                />
                            )}
                        />

                        {/* Hidden token field to keep token in form state */}
                        <Controller
                            control={control}
                            name="token"
                            render={({ field: { value } }) => (
                                <Text style={styles.tokenHelper} accessibilityLabel="Reset token">
                                    {value
                                        ? 'Reset link verified'
                                        : 'Reset token missing. Please open the password reset link again.'}
                                </Text>
                            )}
                        />

                        {errors.root && <Text style={styles.errorText}>{errors.root.message}</Text>}

                        <PrimaryButton
                            title="Update password"
                            onPress={() => { }}
                        // onPress={handleSubmit(onSubmit)}
                        // loading={isLoading}
                        // disabled={isLoading}
                        />

                        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/auth/signin')}>
                            <Text style={styles.backButtonText}>Back to Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#D4AF37',
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: '30%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    form: {
        width: '100%',
    },
    tokenHelper: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 16,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 14,
        color: '#D4AF37',
        fontWeight: '500',
    },
});


