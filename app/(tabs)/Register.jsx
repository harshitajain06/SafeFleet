import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { useAuthState } from 'react-firebase-hooks/auth';

const RegisterScreen = () => {
  const [user, loading] = useAuthState(auth);
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver');
  const [isFocused, setIsFocused] = useState(null);

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      await setDoc(doc(db, 'users', createdUser.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });

      await sendEmailVerification(createdUser);

      Alert.alert('Success', 'Account created! Please verify your email before logging in.');

      Toast.show({
        type: 'success',
        text1: 'Registered Successfully',
        text2: 'Verification email sent.',
      });

      navigation.navigate('Login');
    } catch (error) {
      let errorMessage = 'Something went wrong.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters.';
          break;
      }

      Alert.alert('Registration Error', errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />

        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={[styles.input, { borderColor: isFocused === 'name' ? '#007BFF' : '#ccc' }]}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          onFocus={() => setIsFocused('name')}
          onBlur={() => setIsFocused(null)}
        />
        <TextInput
          style={[styles.input, { borderColor: isFocused === 'email' ? '#007BFF' : '#ccc' }]}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          onFocus={() => setIsFocused('email')}
          onBlur={() => setIsFocused(null)}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { borderColor: isFocused === 'password' ? '#007BFF' : '#ccc' }]}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setIsFocused('password')}
          onBlur={() => setIsFocused(null)}
        />

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Select Role</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
              dropdownIconColor="#567396"
            >
              {/* <Picker.Item label="User" value="user" /> */}
              <Picker.Item label="Driver" value="driver" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.loginRedirect}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Login</Text>
          </TouchableOpacity>
        </View>

        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DCE9FE',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#567396',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  pickerWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  pickerLabel: {
    marginBottom: 6,
    fontSize: 16,
    color: '#567396',
    fontWeight: '600',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#567396',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginRedirect: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#333',
  },
  loginLink: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
