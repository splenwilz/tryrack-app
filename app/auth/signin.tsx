import {
    View,
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
import { Image } from 'expo-image';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

export default function SignInScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                        Welcome Back!
                    </ThemedText>

                    {/* Subtitle */}
                    <ThemedText style={[styles.subtitle, { color: iconColor }]}>
                        Sign in to your account to continue
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

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => router.push('/auth/forgot-password')}
                        >
                            <ThemedText style={[styles.forgotPasswordText, { color: tintColor }]}>
                                Forgot Password?
                            </ThemedText>
                        </TouchableOpacity>

                        {/* Error Message */}
                        {errors.root && (
                            <ThemedText style={styles.errorText}>{errors.root.message}</ThemedText>
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
                            <View style={[styles.separatorLine, { backgroundColor: iconColor, opacity: 0.3 }]} />
                            <ThemedText style={[styles.separatorText, { color: iconColor }]}>or</ThemedText>
                            <View style={[styles.separatorLine, { backgroundColor: iconColor, opacity: 0.3 }]} />
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
                            <ThemedText style={[styles.footerText, { color: iconColor }]}>
                                Don&apos;t have an account?
                            </ThemedText>
                            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                <ThemedText style={[styles.footerLink, { color: tintColor }]}>
                                    Sign Up
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
        paddingTop: 0,
        paddingBottom: 20,
    },
    logoImage: {
        width: 180,
        height: 100,
        marginBottom: 20
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#D4AF37',
    },
    content: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        marginTop: -15,
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
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    forgotPasswordText: {
        fontSize: 14,
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
    },
    separatorText: {
        fontSize: 14,
        marginHorizontal: 16,
        opacity: 0.7,
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
        marginRight: 8,
        opacity: 0.7,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '500',
    },
});
