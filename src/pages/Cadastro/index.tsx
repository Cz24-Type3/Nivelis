import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform, 
    Alert,
    Modal 
} from "react-native";

/** * ICONOGRAFIA
 * Importação de diversos pacotes de ícones para compor o layout do formulário
 */
import { 
    MaterialIcons, 
    FontAwesome, 
    Feather, 
    AntDesign, 
    MaterialCommunityIcons 
} from '@expo/vector-icons'; 

/** * SERVIÇOS E ESTILOS
 * Importação de estilos externos, armazenamento local e banco de dados
 */
import { style } from "./styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    setupDatabase, 
    adicionarUsuario 
} from '../../services/database';

export default function Cadastro({ navigation }: any) {
    // --- ESTADOS DO FORMULÁRIO ---
    // Armazenam os dados digitados pelo usuário
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState(''); 
    const [dataNascimento, setDataNascimento] = useState(''); 
    const [celular, setCelular] = useState(''); 
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    // --- ESTADOS DE INTERFACE (UI) ---
    // Controlam o que aparece na tela (Modais e Visibilidade de Senha)
    const [aceitoTermos, setAceitoTermos] = useState(false);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [ocultarSenha, setOcultarSenha] = useState(true);
    const [ocultarConfirmarSenha, setOcultarConfirmarSenha] = useState(true);

    // -----------------------------------------------------------------
    // FUNÇÕES DE VALIDAÇÃO
    // -----------------------------------------------------------------

    /**
     * Valida se o CPF é matematicamente válido (Algoritmo de dígitos verificadores)
     */
    const validarCPFReal = (cpfRaw: string) => {
        const cleanCpf = cpfRaw.replace(/\D/g, ""); // Remove tudo que não é número
        
        // Verifica tamanho e evita CPFs óbvios como "111.111.111-11"
        if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) return false;
        
        let soma = 0, resto;
        // Validação do 1º dígito
        for (let i = 1; i <= 9; i++) soma += parseInt(cleanCpf.substring(i-1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cleanCpf.substring(9, 10))) return false;

        // Validação do 2º dígito
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cleanCpf.substring(i-1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cleanCpf.substring(10, 11))) return false;

        return true;
    };

    /**
     * Valida se a data de nascimento é real e se a idade faz sentido (0 a 120 anos)
     */
    const validarIdade = (data: string) => {
        const partes = data.split('/');
        if (partes.length !== 3) return false;
        
        const dia = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1; // Meses em JS começam em 0
        const ano = parseInt(partes[2]);
        
        const dataNasc = new Date(ano, mes, dia);
        const hoje = new Date();
        
        // Verifica se a data gerada é válida (ex: evita 31/02)
        if (dataNasc.getDate() !== dia || dataNasc.getMonth() !== mes || dataNasc.getFullYear() !== ano) return false;

        const idade = hoje.getFullYear() - dataNasc.getFullYear();
        if (dataNasc > hoje || idade > 120 || idade < 0) return false;

        return true;
    };

    // -----------------------------------------------------------------
    // FUNÇÕES DE MÁSCARA (FORMATAÇÃO VISUAL)
    // -----------------------------------------------------------------

    const formatarCPF = (value: string) => {
        const clearValue = value.replace(/\D/g, ""); 
        return clearValue
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .substring(0, 14);
    };

    const formatarData = (value: string) => {
        const clearValue = value.replace(/\D/g, "");
        return clearValue
            .replace(/(\d{2})(\d)/, "$1/$2")
            .replace(/(\d{2})(\d)/, "$1/$2")
            .substring(0, 10);
    };

    const formatarCelular = (value: string) => {
        const clearValue = value.replace(/\D/g, "");
        return clearValue
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .substring(0, 15);
    };

    // -----------------------------------------------------------------
    // CICLO DE VIDA E LÓGICA DE NEGÓCIO
    // -----------------------------------------------------------------

    // Inicializa o banco de dados assim que a tela abre
    useEffect(() => {
        setupDatabase();
    }, []);

    /**
     * Função principal que valida os campos e envia os dados para o banco
     */
    const realizarCadastro = async () => {
        // Limpeza de caracteres especiais antes de validar/salvar
        const cpfLimpo = cpf.replace(/\D/g, "");
        const emailLimpo = email.toLowerCase().trim();
        const celularLimpo = celular.replace(/\D/g, "");

        // 1. Validação de Campos Vazios
        if (!nome || !emailLimpo || !cpfLimpo || !dataNascimento || !senha) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // 2. Validação de Regras de Negócio
        if (!validarCPFReal(cpfLimpo)) {
            Alert.alert("Erro", "O CPF digitado não é válido.");
            return;
        }

        if (!validarIdade(dataNascimento)) {
            Alert.alert("Erro", "A data de nascimento é inválida ou incoerente.");
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas digitadas não são iguais!");
            return;
        }

        if (!aceitoTermos) {
            Alert.alert("Aviso", "Você precisa aceitar os termos de uso para continuar.");
            return;
        }

        // 3. Tentativa de Inserção no Banco de Dados
        const resultado = adicionarUsuario(nome, emailLimpo, senha, cpfLimpo, dataNascimento, celularLimpo);

        if (resultado.success) {
            try {
                // Salva o nome do usuário localmente para saudações futuras
                await AsyncStorage.setItem('@usuario_nome', nome);
                Alert.alert("Sucesso!", "Sua conta foi criada!", [
                    { text: "Ir para Login", onPress: () => navigation.navigate('welcome') }
                ]);
            } catch (error) {
                console.error("Erro ao salvar nome localmente:", error);
            }
        } else {
            Alert.alert("Erro ao cadastrar", "Este e-mail ou CPF já podem estar em uso.");
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#000' }}
        >
            <ScrollView style={style.container} showsVerticalScrollIndicator={false}>
                
                {/* MODAL DE TERMOS DE USO */}
                <Modal visible={modalVisivel} animationType="fade" transparent={true}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '85%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 20 }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Termos de Uso</Text>
                            <ScrollView style={{ maxHeight: 300 }}>
                                <Text style={{ color: '#BBB' }}>
                                    Bem-vindo ao Nivelis!
                                    {"\n"}
                                    Ao se cadastrar e utilizar nosso aplicativo de estudos, você declara estar de acordo com os termos e condições aqui estabelecidos.
                                    {"\n\n"}
                                    O uso da plataforma implica na aceitação da coleta e do tratamento de dados necessários para autenticação, segurança e melhoria da experiência do usuário.
                                    {"\n\n"}
                                    Recomendamos a leitura completa dos termos para melhor compreensão de seus direitos e responsabilidades.

                                </Text>
                            </ScrollView>
                            <TouchableOpacity onPress={() => setModalVisivel(false)} style={[style.button, { marginTop: 15 }]}>
                                <Text style={style.buttonText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                
                {/* CABEÇALHO */}
                <View style={style.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={25} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={style.title}>Criar conta</Text>
                </View>

                {/* FORMULÁRIO DE ENTRADA */}
                <View style={style.form}>
                    
                    {/* Campo Nome */}
                    <View style={style.inputContainer}>
                        <TextInput 
                            style={style.input} 
                            placeholder="Nome Completo" 
                            placeholderTextColor="#666" 
                            value={nome} 
                            onChangeText={setNome} 
                        />
                        <FontAwesome name="user-o" size={18} color="#666" />
                    </View>

                    {/* Campo Email */}
                    <View style={style.inputContainer}>
                        <TextInput 
                            style={style.input} 
                            placeholder="Email" 
                            placeholderTextColor="#666" 
                            value={email} 
                            onChangeText={setEmail} 
                            autoCapitalize="none" 
                            keyboardType="email-address"
                        />
                        <MaterialIcons name="mail-outline" size={18} color="#666" />
                    </View>

                    {/* Campo CPF com Máscara */}
                    <View style={style.inputContainer}>
                        <TextInput 
                            style={style.input} 
                            placeholder="CPF" 
                            placeholderTextColor="#666" 
                            value={cpf} 
                            onChangeText={(text) => setCpf(formatarCPF(text))} 
                            keyboardType="numeric"
                            maxLength={14}
                        />
                        <AntDesign name="idcard" size={18} color="#666" />
                    </View>

                    {/* Campo Data de Nascimento com Máscara */}
                    <View style={style.inputContainer}>
                        <TextInput 
                            style={style.input} 
                            placeholder="Data de Nascimento (DD/MM/AAAA)" 
                            placeholderTextColor="#666" 
                            value={dataNascimento} 
                            onChangeText={(text) => setDataNascimento(formatarData(text))} 
                            keyboardType="numeric"
                            maxLength={10}
                        />
                        <FontAwesome name="calendar-o" size={18} color="#666" />
                    </View>

                    {/* Campo Celular */}
                    <View style={style.inputContainer}>
                        <TextInput 
                            style={style.input} 
                            placeholder="Celular (Opcional)" 
                            placeholderTextColor="#666" 
                            value={celular} 
                            onChangeText={(text) => setCelular(formatarCelular(text))} 
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                        <Feather name="phone" size={18} color="#666" />
                    </View>

                    {/* Campo Senha com Controle de Visibilidade */}
                    <View style={style.inputContainer}>
                        <TextInput 
                            style={style.input} 
                            placeholder="Senha" 
                            placeholderTextColor="#666" 
                            secureTextEntry={ocultarSenha} 
                            value={senha} 
                            onChangeText={setSenha} 
                        />
                        <TouchableOpacity onPress={() => setOcultarSenha(!ocultarSenha)}>
                            <MaterialCommunityIcons 
                                name={ocultarSenha ? "eye-off-outline" : "eye-outline"} 
                                size={20} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Campo Confirmar Senha */}
                    <View style={style.inputContainer}>
                        <TextInput 
                            style={style.input} 
                            placeholder="Confirmar Senha" 
                            placeholderTextColor="#666" 
                            secureTextEntry={ocultarConfirmarSenha} 
                            value={confirmarSenha} 
                            onChangeText={setConfirmarSenha} 
                        />
                        <TouchableOpacity onPress={() => setOcultarConfirmarSenha(!ocultarConfirmarSenha)}>
                            <MaterialCommunityIcons 
                                name={ocultarConfirmarSenha ? "eye-off-outline" : "eye-outline"} 
                                size={20} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* CHECKBOX DE TERMOS */}
                    <View style={style.termsContainer}>
                        <TouchableOpacity 
                            onPress={() => setAceitoTermos(!aceitoTermos)}
                            style={[
                                style.checkbox, 
                                { backgroundColor: aceitoTermos ? '#6217FF' : 'transparent' }
                            ]}
                        >
                            {aceitoTermos && <MaterialIcons name="check" size={14} color="#FFF" />}
                        </TouchableOpacity>
                        <Text style={style.termsText}>
                            Li e aceito os{" "}
                            <Text 
                                style={{ color: '#6217FF', textDecorationLine: 'underline' }} 
                                onPress={() => setModalVisivel(true)}
                            >
                                termos de uso
                            </Text>
                        </Text>
                    </View>
                </View>

                {/* BOTÃO FINALIZAR */}
                <View style={{ padding: 20 }}>
                    <TouchableOpacity style={style.button} onPress={realizarCadastro}>
                        <Text style={style.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}