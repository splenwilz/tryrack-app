import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { FormInput, SocialButton, PrimaryButton, type SocialProvider } from '@/components/auth/FormComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignin } from '@/api/auth/signin/queries';
import { type SigninRequest, SigninRequestSchema } from '@/api/auth/signin/types';
import type { AuthResponse } from '@/api/auth/types';
import { saveTokens, saveUser } from '@/api/client';
import { useSocialOAuth } from '@/hooks/use-social-oauth';
import type { OAuthProvider } from '@/api/auth/oauth/types';

export default function SignInScreen() {
    const { mutateAsync: signinMutation, isPending: isSigninPending } = useSignin();
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<SigninRequest>({
        resolver: zodResolver(SigninRequestSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
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

    const onSubmit = async (data: SigninRequest) => {
        clearErrors('root');
        try {
            const response = await signinMutation(data);
            if ('requires_verification' in response) {
                router.push({
                    pathname: '/auth/verify-email',
                    params: {
                        email: response.email,
                        pending_authentication_token: response.pending_authentication_token,
                        password: data.password,
                    },
                });
            }
            else {
                const authResponse = response as AuthResponse;
                await saveTokens(authResponse.access_token, authResponse.refresh_token);
                await saveUser(authResponse.user);
                router.replace('/(tabs)');
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unable to complete sign in. Please try again.';
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

    const handleSocialSignin = (provider: SocialProvider) => {
        clearErrors('root');
        startSocialAuth(socialProviderMap[provider]);
    };

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
                    <Text style={styles.title}>Welcome Back!</Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        Welcome! Let&apos;s dive into your account
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

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => router.push('/auth/forgot-password')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Error Message */}
                        {errors.root && (
                            <Text style={styles.errorText}>{errors.root.message}</Text>
                        )}

                        {/* Sign In Button */}
                        <PrimaryButton
                            title="Sign in"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSigninPending || isSocialAuthPending}
                            loading={isSigninPending}
                        />

                        {/* Separator */}
                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>or</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        {/* Social Login Buttons */}
                        <View style={styles.socialButtonsContainer}>
                            <SocialButton
                                provider="google"
                                onPress={() => handleSocialSignin('google')}
                                disabled={isSocialAuthPending}
                            />

                            <SocialButton
                                provider="apple"
                                onPress={() => handleSocialSignin('apple')}
                                disabled={isSocialAuthPending}
                            />
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                <Text style={styles.footerLink}>Sign Up</Text>
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
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#D4AF37',
        fontWeight: '500',
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
        marginVertical: 24,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    separatorText: {
        fontSize: 14,
        color: '#666666',
        marginHorizontal: 16,
    },
    socialButtonsContainer: {
        marginBottom: 24,
    },
    footer: {
        alignItems: 'center',
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
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
