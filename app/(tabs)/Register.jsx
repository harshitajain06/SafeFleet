import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const RegisterScreen = () => {
  const [user, loading, error] = useAuthState(auth);
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(null);

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      Alert.alert('Success', 'Account created successfully! Please verify your email.');

      Toast.show({
        type: 'success',
        text1: 'Account created successfully!',
        text2: 'Please verify your email.',
      });

      navigation.navigate('Login');
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'The email address is already in use by another account.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak.';
          break;
        default:
          errorMessage = 'An unknown error occurred. Please try again later.';
      }

      Alert.alert('Error', errorMessage);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
      
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={[
          styles.input,
          { borderColor: isFocused === 'name' ? '#007BFF' : '#ccc' }
        ]}
        placeholder="Name"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
        onFocus={() => setIsFocused('name')}
        onBlur={() => setIsFocused(null)}
      />
      <TextInput
        style={[
          styles.input,
          { borderColor: isFocused === 'email' ? '#007BFF' : '#ccc' }
        ]}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setIsFocused('email')}
        onBlur={() => setIsFocused(null)}
      />
      <TextInput
        style={[
          styles.input,
          { borderColor: isFocused === 'password' ? '#007BFF' : '#ccc' }
        ]}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onFocus={() => setIsFocused('password')}
        onBlur={() => setIsFocused(null)}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCE9FE',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,  // Adjust the width as needed
    height: 100, // Adjust the height as needed
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#567396',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    padding: 35,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 20, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#567396',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#333',
    fontSize: 16,
  },
  loginLink: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
