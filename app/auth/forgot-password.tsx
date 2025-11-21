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
import { FormInput, PrimaryButton } from '@/components/auth/FormComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ForgotPasswordRequest } from '@/api/auth/forgot-password/types';
import { ForgotPasswordRequestSchema } from '@/api/auth/forgot-password/types';
import { Image } from 'expo-image';
import { useForgotPassword } from '@/api/auth/forgot-password/queries';

/**
 * Forgot Password Screen Component
 * Provides UI to request a password reset email.
 *
 * @see https://react-hook-form.com/ - Form validation library
 * @see https://github.com/jquense/yup - Schema validation
 * @see https://docs.expo.dev/router/introduction/ - File-based routing reference
 */
export default function ForgotPasswordScreen() {
  const { mutateAsync: forgotPasswordMutation, isPending: isForgotPasswordPending } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handle password reset submission
   * Sends a password reset email to the user.
   */
  const onSubmit = async (data: ForgotPasswordRequest) => {
    console.log(data);
    try {
      const response = await forgotPasswordMutation(data);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
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
          {/* Logo Here */}
          <Image
            source="/images/logo.png"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we’ll send you password reset instructions.
          </Text>

          <View style={styles.form}>
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

            {errors.root && <Text style={styles.errorText}>{errors.root.message}</Text>}

            <PrimaryButton
              title="Send reset link"
              onPress={handleSubmit(onSubmit)}
              loading={isForgotPasswordPending}
              disabled={isForgotPasswordPending}
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
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
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


