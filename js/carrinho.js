
const adicionarAoCarrinho = document.querySelectorAll('.add-carrinho');

adicionarAoCarrinho.forEach(botao => {
    botao.addEventListener("click", (event) => {
        const elementoProduto = event.target.closest(".produto");

        const produtoid = elementoProduto.dataset.id;

        const produtoNome = elementoProduto.querySelector(".nome").textContent;

        const produtoImagem = elementoProduto.querySelector("img").getAttribute("src");

        const produtoPreco = parseFloat(
            elementoProduto.querySelector(".preco").textContent
                .replace(".", "")      
                .replace(",", ".")     
                .replace("€", "")      
                .replace("R$", "")     
                .trim()                
        );

        const carrinho = obterProdutosDoCarrinho();

        const existeProduto = carrinho.find(item => item.id === produtoid);
        if (existeProduto) {
            existeProduto.quantidade += 1;
        } else {
            const produto = {
                id: produtoid,
                nome: produtoNome,
                imagem: produtoImagem,
                preco: produtoPreco,
                quantidade: 1
            };
            carrinho.push(produto);
        }

        guardarProdutosNoCarrinho(carrinho);
    atualizarCarrinhoETabela();
    });
});


function guardarProdutosNoCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}


function obterProdutosDoCarrinho() {
    const produtos = localStorage.getItem("carrinho");
    return produtos ? JSON.parse(produtos) : [];
}


function atualizarContadorCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    let total = 0;

    produtos.forEach(produto => {
        total += produto.quantidade;
    });

    document.getElementById("contador-carrinho").textContent = total;
    
}


function renderizarTabelaDoCarrinho(){
    const produtos = obterProdutosDoCarrinho();
    const conteudoTabela = document.querySelector("#modal-1-content table tbody");

    conteudoTabela.innerHTML = "";

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


const corpoTabela = document.querySelector("#modal-1-content table tbody");

corpoTabela.addEventListener("click", evento => {
    if (evento.target.classList.contains("btn-remover")) {
        const id = evento.target.dataset.id;

        removerProdutoDoCarrinho(id);
    }
});


corpoTabela.addEventListener("input", evento => {
    if (evento.target.type === "number") {
        const produtos = obterProdutosDoCarrinho();
        const produto = produtos.find(produto => produto.id === evento.target.dataset.id);
    let novaQuantidade = parseInt(evento.target.value);
        if (produto) {
            produto.quantidade = novaQuantidade;

            guardarProdutosNoCarrinho(produtos);
            atualizarCarrinhoETabela();
        }
    }
});



function removerProdutoDoCarrinho(id) {

    const produtos = obterProdutosDoCarrinho();

    const carrinhoAtualizado = produtos.filter(produto => produto.id !== id);

    guardarProdutosNoCarrinho(carrinhoAtualizado);
    atualizarCarrinhoETabela()
}


function atualizarValorTotalCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    let subtotal = 0;

    produtos.forEach(produto => {
        subtotal += produto.preco * produto.quantidade;
    });

    const spanSubtotal = document.querySelector('#subtotal-pedidos .valor');
    if (spanSubtotal) {
        spanSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }

    document.querySelector(".total-carrinho").textContent = `Total: R$ ${subtotal.toFixed(2).replace('.', ',')}`;
}


function atualizarCarrinhoETabela() {
    atualizarContadorCarrinho();
    renderizarTabelaDoCarrinho();
    atualizarValorTotalCarrinho();
}

atualizarCarrinhoETabela()


async function calcularFrete(cep) {
	btnCalcularFrete.disabled = true;
	const textoOriginalDoBotaoDeFrete = btnCalcularFrete.textContent;
	btnCalcularFrete.textContent = "Calculando frete...";

	const url = "https://andreloureiro.app.n8n.cloud/webhook/ff7f8df3-829a-47a0-8b73-1f88b82866d1";
	try {
		
		const medidasResponse = await fetch('./js/medidas-produtos.json');
		const medidas = await medidasResponse.json();
		const produtos = obterProdutosDoCarrinho();
		const products = produtos.map(produto => {
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
		return resultado.price;
	} catch (erro) {
		console.error("Erro ao calcular frete:", erro);
		return null;
	}finally{
		btnCalcularFrete.disabled = false;
		btnCalcularFrete.textContent = textoOriginalDoBotaoDeFrete;
	}
}

const btnCalcularFrete = document.getElementById("btn-calcular-frete");
const inputCep = document.getElementById("input-cep");
const valorFrete = document.getElementById("valor-frete");

inputCep.addEventListener("keydown", () => {
	if(event.key === "Enter") {
		btnCalcularFrete.click();
	}
});

btnCalcularFrete.addEventListener("click", async () => {
	const cep = inputCep.value.trim();

	const erroCep = document.querySelector(".erro");
	if (!validarCep(cep)) {
		erroCep.textContent = "CEP inválido.";
		erroCep.style.display = "block";
		return;
	}

	const valorFrete = await calcularFrete(cep);	
	const precoFormatado = valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	document.querySelector("#valor-frete .valor").textContent = precoFormatado;
	document.querySelector("#valor-frete").style.display = "flex";

    const totalCarrinhoElemento = document.querySelector("#total-carrinho");
    const valorTotalCarrinho = parseFloat(totalCarrinhoElemento.textContent.replace(/[^0-9,.-]+/g, '').replace('.', '').replace(',', '.'));
    const totalComFrete = valorTotalCarrinho + valorFrete;
    const totalComFreteFormatado = totalComFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalCarrinhoElemento.textContent = `Total: ${totalComFreteFormatado}`;
});

function validarCep(cep){
	const regexCep = /^[0-9]{5}-?[0-9]{3}$/;
	return regexCep.test(cep);
}
