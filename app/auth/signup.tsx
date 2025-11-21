import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
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
import { saveTokens, saveUser } from '@/api/client';
import type { OAuthProvider } from '@/api/auth/oauth/types';
import { useSocialOAuth } from '@/hooks/use-social-oauth';

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
 * - Form validation using React Hook Form and Yup
 * - Terms and conditions acceptance
 * - Error handling and loading states
 * - Navigation to sign in screen
 * 
 * @see https://react-hook-form.com/ - Form validation library
 * @see https://reactnative.dev/docs/scrollview - Scrollable content
 */
export default function SignUpScreen() {
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
                router.push({
                    pathname: '/auth/verify-email',
                    params: {
                        email: loginResponse.email,
                        pending_authentication_token: loginResponse.pending_authentication_token,
                        password: data.password,
                    },
                });
                return;
            }

            const authResponse = loginResponse as AuthResponse;
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>TryRack</Text>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Title */}
                    <Text style={styles.title}>Create New Account</Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        Get started for free today!
                    </Text>

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
                            <Text style={styles.errorText}>{errors.root.message}</Text>
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
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>or</Text>
                            <View style={styles.separatorLine} />
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
                            <Text style={styles.termsText}>By registering you agree to </Text>

                            <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
                                <Text style={styles.termsLink}>Terms & Conditions</Text>
                            </TouchableOpacity>

                            <Text style={styles.termsText}> and </Text>

                            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account?</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/auth/signin')}
                            >
                                <Text style={styles.footerLink}>Sign In</Text>
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
        marginBottom: 32,
        lineHeight: 22,
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
        backgroundColor: '#E5E5E7',
    },
    separatorText: {
        fontSize: 14,
        color: '#8E8E93',
        marginHorizontal: 16,
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
        color: '#666666',
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        fontSize: 12,
        color: '#D4AF37',
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
        color: '#666666',
        marginRight: 8,
    },
    footerLink: {
        fontSize: 14,
        color: '#D4AF37',
        fontWeight: '500',
    },
});
