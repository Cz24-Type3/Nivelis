import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

const db = Platform.OS !== 'web' ? SQLite.openDatabaseSync('nivelis.db') : null;

export const setupDatabase = () => {
    if (Platform.OS === 'web' || !db) return;
    try {
        // Atualizado: Adicionados campos cpf, data_nascimento e celular
        db.execSync(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                cpf TEXT UNIQUE NOT NULL,
                data_nascimento TEXT NOT NULL,
                celular TEXT,
                senha TEXT NOT NULL
            );
        `);
    } catch (error) {
        console.error("Erro setup:", error);
    }
};

// Atualizado: Função agora recebe os novos parâmetros
export function adicionarUsuario(
    nome: string, 
    email: string, 
    senha: string, 
    cpf: string, 
    dataNascimento: string, 
    celular?: string
) {
    if (Platform.OS === 'web' || !db) return { success: false };
    try {
        const statement = db.prepareSync(
            'INSERT INTO usuarios (nome, email, senha, cpf, data_nascimento, celular) VALUES (?, ?, ?, ?, ?, ?)'
        );
        statement.executeSync([nome, email, senha, cpf, dataNascimento, celular || null]);
        return { success: true };
    } catch (error) {
        // Retorna o erro para que o Cadastro.tsx saiba se foi e-mail/cpf duplicado
        return { success: false, error };
    }
}

export function listarUsuarios() {
    if (Platform.OS === 'web' || !db) return [];
    try {
        return db.getAllSync('SELECT * FROM usuarios');
    } catch (error) {
        return [];
    }
}

// --- FUNÇÃO NOVA 1: EXCLUIR ESPECÍFICO ---
export function excluirUsuarioPorId(id: number) {
    if (Platform.OS === 'web' || !db) return { success: false };
    try {
        const statement = db.prepareSync('DELETE FROM usuarios WHERE id = ?');
        statement.executeSync([id]);
        return { success: true };
    } catch (error) {
        console.error("Erro ao excluir:", error);
        return { success: false };
    }
}

// --- FUNÇÃO NOVA 2: LIMPAR TUDO ---
export const limparBancoDeDados = () => {
    if (Platform.OS === 'web' || !db) return { success: false };
    try {
        db.execSync('DELETE FROM usuarios;');
        // Opcional: Reseta o contador de ID para começar do 1 novamente
        db.execSync("DELETE FROM sqlite_sequence WHERE name='usuarios';"); 
        return { success: true };
    } catch (error) {
        console.error("Erro ao limpar:", error);
        return { success: false };
    }
};

export const exportarBancoDeDados = async () => {
    if (Platform.OS === 'web') return;
    const dbUri = FileSystem.documentDirectory + 'SQLite/nivelis.db';
    const tempUri = FileSystem.cacheDirectory + 'nivelis_backup.db';

    try {
        const info = await FileSystem.getInfoAsync(dbUri);
        if (info.exists) {
            await FileSystem.copyAsync({ from: dbUri, to: tempUri });
            await Sharing.shareAsync(tempUri, {
                dialogTitle: 'Enviar banco para o PC',
                mimeType: 'application/x-sqlite3',
            });
        }
    } catch (error) {
        console.error("Erro na exportação:", error);
    }
};

export default db;