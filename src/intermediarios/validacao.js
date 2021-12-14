const { contas } = require("../bancodedados");


const validarUsurario = (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });

    }
    return next();
}


const validarSenha = (req, res, next) => {
    const { senha_banco } = req.query;
    console.log("senha >", senha_banco);
    if (!senha_banco) {
        return res.status(400).json({ mensagem: "Informar a senha" });
    }

    const conta = contas.find(conta => conta.numero_conta === numero_conta);

    if (conta.senha === senha_banco) {
        return next();
    }
    return res.status(401).json({ mensagem: "Nâo autorizado" });
};

module.exports = { validarSenha, validarUsurario }