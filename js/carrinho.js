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

//Objetivo 1

// Seleciona todos os botões de "Adicionar ao carrinho" para permitir adicionar produtos ao carrinho
const adicionarAoCarrinho = document.querySelectorAll('.add-carrinho');


// Adiciona um ouvinte de clique em cada botão para capturar o produto selecionado
adicionarAoCarrinho.forEach(botao => {
    botao.addEventListener("click", (event) => {
    // Localiza o elemento do produto correspondente ao botão clicado
        const elementoProduto = event.target.closest(".produto");

    // Recupera o id do produto usando o atributo data-id do HTML
        const produtoid = elementoProduto.dataset.id;

    // Recupera o nome do produto a partir do elemento com a classe .nome
        const produtoNome = elementoProduto.querySelector(".nome").textContent;

    // Recupera o caminho da imagem do produto para exibir no carrinho
        const produtoImagem = elementoProduto.querySelector("img").getAttribute("src");

    // Recupera o preço do produto, removendo símbolos e formatando para número
        const produtoPreco = parseFloat(
            elementoProduto.querySelector(".preco").textContent
                .replace(".", "")      // remove o ponto dos milhares
                .replace(",", ".")     // troca vírgula por ponto decimal
                .replace("€", "")      // remove o símbolo do euro
                .replace("R$", "")     // remove o símbolo do real se houver
                .trim()                // remove espaços extras
        );

    // Busca o carrinho atual salvo no localStorage para atualizar ou adicionar produtos
        const carrinho = obterProdutosDoCarrinho();

    // Verifica se o produto já existe no carrinho para somar quantidade ou adicionar novo
        const existeProduto = carrinho.find(item => item.id === produtoid);
        if (existeProduto) {
            // Se o produto já está no carrinho, apenas incrementa a quantidade
            existeProduto.quantidade += 1;
        } else {
            // Se o produto não está no carrinho, cria um novo objeto e adiciona ao array
            const produto = {
                id: produtoid,
                nome: produtoNome,
                imagem: produtoImagem,
                preco: produtoPreco,
                quantidade: 1
            };
            carrinho.push(produto);
        }

    // Salva o carrinho atualizado no localStorage para persistência dos dados
        guardarProdutosNoCarrinho(carrinho);
    atualizarCarrinhoETabela(); // Atualiza o contador, tabela e valores totais do carrinho
    });
});


// Função para salvar o array de produtos do carrinho no localStorage
function guardarProdutosNoCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}


// Função para recuperar o array de produtos do carrinho do localStorage
// Retorna um array vazio caso não exista nada salvo ainda
function obterProdutosDoCarrinho() {
    const produtos = localStorage.getItem("carrinho");
    return produtos ? JSON.parse(produtos) : [];
}

// Atualiza o contador de itens do carrinho exibido no ícone do carrinho

function atualizarContadorCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    let total = 0;

    produtos.forEach(produto => {
        total += produto.quantidade;
    });

    document.getElementById("contador-carrinho").textContent = total;
    
}


// Renderiza a tabela de produtos do carrinho dentro da modal

function renderizarTabelaDoCarrinho(){
    const produtos = obterProdutosDoCarrinho();
    const conteudoTabela = document.querySelector("#modal-1-content table tbody");

    conteudoTabela.innerHTML = ""; // Limpa o conteúdo atual da tabela antes de renderizar novamente

    produtos.forEach(produto => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="td-produto"><img src="${produto.imagem}" alt="${produto.nome}"></td>
            <td>${produto.nome}</td>
            <td class="td-preco-unitario">R$ ${produto.preco.toFixed(2).replace(".", ",")}</td>
            <td class="td-quantidade"><input type="number" value="${produto.quantidade}" min="1" data-id="${produto.id}"></td>
            <td class="td-preco-total">R$ ${(produto.preco * produto.quantidade).toFixed(2).replace(".", ",")}</td>
            <td><button class="btn-remover" id data-id="${produto.id}"></button></td>
        `;
        conteudoTabela.appendChild(tr);
    });
        
}

// Objetivo 2: Implementar a funcionalidade de remoção de produtos do carrinho ao clicar no botão de remover

// Seleciona o corpo da tabela para delegar eventos de remoção e alteração de quantidade
const corpoTabela = document.querySelector("#modal-1-content table tbody");

// Adiciona um ouvinte de clique ao tbody para capturar cliques em botões de remover
corpoTabela.addEventListener("click", evento => {
    if (evento.target.classList.contains("btn-remover")) {
        const id = evento.target.dataset.id;

    // Remove o produto do carrinho (localStorage) ao clicar no botão de remover
        removerProdutoDoCarrinho(id);
    }
});

// Adiciona um ouvinte de input no tbody para atualizar a quantidade de produtos em tempo real
corpoTabela.addEventListener("input", evento => {
    if (evento.target.type === "number") {
        const produtos = obterProdutosDoCarrinho();
        const produto = produtos.find(produto => produto.id === evento.target.dataset.id);
    let novaQuantidade = parseInt(evento.target.value); // Nova quantidade informada pelo usuário
        if (produto) {
            produto.quantidade = novaQuantidade;

            guardarProdutosNoCarrinho(produtos);
            atualizarCarrinhoETabela();
        }
    }
});


// Remove o produto do carrinho pelo id e atualiza a tabela/modal
function removerProdutoDoCarrinho(id) {

    // Obtém todos os produtos do carrinho salvos no localStorage
    const produtos = obterProdutosDoCarrinho();

    // Filtra os produtos para remover aquele com o id informado
    const carrinhoAtualizado = produtos.filter(produto => produto.id !== id);

    guardarProdutosNoCarrinho(carrinhoAtualizado);
    atualizarCarrinhoETabela()
}

// Atualiza o valor total do carrinho e o subtotal dos pedidos

// Calcula e atualiza o subtotal dos produtos e o total do carrinho (sem considerar o frete)
function atualizarValorTotalCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    let subtotal = 0;

    produtos.forEach(produto => {
        subtotal += produto.preco * produto.quantidade;
    });

    // Atualiza o valor do subtotal dos pedidos na modal
    const spanSubtotal = document.querySelector('#subtotal-pedidos .valor');
    if (spanSubtotal) {
        spanSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }

    // Atualiza o valor total do carrinho exibido na modal (sem frete)
    document.querySelector(".total-carrinho").textContent = `Total: R$ ${subtotal.toFixed(2).replace('.', ',')}`;
}

// Atualiza o contador, a tabela e o valor total do carrinho de uma só vez
function atualizarCarrinhoETabela() {
    atualizarContadorCarrinho();
    renderizarTabelaDoCarrinho();
    atualizarValorTotalCarrinho();
}

atualizarCarrinhoETabela()


// Função para calcular o frete via API externa com n8n

async function calcularFrete(cep) {
	//TROQUE PELA SUA URL DO N8N
	const url = "https://andreloureiro.app.n8n.cloud/webhook/ff7f8df3-829a-47a0-8b73-1f88b82866d1";
	try {
		// Busca as medidas dos produtos do arquivo JSON
		const medidasResponse = await fetch('./js/medidas-produtos.json');
		const medidas = await medidasResponse.json();

		// Monta o array de produtos do carrinho com as medidas corretas
		const produtos = obterProdutosDoCarrinho();
		const products = produtos.map(produto => {
			// Procura as medidas pelo id do produto
			const medida = medidas.find(m => m.id === produto.id);
			return {
				quantity: produto.quantidade,
				height: medida ? medida.height : 4,
				length: medida ? medida.length : 30,
				width: medida ? medida.width : 25,
				weight: medida ? medida.weight : 0.25
			};
		});

		const resposta = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({cep, products}),
		});
		if (!resposta.ok) throw new Error("Erro ao calcular frete");
		const resultado = await resposta.json();
        console.log(resultado);
		// Supondo que o resultado tenha a propriedade frete
		return resultado.price;
	} catch (erro) {
		console.error("Erro ao calcular frete:", erro);
		return null;
	}
}

const btnCalcularFrete = document.getElementById("btn-calcular-frete");
const inputCep = document.getElementById("input-cep");
const valorFrete = document.getElementById("valor-frete");

inputCep.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        btnCalcularFrete.click();
    }
});

btnCalcularFrete.addEventListener("click", async () => {
	const cep = inputCep.value.trim();
	const valorFrete = await calcularFrete(cep);	
	const precoFormatado = valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	document.querySelector("#valor-frete .valor").textContent = precoFormatado;
	document.querySelector("#valor-frete").style.display = "flex";

	const totalCarrinhoElemento = document.querySelector("#total-carrinho");
	const valorTotalCarrinho = parseFloat(totalCarrinhoElemento.textContent.replace("Total: R$ ", "").replace('.', ',').replace(',', '.'));
	
	const totalComFrete = valorTotalCarrinho + valorFrete;
	const totalComFreteFormatado = totalComFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	totalCarrinhoElemento.textContent = `Total: R$ ${totalComFreteFormatado}`;
});


function validarCep(cep) {
    // expressão regular para validar o CEP
    const regexCep = /^[0-9]{5}-[0-9]{3}$|^[0-9]{8}$/;
    return regexCep.test(cep);
}

// Função para exibir mensagem de erro na modal do carrinho
function exibirErroCep(mensagem) {
    let erroCep = document.getElementById('erro-cep');
    if (!erroCep) {
        const containerPrecoTotal = document.querySelector('.container-preco-total');
        erroCep = document.createElement('span');
        erroCep.id = 'erro-cep';
        erroCep.style.color = 'red';
        erroCep.style.fontSize = '0.95rem';
        erroCep.style.marginTop = '4px';
        containerPrecoTotal.insertBefore(erroCep, containerPrecoTotal.firstChild);
    }
    erroCep.textContent = mensagem;
}

function removerErroCep() {
    const erroCep = document.getElementById('erro-cep');
    if (erroCep) erroCep.remove();
}

// Atualizar o evento do botão calcular frete para validar o CEP antes de calcular
btnCalcularFrete.addEventListener("click", async () => {
    const cep = inputCep.value.trim();
    removerErroCep();
    if (!validarCep(cep)) {
        exibirErroCep('CEP inválido.');
        return;
    }
    const valorFrete = await calcularFrete(cep);
    if (valorFrete === null) {
        exibirErroCep('Erro ao calcular o frete. Tente novamente.');
        return;
    }
    const precoFormatado = valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.querySelector("#valor-frete .valor").textContent = precoFormatado;
    document.querySelector("#valor-frete").style.display = "flex";

    const totalCarrinhoElemento = document.querySelector("#total-carrinho");
    const valorTotalCarrinho = parseFloat(totalCarrinhoElemento.textContent.replace("Total: R$ ", "").replace('.', ',').replace(',', '.'));
    const totalComFrete = valorTotalCarrinho + valorFrete;
    const totalComFreteFormatado = totalComFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalCarrinhoElemento.textContent = `Total: R$ ${totalComFreteFormatado}`;
});
