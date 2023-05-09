import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

type InputProps = {
  onChangeText: (text: string) => void;
  value: string;
  placeholder: string;
};

const Input: React.FC<InputProps> = ({ onChangeText, value, placeholder }) => (
  <TextInput
    style={styles.input}
    onChangeText={onChangeText}
    value={value}
    placeholder={placeholder}
  />
);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    paddingLeft: 8,
    backgroundColor: 'white',
    fontSize: 16,
    color: 'black',
    height: 40,
  },
});

export default Input;