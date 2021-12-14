const express = require("express");
const rotas = express();
const { validarUsurario, validarSenha } = require("./intermediarios/validacao");
const { listarContas, criarConta, atualizarDados, excluirConta, depositarEmUmaConta, sacarConta, tranferirValoresEntreContas, consultarSaldoConta, emitirExtrato, } = require("./controladores/controlador");
rotas.post("/contas", criarConta, validarUsurario);
rotas.get("/contas", listarContas);
rotas.put("/contas/:numeroConta/usuario", atualizarDados, validarUsurario);
rotas.delete("/contas/:numeroConta", excluirConta);
rotas.post("/transacoes/depositar", depositarEmUmaConta);
rotas.post("/transacoes/sacar", sacarConta);
rotas.post("/transacoes/transferir", tranferirValoresEntreContas);
rotas.get("/contas/saldo", consultarSaldoConta, validarSenha);
rotas.get("/contas/extrato", emitirExtrato, validarSenha);

module.exports = rotas;