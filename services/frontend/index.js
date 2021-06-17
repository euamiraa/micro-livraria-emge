function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6 quantidade">Disponível em estoque: ${book.quantity}</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button botaoComprar is-fullwidth is-success" data-id="${book.id}">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

function UpdateProduct(id) {
    fetch('http://localhost:3000/books/remove/' + id)
        .then((data) => {
            if (data.ok) {
                id--
                return data.json();
            }
            throw data.statusText;
        })
        .then(function (data) {
            if (data.quantity >= 0){
                let tag = document.querySelectorAll(`.book .quantidade`)[id];
                var text = document.createTextNode("Disponível em estoque: " + data.quantity);
                tag.replaceChild(text, tag.childNodes[0]);
            }else {
                swal('Erro', 'Não há inventário restante!', 'error');
            }
            AtualizaEstoque(data.quantity, id);
        })
        .catch((err) => {
            swal('Erro', 'Erro ao atualizar o inventário', 'error');
            console.error(err);
        });
}
function AtualizaEstoque(quantidade, id){
    if (quantidade <= 0){
        $(".botaoComprar")[id].setAttribute("disabled", "");
    }else {
        $(".botaoComprar")[id].removeAttribute("disabled", "");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');
    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                    AtualizaEstoque(book.quantity, book.id - 1);
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(cep);
                    });
                });

                document.querySelectorAll('.botaoComprar').forEach((btn) => {
                    btn.addEventListener('click', (e) => {                    
                        const id = e.target.getAttribute('data-id');
                        UpdateProduct(id);
                        swal('Compra de livros', 'Compra realizada com sucesso!', 'success');
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});
