import { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { FormInput, PrimaryButton } from '@/components/auth/FormComponents';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VerifyEmailRequestSchema, type VerifyEmailRequest } from '@/api/auth/verify-email/types';
import { useVerifyEmail } from '@/api/auth/verify-email/queries';
import type { AuthResponse } from '@/api/auth/types';
import { ApiError, saveTokens, saveUser, getPendingPassword, clearPendingPassword } from '@/api/client';
import { useSignin } from '@/api/auth/signin/queries';

export default function EmailVerificationScreen() {
    const { mutateAsync: verifyEmailMutation, isPending: isVerifyEmailPending } = useVerifyEmail();
    const { mutateAsync: signinMutation } = useSignin();
    const [routeError, setRouteError] = useState<string | null>(null);
    //   const { verifyEmail, isLoading } = useAuth();

    // Get email and pending token from route params (passed from sign-up)
    // Note: Password is NOT passed through params for security reasons
    const params = useLocalSearchParams<{
        email?: string | string[];
        pending_authentication_token?: string | string[];
    }>();

    const emailParam = useMemo(
        () => (typeof params.email === 'string' ? params.email : ''),
        [params.email]
    );
    const pendingTokenParam = useMemo(
        () => (typeof params.pending_authentication_token === 'string' ? params.pending_authentication_token : ''),
        [params.pending_authentication_token]
    );
    const [pendingToken, setPendingToken] = useState(pendingTokenParam);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
        setValue,
    } = useForm<VerifyEmailRequest>({
        resolver: zodResolver(VerifyEmailRequestSchema),
        defaultValues: {
            code: '',
            pending_authentication_token: pendingTokenParam,
        },
    });

    useEffect(() => {
        setPendingToken(pendingTokenParam);
    }, [pendingTokenParam]);

    useEffect(() => {
        setValue('pending_authentication_token', pendingToken);
    }, [pendingToken, setValue]);

    useEffect(() => {
        if (!emailParam || !pendingToken) {
            const message = 'Missing verification data. Please restart sign up or resend the code.';
            setRouteError(message);
            setError('root', {
                type: 'manual',
                message,
            });
        } else {
            setRouteError(null);
            clearErrors('root');
        }
    }, [clearErrors, emailParam, pendingToken, setError]);

    /**
     * Handle verification code submission
     * Verifies the code with WorkOS and completes authentication
     * 
     * @param data - Form data containing verification code
     */
    //   const onSubmit = async (data: EmailVerificationFormData) => {
    //     try {
    //       if (!pendingToken) {
    //         setError('root', {
    //           type: 'manual',
    //           message: 'Missing verification token. Please try signing up again.',
    //         });
    //         return;
    //       }

    //       const result = await verifyEmail(pendingToken, data.code);

    //       if (result.success) {
    //         // Navigate to main app on successful verification
    //         router.replace('/(tabs)');
    //       } else {
    //         setError('root', {
    //           type: 'manual',
    //           message: result.error || 'Verification failed',
    //         });
    //       }
    //     } catch (error) {
    //       console.error('Email verification error:', error);
    //       setError('root', {
    //         type: 'manual',
    //         message: 'An unexpected error occurred',
    //       });
    //     }
    //   };

    /**
     * Handle resend verification code
     * Uses stored password from SecureStore to resend verification code
     */
    const onResendCode = async () => {
        try {
            const storedPassword = await getPendingPassword();
            
            if (!storedPassword || !emailParam) {
                // Clear password before navigating away
                await clearPendingPassword();
                Alert.alert(
                    'Unable to Resend',
                    'Please return to the sign in screen and sign in again to resend the verification code.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Go to Sign In',
                            onPress: () => {
                                router.replace('/auth/signin');
                            },
                        },
                    ]
                );
            return;
        }

            // Resend code by signing in again with stored password
            const response = await signinMutation({
                email: emailParam,
                password: storedPassword,
            });

            if ('requires_verification' in response) {
                // Update pending token if it changed
                setPendingToken(response.pending_authentication_token);
                setValue('pending_authentication_token', response.pending_authentication_token);
                
                Alert.alert(
                    'Code Resent',
                    'A new verification code has been sent to your email address.',
                    [{ text: 'OK' }]
                );
            } else {
                // User is already verified, redirect to app
            const authResponse = response as AuthResponse;
            await saveTokens(authResponse.access_token, authResponse.refresh_token);
            await saveUser(authResponse.user);
                await clearPendingPassword();
            router.replace('/(tabs)');
            }
        } catch (error) {
            // Clear password on error to prevent credential exposure
            await clearPendingPassword();
            const message =
                error instanceof ApiError
                    ? error.message
                    : error instanceof Error
                    ? error.message
                    : 'Failed to resend verification code. Please try again.';
            
            Alert.alert('Error', message, [{ text: 'OK' }]);
        }
    };

    /**
     * Navigate back to sign up screen
     * Clears pending password before navigation to prevent credential exposure
     */
    const goBackToSignUp = async () => {
        await clearPendingPassword();
        router.back();
    };



    const onSubmit = async (data: VerifyEmailRequest) => {
        if (routeError) {
            setError('root', {
                type: 'manual',
                message: routeError,
            });
            return;
        }

        try {
            const response = await verifyEmailMutation({
                ...data,
                pending_authentication_token: pendingToken,
            });

            if (!response.user.email_verified) {
                // Don't clear password here - user might want to resend
                setError('root', {
                    type: 'manual',
                    message: 'Verification incomplete. Please re-enter the code or resend.',
                });
                return;
            }

            if (!response.access_token || !response.refresh_token) {
                // Clear password on authentication failure
                await clearPendingPassword();
                setError('root', {
                    type: 'manual',
                    message: 'Missing authentication tokens. Please sign in again.',
                });
                return;
            }

            await saveTokens(response.access_token, response.refresh_token);
            await saveUser(response.user);
            // Clear stored password after successful verification
            await clearPendingPassword();
            Alert.alert('Email verified successfully');
            router.replace('/(tabs)');
        } catch (error) {
            // Clear password on verification error to prevent credential exposure
            await clearPendingPassword();
            const message =
                error instanceof ApiError
                    ? error.message
                    : error instanceof Error
                        ? error.message
                        : 'Failed to verify email. Please try again.';

            setError('root', {
                type: 'manual',
                message,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>TryRack</Text>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Title */}
                    <Text style={styles.title}>Verify Your Email</Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        We sent a verification code to{'\n'}
                        <Text style={styles.emailText}>{emailParam || 'your email address'}</Text>
                    </Text>

                    {/* Verification Code Input */}
                    <View style={styles.formContainer}>
                        <Controller
                            control={control}
                            name="code"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormInput
                                    label="Verification Code"
                                    placeholder="Enter verification code"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.code?.message}
                                    keyboardType="numeric"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            )}
                        />

                        {/* Root Error */}
                        {errors.root && (
                            <Text style={styles.errorText}>{errors.root.message}</Text>
                        )}

                        {/* Verify Button */}
                        <PrimaryButton
                            title="Verify Email"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isVerifyEmailPending || Boolean(routeError)}
                            loading={isVerifyEmailPending}
                        />

                        {/* Resend Code */}
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={() => onResendCode()}
                            disabled={isVerifyEmailPending}
                        >
                            <Text style={styles.resendText}>
                                {"Didn't receive the code? Resend"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Back to Sign Up */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => goBackToSignUp()}>
                            <Text style={styles.footerLink}>Back to Sign Up</Text>
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
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#D4AF37',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
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
        marginBottom: 40,
        lineHeight: 22,
    },
    emailText: {
        fontWeight: '600',
        color: '#D4AF37',
    },
    formContainer: {
        marginBottom: 32,
    },
    errorText: {
        fontSize: 14,
        color: '#FF6B6B',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    resendButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    resendText: {
        fontSize: 14,
        color: '#D4AF37',
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: 32,
    },
    footerLink: {
        fontSize: 14,
        color: '#D4AF37',
        fontWeight: '500',
    },
});
