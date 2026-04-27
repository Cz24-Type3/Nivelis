import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { style } from './styles';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../TemasAcoes/Temas'; // IMPORTANTE: Importando o tema global

import Logo from '../../assets/NivelisLogo.png'; 

export default function Home() {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    
    // PEGANDO O ESTADO GLOBAL DO MODO CLARO
    const { isDarkMode } = useTheme(); 
    
    const [nomeUsuario, setNomeUsuario] = useState('Carregando...');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    // Configuração de cores dinâmicas para a Home
    const theme = {
        bg: isDarkMode ? "#12121b" : "#F5F5F7",
        text: isDarkMode ? "#FFFFFF" : "#333333",
        card: isDarkMode ? "#1e1e2d" : "#FFFFFF",
        subtext: isDarkMode ? "#CCC" : "#666",
        border: isDarkMode ? "transparent" : "#DDD"
    };

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const savedData = await AsyncStorage.getItem('@user_profile_data');
                if (savedData !== null) {
                    const data = JSON.parse(savedData);
                    setNomeUsuario(data.nome || "Usuário");
                    setAvatarUri(data.avatarUri || null);
                } else {
                    setNomeUsuario("Usuário");
                }
            } catch (error) {
                console.error("Erro ao carregar dados do storage", error);
                setNomeUsuario("Usuário");
            }
        };

        if (isFocused) {
            carregarDados();
        }
    }, [isFocused]);

    return (
        <ScrollView 
            style={[style.container, { backgroundColor: theme.bg }]} 
            showsVerticalScrollIndicator={false}
        >
            {/* Ajuste da StatusBar para esta tela também */}
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            {/* CABEÇALHO */}
            <View style={style.header}>
                <View>
                    <Text style={[style.greetingText, { color: theme.subtext }]}>Bem-vindo</Text>
                    <Text style={[style.userName, { color: theme.text }]}>{nomeUsuario}</Text>
                </View>
                
                <TouchableOpacity 
                    style={[style.profileImage, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 0 : 1 }]} 
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('MeusDados')}
                >
                    {avatarUri ? (
                        <Image 
                            source={{ uri: avatarUri }} 
                            style={{ width: '100%', height: '100%', borderRadius: 25 }} 
                        />
                    ) : (
                        <FontAwesome5 name="user-alt" size={20} color={isDarkMode ? "#ffffff" : "#7c29e5"} />
                    )}
                </TouchableOpacity>
            </View>
            {/* LOGO CENTRAL */}
                        <View style={style.logoContainer}>
                            <Image 
                                source={Logo} 
                                style={[
                                    style.logo, 
                                    { tintColor: '#7c29e5' } // Logo sempre roxa, independente do tema
                                ]} 
                                resizeMode="contain" 
                            />
                        </View>

            {/* MENU DE CARDS */}
            <View style={style.menuContainer}>
                
                {/* CARD CONCURSOS */}
                <TouchableOpacity 
                    style={[style.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 0 : 1 }]} 
                    activeOpacity={0.8}
                >
                    <Text style={[style.cardTitle, { color: theme.text }]}>Concursos</Text>
                    <View style={style.cardIconContainer}>
                        <MaterialIcons name="track-changes" size={35} color="#7c29e5" />
                    </View>
                </TouchableOpacity>

                {/* CARD ENADE */}
                <TouchableOpacity 
                    style={[style.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 0 : 1 }]} 
                    activeOpacity={0.8}
                >
                    <Text style={[style.cardTitle, { color: theme.text }]}>Enade / Enem</Text>
                    <View style={style.cardIconContainer}>
                        <FontAwesome5 name="graduation-cap" size={30} color="#7c29e5" />
                    </View>
                </TouchableOpacity>

                {/* CARD QUEM SOMOS */}
                <TouchableOpacity 
                    style={[style.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 0 : 1 }]} 
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('QuemSomos')}
                >
                    <Text style={[style.cardTitle, { color: theme.text }]}>Quem Somos?</Text>
                    <View style={style.cardIconContainer}>
                        <Ionicons name="help-circle-outline" size={38} color="#7c29e5" />
                    </View>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}