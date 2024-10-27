const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { login, senha } = JSON.parse(event.body);
    if (!login || !senha) {
        return { statusCode: 400, body: "Login e senha são necessários." };
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const repoOwner = "wesleybalb"; // Seu nome de usuário do GitHub
    const repoName = "teste_login"; // Nome do seu repositório GitHub
    const filePath = "usuarios.json";

    try {
        const { data: fileData } = await octokit.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: filePath
        });

        const currentContent = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

        const novoUsuario = { login, senha };
        currentContent.push(novoUsuario);

        await octokit.repos.createOrUpdateFileContents({
            owner: repoOwner,
            repo: repoName,
            path: filePath,
            message: "Add new user",
            content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString("base64"),
            sha: fileData.sha
        });

        return { statusCode: 200, body: "Cadastro realizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao salvar usuário:", error);
        return { statusCode: 500, body: "Erro no cadastro do usuário." };
    }
};
