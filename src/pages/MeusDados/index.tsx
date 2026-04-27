import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTAÇÃO DO TEMA GLOBAL APLICADA AQUI:
import { useTheme } from '../TemasAcoes/Temas'; 

import { styles } from './styles';

export default function ProfileData() {
  const navigation = useNavigation<any>();
  
  // PUXANDO O TEMA GLOBAL AQUI EM VEZ DE USAR useState LOCAL:
  const { isDarkMode, toggleTheme } = useTheme();

  const [nome, setNome] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('renanteixeira1801@gmail.com');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [menuVisible, setMenuVisible] = useState(false);

  const defaultUserIcon = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('@user_profile_data');
      if (savedData !== null) {
        const data = JSON.parse(savedData);
        setNome(data.nome || '');
        setDataNasc(data.dataNasc || '');
        setCelular(data.celular || '');
        setEmail(data.email || 'renanteixeira1801@gmail.com');
        setAvatarUri(data.avatarUri || null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }
  };

  const handleSaveData = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome não pode estar vazio.');
      return;
    }
    setLoading(true);
    try {
      const userData = { nome, dataNasc, celular, email, avatarUri };
      await AsyncStorage.setItem('@user_profile_data', JSON.stringify(userData));
      Alert.alert('Sucesso', 'Dados salvos!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Acesso à galeria negado.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // --- LÓGICA DE CORES DINÂMICAS PARA MANTER O DARK MODE EM TUDO ---
  const theme = {
    bg: isDarkMode ? "#12121b" : "#F5F5F7",
    card: isDarkMode ? "#1e1e2d" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#333333",
    inputLabel: isDarkMode ? "#CCC" : "#666",
    border: isDarkMode ? "#444" : "#DDD",
    icon: isDarkMode ? "#CCC" : "#999"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      {/* StatusBar precisa mudar para os ícones aparecerem no claro */}
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* MODAL DO MENU */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={[styles.menuContainer, { backgroundColor: theme.card }]}
          >
            <View style={styles.dragIndicator} />

            <TouchableOpacity 
              style={styles.menuItem} 
              // AQUI CHAMAMOS A FUNÇÃO GLOBAL DO TEMA
              onPress={() => { toggleTheme(); setMenuVisible(false); }}
            >
              <Feather name={isDarkMode ? "sun" : "moon"} size={22} color={theme.text} />
              <Text style={[styles.menuText, { color: theme.text }]}>
                Modo {isDarkMode ? "claro" : "escuro"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Login'); }}>
              <Feather name="power" size={22} color="#ff4444" />
              <Text style={[styles.menuText, { color: '#ff4444' }]}>Sair</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Versão do app: 1.40.0</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="more-vert" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleEditPhoto} activeOpacity={0.8} style={styles.avatarWrapper}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Image 
                source={{ uri: avatarUri ? avatarUri : defaultUserIcon }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.editPhotoBlock}>
              <View style={[styles.editPhotoIconCircle, { borderColor: theme.bg }]}>
                <Ionicons name="camera" size={18} color="#FFF" />
              </View>
              <Text style={[styles.editPhotoText, { backgroundColor: isDarkMode ? 'rgba(18, 18, 27, 0.8)' : 'rgba(0, 0, 0, 0.6)' }]}>
                Editar
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: theme.text }]}>{nome || 'Novo Usuário'}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Meus dados</Text>

          {/* CAMPO NOME */}
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.textWrapper}>
              <Text style={[styles.label, { color: theme.inputLabel }]}>Nome completo</Text>
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#999"
              />
            </View>
            <Feather name="user" size={22} color={theme.icon} />
          </View>

          {/* CAMPO DATA */}
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.textWrapper}>
              <TextInput 
                style={[styles.inputSimple, { color: theme.text }]}
                value={dataNasc}
                onChangeText={setDataNasc}
                placeholder="Data de nascimento"
                placeholderTextColor="#999"
              />
            </View>
            <MaterialIcons name="calendar-today" size={22} color={theme.icon} />
          </View>

          {/* CAMPO CELULAR */}
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.textWrapper}>
              <TextInput 
                style={[styles.inputSimple, { color: theme.text }]}
                value={celular}
                onChangeText={setCelular}
                placeholder="Celular (opcional)"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
            <Feather name="smartphone" size={22} color={theme.icon} />
          </View>

          {/* CAMPO EMAIL */}
          <View style={[styles.inputContainer, styles.inputDisabled, { backgroundColor: isDarkMode ? '#1a1a25' : '#EAEAEA' }]}>
            <View style={styles.textWrapper}>
              <Text style={[styles.label, { color: '#666' }]}>Email</Text>
              <Text style={[styles.textDisabled, { color: isDarkMode ? '#888' : '#666' }]}>{email}</Text>
            </View>
            <MaterialIcons name="mail-outline" size={22} color="#444" />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && { opacity: 0.7 }]} 
          onPress={handleSaveData}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar dados</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}