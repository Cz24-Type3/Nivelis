import React, { useState } from "react"; 
import {
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    Alert 
} from 'react-native';

import { style } from "./styles";
import Logo from '../../assets/NivelisLogo.png'
import { MaterialIcons } from '@expo/vector-icons';

// Importações para lógica de login e persistência
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listarUsuarios } from '../../services/database';

export default function Login({ navigation }: any) { 
    // VARIÁVEIS DE ESTADO: Armazenam dados que mudam e precisam atualizar a tela
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    
    // NOVO ESTADO: Controla se a senha está oculta (false) ou visível (true)
    const [mostrarSenha, setMostrarSenha] = useState(false);

    // FUNÇÃO DE LOGIN: Executada quando o botão "Entrar" é pressionado
    const handleLogin = async () => {
        // 1. Validação básica de campos vazios
        // Impede que o usuário tente logar sem preencher tudo
        if (!email || !senha) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos!");
            return; // Interrompe a execução da função aqui
        }

        // 2. Busca a lista de usuários no seu banco de dados fictício/local
        const usuarios = listarUsuarios();

        // 3. Procura o usuário na lista
        // O método 'find' percorre a lista e retorna o primeiro usuário que tiver email e senha iguais aos digitados
        const usuarioEncontrado: any = usuarios.find(
            (user: any) => user.email === email && user.senha === senha
        );

        // 4. Verifica se o usuário foi encontrado com sucesso
        if (usuarioEncontrado) {
            try {
                // Salva o nome do usuário no aparelho (AsyncStorage) para uso futuro no app
                await AsyncStorage.setItem('@usuario_nome', usuarioEncontrado.nome);
                
                // Redireciona o usuário para a tela inicial após o login bem-sucedido
                navigation.navigate('welcome');
            } catch (error) {
                Alert.alert("Erro", "Houve um problema ao salvar os dados de login.");
            }
        } else {
            // Caso de erro: Email ou senha não bateram com nenhum registro
            // Os consoles ajudam o desenvolvedor a verificar o que chegou na função
            console.log("Tentativa de login falhou.");
            console.log("Digitado:", email, senha);
            
            Alert.alert("Erro de Login", "E-mail ou senha incorretos.");
        }
    };

    // RENDERIZAÇÃO: Tudo o que será desenhado na tela
    return (
        <View style={style.container}>
            {/* CAIXA SUPERIOR: Onde fica a logomarca */}
            <View style={style.boxTop}>
                <Image 
                    source={Logo}
                    style={style.logo}
                    resizeMode="contain" // Faz a imagem caber sem distorcer
                />
            </View>

            {/* CAIXA CENTRAL: Formulário de campos de texto */}
            <View style={style.boxMid}>
                
                {/* Campo de E-mail */}
                <Text style={style.tittleInput}>ENDEREÇO DE E-MAIL</Text>
                <View style={style.BoxInput}>
                    <TextInput 
                        style={style.input}
                        placeholder="exemplo@email.com"
                        placeholderTextColor="#808080"
                        value={email} // Conecta o campo ao estado 'email'
                        onChangeText={setEmail} // Atualiza o estado ao digitar
                        autoCapitalize="none" // Evita primeira letra maiúscula automática
                        keyboardType="email-address" // Mostra teclado adequado para email
                    />
                    {/* Ícone fixo de e-mail */}
                    <MaterialIcons name='email' size={20} color={'#888'} />
                </View>
                
                {/* Campo de Senha */}
                <Text style={style.tittleInput}>SENHA</Text>
                <View style={style.BoxInput}>
                    <TextInput 
                        style={style.input}
                        secureTextEntry={!mostrarSenha} // Se 'mostrarSenha' for false, secure (esconde) é true
                        placeholder="********"
                        placeholderTextColor="#808080"
                        value={senha} 
                        onChangeText={setSenha} 
                    />
                    
                    {/* Botão para alternar a visibilidade da senha */}
                    <TouchableOpacity 
                        onPress={() => setMostrarSenha(!mostrarSenha)} // Inverte o valor atual do estado
                    >
                        <MaterialIcons 
                            // Alterna o desenho do ícone dependendo se a senha está visível ou não
                            name={mostrarSenha ? 'visibility-off' : 'remove-red-eye'} 
                            size={20} 
                            color={'#888'} 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* CAIXA INFERIOR: Botões de ação principais e links */}
            <View style={style.boxBottom}>
                {/* Botão de Entrar */}
                <TouchableOpacity 
                    style={style.button}
                    onPress={handleLogin} // Chama a função que criamos lá em cima
                >
                    <Text style={style.textButton}>Entrar</Text>
                </TouchableOpacity>

                {/* Link para criar conta */}
                <Text style={style.textBottom}>
                    Não tem conta? 
                    <Text 
                        style={style.textBottomBold}
                        onPress={() => navigation.navigate('Cadastro')} // Vai para a tela de registro
                    >
                        {" "}Crie agora!
                    </Text>
                </Text>
            </View>
        </View>
    );
}