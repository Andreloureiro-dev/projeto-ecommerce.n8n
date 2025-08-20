/*
Script responsável por gerenciar o carrinho de compras.

Objetivo 1 - Quando clicar no botão de adicionar ao carrinho:
    - Atualizar o contador de itens (a ser implementado)
    - Adicionar o produto ao localStorage
    - Atualizar a tabela HTML do carrinho (a ser implementado)

Objetivo 2 - Remover produtos do carrinho (a ser implementado):
    - Ouvir o botão de deletar
    - Remover do localStorage
    - Atualizar o DOM e o total

Objetivo 3 - Atualizar valores do carrinho (a ser implementado):
    - Ouvir mudanças de quantidade
    - Recalcular total individual
    - Recalcular total geral
*/


// Seleciona todos os botões de "Adicionar ao carrinho" na página
const adicionarAoCarrinho = document.querySelectorAll('.add-carrinho');


// Para cada botão de adicionar ao carrinho, adiciona um ouvinte de clique
adicionarAoCarrinho.forEach(botao => {
    botao.addEventListener("click", (event) => {
        // Encontra o elemento do produto mais próximo do botão clicado
        const elementoProduto = event.target.closest(".produto");

        // Obtém o id do produto a partir do atributo data-id
        const produtoid = elementoProduto.dataset.id;

        // Obtém o nome do produto (deve estar em um elemento com a classe .nome)
        const produtoNome = elementoProduto.querySelector(".nome").textContent;

        // Obtém o caminho da imagem do produto (primeira imagem encontrada dentro do produto)
        const produtoImagem = elementoProduto.querySelector("img").getAttribute("src");

        // Obtém o preço do produto, faz o tratamento para converter para número
        const produtoPreco = parseFloat(
            elementoProduto.querySelector(".preco").textContent
                .replace(".", "")      // remove o ponto dos milhares
                .replace(",", ".")     // troca vírgula por ponto decimal
                .replace("€", "")      // remove o símbolo do euro
                .trim()                   // remove espaços extras
        );

        // Recupera o carrinho atual do localStorage
        const carrinho = obterProdutosDoCarrinho();

        // Verifica se o produto já está no carrinho
        const existeProduto = carrinho.find(item => item.id === produtoid);
        if (existeProduto) {
            // Se já existe, incrementa a quantidade
            existeProduto.quantidade += 1;
        } else {
            // Se não existe, cria um novo objeto de produto e adiciona ao carrinho
            const produto = {
                id: produtoid,
                nome: produtoNome,
                imagem: produtoImagem,
                preco: produtoPreco,
                quantidade: 1
            };
            carrinho.push(produto);
        }

        // Guarda o carrinho atualizado no localStorage
        guardarProdutosNoCarrinho(carrinho);
        //Chama a função para atualizar o contador do carrinho
        atualizarContadorCarrinho();
        // Chama a função para renderizar a tabela do carrinho
        renderizarTabelaDoCarrinho();
    });
});


// Salva o array de produtos do carrinho no localStorage
function guardarProdutosNoCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}


// Recupera o array de produtos do carrinho do localStorage
// Se não houver nada salvo, retorna um array vazio
function obterProdutosDoCarrinho() {
    const produtos = localStorage.getItem("carrinho");
    return produtos ? JSON.parse(produtos) : [];
}

//atualizar o contador do carrinho de compras

function atualizarContadorCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    let total = 0;

    produtos.forEach(produto => {
        total += produto.quantidade;
    });

    document.getElementById("contador-carrinho").textContent = total;
    
}
// Chama a função para atualizar o contador do carrinho
atualizarContadorCarrinho();

// Mostra os produtos do carrinho na modal

function renderizarTabelaDoCarrinho(){
    const produtos = obterProdutosDoCarrinho();
    const conteudoTabela = document.querySelector("#modal-1-content table tbody");

    conteudoTabela.innerHTML = ""; // Limpa o conteúdo atual da tabela

    produtos.forEach(produto => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="td-produto"><img src="${produto.imagem}" alt="${produto.nome}"></td>
            <td>${produto.nome}</td>
            <td class="td-preco-unitario">${produto.preco.toFixed(2).replace(".", ",")}€</td>
            <td class="td-quantidade"><input type="number" min="1" value="${produto.quantidade}"></td>
            <td class="td-preco-total">${(produto.preco * produto.quantidade).toFixed(2).replace(".", ",")}€</td>
            <td><button class="btn-remover" id data-id="${produto.id}"></button></td>
        `;
        conteudoTabela.appendChild(tr);
    });
        
}

renderizarTabelaDoCarrinho();
