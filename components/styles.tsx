import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },
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
    saveButton: {
      backgroundColor: 'purple',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
    button: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
      marginTop: 20,
    },
    loadingIndicator: {
      marginTop: 20,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      // alignItems: 'center',
      padding: 16,
    },
  });