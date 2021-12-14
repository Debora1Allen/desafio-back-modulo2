const bancoDeDados = require("../bancodedados.js");
let { contas, depositos, saques, transferencias } = bancoDeDados;
const { format } = require("date-fns");

let proximoNumero = 1;
const SENHA_BANCO = "Cubos123Bank";

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const conta = contas.find(conta => {
        return conta.usuario.cpf === cpf || conta.usuario.email === email
    });

    if (conta) {
        return res.status(400).json({ mensagem: "Email ou Cpf já existem" });
    }
    const novaConta = {
        numero: proximoNumero++,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }

    };

    contas.push(novaConta);
    return res.status(201).json({ mensagem: "Conta criada com sucesso!" });
};

const listarContas = (req, res) => {
    const { senha_banco } = req.query;
    if (!senha_banco) {
        return res.status(400).json({ mensagem: "A senha do banco é obrigatória" })
    }
    if (senha_banco === SENHA_BANCO) {
        return res.status(202).json(contas);
    }
    return res.status(401).json({ mensagem: "Nâo autorizado!" });
};

const atualizarDados = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const { numeroConta } = req.params;
    const conta = contas.find(conta => conta.numero === Number(numeroConta));
    if (!conta) {
        return res.staus(404).json({ mesagem: "numero da conta não existe" });
    }

    if (cpf !== conta.usuario.cpf) {
        const existeCpf = contas.find(conta => conta.usuario.cpf == cpf);
        if (existeCpf) {
            return res.status(400).json({ mensagem: "O cpf já existe cadastrado" })
        }
    }
    if (email !== conta.usuario.email) {
        const existeemail = contas.find(conta => conta.usuario.email == email);
        if (existeemail) {
            return res.status(400).json({ mensagem: "O email já existe cadastrado" })
        }
    }

    conta.usuario = {

        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha

    };
    res.status(204).json({ mensagem: "alteração realizada com sucesso" });
};


const excluirConta = (req, res) => {
    const contaHaDeletar = contas.find(conta => conta.numero === Number(req.params.numeroConta));
    if (!contaHaDeletar) {
        return res.status(404).json({ mensagem: "A conta informada não existe" });
    }

    if (contaHaDeletar.saldo > 0) {
        return res.status(403).json({ "mensagem": "A conta só pode ser removida se o saldo for zero!" })
    }

    const indice = contas.indexOf(contaHaDeletar);
    contas.splice(indice, 1);
    return res.status(204).json({ mensagem: "conta removida com sucesso" });
};

const depositarEmUmaConta = (req, res) => {
    const { valor, numero_conta } = req.body;
    const valorDeposito = Number(valor);
    const conta = contas.find(c => c.numero === Number(numero_conta));
    if (!conta) {
        return res.status(404).json({ mensagem: "numero de conta não existe" })
    }

    if (valorDeposito <= 0) {
        return res.status(400).json({ mensagem: "O valor do deposito é inválido" });
    }

    if (!valorDeposito || !numero_conta) {
        return res.status(400).json({ mensagem: "valor e numero de conta são obrigatorios" });
    };
    conta.saldo += valorDeposito;
    const novoDeposito = {
        data: format(new Date(), "yyy-MMM-dd' 'HH:mm:ss"),
        numero_conta,
        valor: valorDeposito
    }



    depositos.push(novoDeposito);
    return res.status(200).json(novoDeposito);

};

const sacarConta = (req, res) => {
    const { numero_conta, valor, senha } = req.body;
    const conta = contas.find(c => c.numero === Number(numero_conta));

    if (!conta) {
        return res.status(404).json({ mensagem: "numero de conta não existe" })
    }
    if (conta.usuario.senha !== senha) {
        return res.satus(400).json({ mensagem: "senha invalida" })
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: "O valor do saldo é inválido" });
    }

    if (!valor || !numero_conta || !senha) {
        return res.status(400).json({ mensagem: "O valor, numero de conta e senha são obrigatorios" });
    };

    if (conta.saldo <= 0) {
        return res.status(403).json({ mensagem: "Você não possuí saldo suficiente!" });
    }

    if (conta.saldo < valor) {
        return res.status(400).json({ mensagem: "Você não possuí saldo suficiente!" });
    }

    const novoSaque = {
        data: format(new Date(), "yyy-MMM-dd' 'HH:mm:ss"),
        numero_conta,
        valor,
        senha
    }
    conta.saldo -= valor;
    saques.push(novoSaque);
    return res.status(200).json(novoSaque);
};

const tranferirValoresEntreContas = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    const valorHaTransferir = Number(valor);
    const contaOrigem = contas.find(c => c.numero === numero_conta_origem);
    const contaDestino = contas.find(c => c.numero === numero_conta_destino);
    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: "todos os campos sao obrigatorios são obrigatorios" });
    };

    if (!contaOrigem) {
        return res.status(404).json({ mensagem: "A conta não existe" })
    }
    if (contaOrigem.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: "Senha inválida" })
    }
    if (!contaDestino) {
        return res.status(404).json({ mensagem: "A conta de destino não existe" })
    }

    if (valorHaTransferir <= 0) {
        return res.status(400).json({ mensagem: "O valor é inválido" });
    }

    if (contaOrigem.saldo <= 0 || contaOrigem.saldo < valorHaTransferir) {
        return res.status(404).json({ "mensagem": "Você não possuí saldo suficiente!" });
    };

    contaOrigem.saldo -= valorHaTransferir;
    contaDestino.saldo += valorHaTransferir;
    const novaTranferencia = {
        data: format(new Date(), "yyy-MMM-dd' 'HH:mm:ss"),
        numero_conta_origem,
        numero_conta_destino,
        valor,
        senha
    }



    transferencias.push(novaTranferencia);
    return res.status(200).json(novaTranferencia);
};

const consultarSaldoConta = (req, res) => {
    const { senha, numero_conta } = req.query;
    const numeroConta = Number(numero_conta);
    const senha_conta = senha;
    const conta = contas.find(conta => conta.numero === numeroConta);
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "O numero da conta e a senha são obrigatórios" });
    }
    if (!conta) {
        return res.status(404).json({ mensagem: "A conta não existe" });
    }

    if (conta.usuario.senha !== senha_conta) {
        return res.status(401).json({ mensagem: "Não autorizado" });
    }

    return res.status(200).json({ saldo: conta.saldo });
};

const emitirExtrato = (req, res) => {
    const { senha, numero_conta } = req.query;
    const numeroConta = Number(numero_conta);
    const senha_conta = senha
    const conta = contas.find(conta => conta.numero === numeroConta);
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "O numero da conta e a senha são obrigatórios" });
    }

    if (!conta) {
        return res.status(404).json({ mensagem: "Conta bancária não encontada!" });
    }

    if (conta.usuario.senha !== senha_conta) {
        return res.status(401).json({ mensagem: "Não autorizado" });
    }

    const depositosExtrato = depositos.filter(deposito => deposito.numero_conta === numeroConta);
    const saquesExtrato = saques.filter(saque => saque.numero_conta === numeroConta);
    const tranferenciasEnviadas = transferencias.filter(transferencia => transferencia.numero_conta_origem === numeroConta);
    const tranferenciasRecibidas = transferencias.filter(transferencia => transferencia.numero_conta_destino === numeroConta);



    return res.status(200).json({ deposito: depositosExtrato, saque: saquesExtrato, tranferenciasEnviadas, tranferenciasRecibidas });

};

module.exports = { listarContas, criarConta, atualizarDados, excluirConta, depositarEmUmaConta, sacarConta, tranferirValoresEntreContas, consultarSaldoConta, emitirExtrato };