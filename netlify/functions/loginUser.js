const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { login, senha } = JSON.parse(event.body);
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const repoOwner = "wesleybalb";
    const repoName = "teste_login";
    const filePath = "usuarios.json";

    try {
        const { data: fileData } = await octokit.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: filePath
        });

        const usuarios = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
        const usuarioEncontrado = usuarios.find(user => user.login === login && user.senha === senha);

        if (usuarioEncontrado) {
            return { statusCode: 200, body: "Login realizado com sucesso!" };
        } else {
            return { statusCode: 401, body: "Credenciais inválidas." };
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        return { statusCode: 500, body: "Erro no login do usuário." };
    }
};
