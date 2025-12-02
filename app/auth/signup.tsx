import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { SignupRequestSchema, type SignupRequest } from '@/api/auth/signup/types';
import { FormInput, PrimaryButton, SocialButton, type SocialProvider } from '@/components/auth/FormComponents';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignup } from '@/api/auth/signup/queries';
import { useSignin } from '@/api/auth/signin/queries';
import type { AuthResponse } from '@/api/auth/types';
import type { EmailVerificationResponse } from '@/api/auth/signin/types';
import { saveTokens, saveUser, savePendingPassword, clearQueryCache } from '@/api/client';
import type { OAuthProvider } from '@/api/auth/oauth/types';
import { useSocialOAuth } from '@/hooks/use-social-oauth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';

const isVerificationResponse = (
    response: AuthResponse | EmailVerificationResponse
): response is EmailVerificationResponse => 'requires_verification' in response;

/**
 * Sign Up Screen Component
 * Allows users to create a new account with email/password or social providers
 * 
 * Features:
 * - Email, password, and password confirmation inputs
 * - Social sign-up options (Google, Apple)
 * - Form validation using React Hook Form and Zod
 * - Terms and conditions acceptance
 * - Error handling and loading states
 * - Navigation to sign in screen
 * 
 * @see https://react-hook-form.com/ - Form validation library
 * @see https://reactnative.dev/docs/scrollview - Scrollable content
 */
export default function SignUpScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const {
        mutateAsync: signupMutation,
        isPending: isSignupPending,
    } = useSignup();
    const {
        mutateAsync: signinMutation,
        isPending: isSigninPending,
    } = useSignin();
    const {
        startSocialAuth,
        isSocialAuthPending,
    } = useSocialOAuth({
        onError: (message) =>
            setError('root', {
                type: 'manual',
                message,
            }),
    });
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<SignupRequest>({
        resolver: zodResolver(SignupRequestSchema),
        defaultValues: {
            email: '',
            password: '',
            confirm_password: '',
        },
    });

    const onSubmit = async (data: SignupRequest) => {
        clearErrors('root');

        try {
            await signupMutation(data);
            // sign in user to get the authentication tokens sent
            const loginResponse = await signinMutation({
                email: data.email,
                password: data.password,
            });

            if (isVerificationResponse(loginResponse) && loginResponse.requires_verification) {
                // Store password securely for resending verification code
                await savePendingPassword(data.password);
                router.push({
                    pathname: '/auth/verify-email',
                    params: {
                        email: loginResponse.email,
                        pending_authentication_token: loginResponse.pending_authentication_token,
                    },
                });
                return;
            }

            const authResponse = loginResponse as AuthResponse;
            // Clear cache before saving new user data to prevent stale data
            clearQueryCache();
            await saveTokens(authResponse.access_token, authResponse.refresh_token);
            await saveUser(authResponse.user);
            router.replace('/(tabs)');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unable to complete sign up. Please try again.';
            setError('root', {
                type: 'manual',
                message,
            });
        }
    };

    const socialProviderMap: Record<SocialProvider, OAuthProvider> = {
        google: 'GoogleOAuth',
        apple: 'AppleOAuth',
    };

    const handleSocialSignUp = (provider: SocialProvider) => {
        clearErrors('root');
        startSocialAuth(socialProviderMap[provider]);
    };

    const isSubmitting = isSignupPending || isSigninPending || isSocialAuthPending;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={isDark ? require('../../assets/images/darklogo.png') : require('../../assets/images/logo.png')}
                        style={styles.logoImage}
                        contentFit="contain"
                    />
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Title */}
                    <ThemedText type="title" style={[styles.title, { color: textColor }]}>
                        Create New Account
                    </ThemedText>

                    {/* Subtitle */}
                    <ThemedText style={[styles.subtitle, { color: iconColor }]}>
                        Get started for free today!
                    </ThemedText>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormInput
                                    label="Email"
                                    placeholder="Enter your email"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.email?.message}
                                    leftIcon="mail"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            )}
                        />

                        {/* Password Input */}
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormInput
                                    label="Password"
                                    placeholder="Password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.password?.message}
                                    isPassword
                                />
                            )}
                        />

                        {/* Confirm Password Input */}
                        <Controller
                            control={control}
                            name="confirm_password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormInput
                                    label="Confirm Password"
                                    placeholder="Confirm Password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.confirm_password?.message}
                                    isPassword
                                />
                            )}
                        />

                        {/* Error Message */}
                        {errors.root && (
                            <ThemedText style={styles.errorText}>{errors.root.message}</ThemedText>
                        )}

                        {/* Sign Up Button */}
                        <PrimaryButton
                            title="Sign up"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            loading={isSubmitting}
                        />

                        {/* Separator */}
                        <View style={styles.separator}>
                            <View style={[styles.separatorLine, { backgroundColor: iconColor, opacity: 0.3 }]} />
                            <ThemedText style={[styles.separatorText, { color: iconColor }]}>or</ThemedText>
                            <View style={[styles.separatorLine, { backgroundColor: iconColor, opacity: 0.3 }]} />
                        </View>

                        {/* Social Sign Up Buttons */}
                        <View style={styles.socialButtonsContainer}>
                            <SocialButton
                                provider="google"
                                onPress={() => handleSocialSignUp('google')}
                                disabled={isSocialAuthPending}
                            />

                            <SocialButton
                                provider="apple"
                                onPress={() => handleSocialSignUp('apple')}
                                disabled={isSocialAuthPending}
                            />
                        </View>

                        {/* Terms and Conditions */}
                        <View style={styles.termsRow}>
                            <ThemedText style={[styles.termsText, { color: iconColor }]}>
                                By registering you agree to{' '}
                            </ThemedText>

                            <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
                                <ThemedText style={[styles.termsLink, { color: tintColor }]}>
                                    Terms & Conditions
                                </ThemedText>
                            </TouchableOpacity>

                            <ThemedText style={[styles.termsText, { color: iconColor }]}>
                                {' '}and{' '}
                            </ThemedText>

                            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
                                <ThemedText style={[styles.termsLink, { color: tintColor }]}>
                                    Privacy Policy
                                </ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <ThemedText style={[styles.footerText, { color: iconColor }]}>
                                Already have an account?
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => router.push('/auth/signin')}
                            >
                                <ThemedText style={[styles.footerLink, { color: tintColor }]}>
                                    Sign In
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    logoImage: {
        width: 180,
        height: 100,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        opacity: 0.7,
    },
    form: {
        width: '100%',
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 16,
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
    },
    separatorText: {
        fontSize: 14,
        marginHorizontal: 16,
        opacity: 0.7,
    },
    socialButtonsContainer: {
        gap: 12,
        marginBottom: 16,
    },
    termsContainer: {
        marginTop: 16,
        paddingHorizontal: 8,
    },
    termsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        opacity: 0.7,
    },
    termsLink: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        marginRight: 8,
        opacity: 0.7,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '500',
    },
});
