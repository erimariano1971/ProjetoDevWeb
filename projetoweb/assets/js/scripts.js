// -----------------------------------
// Função para validar os formularios
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-receita');
  const camposObrigatorios = form.querySelectorAll('input[required], textarea[required], select[required]');
  const mensagem = document.getElementById('mensagem-feedback');

  function resetarErros() {
    camposObrigatorios.forEach(campo => {
      campo.classList.remove('is-invalid');
    });
  }

  function mostrarMensagemSucesso() {
    mensagem.classList.remove('d-none');
    mensagem.classList.add('show');

    setTimeout(() => {
      mensagem.classList.remove('show');
      mensagem.classList.add('d-none');
    }, 4000);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    resetarErros();

    let valido = true;

    camposObrigatorios.forEach(campo => {
  if (!campo.value.trim() || (campo.tagName === 'SELECT' && campo.value === 'Escolha...')) {
    campo.classList.add('is-invalid'); // <-- ESSA linha aplica a borda vermelha
    valido = false;
  }
});

    if (valido) {
      form.reset();
      mostrarMensagemSucesso();
    }
  });

  camposObrigatorios.forEach(campo => {
    campo.addEventListener('input', () => {
      campo.classList.remove('is-invalid');
    });
  });
});

 // ------------------------------------------------
 // Função da barra de busca e filtros de receitas
 // ------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  const formBusca = document.getElementById('form-busca');
  const barra = document.getElementById('barra-pesquisa');
  const botoesFiltro = document.querySelectorAll(".filtro-btn");
  const cards = document.querySelectorAll(".card-receita");
  let filtroAtivo = "todas";

  // Redireciona da home para receitas.html com o termo
  if (formBusca && barra) {
    formBusca.addEventListener('submit', function (e) {
      e.preventDefault();
      const termo = barra.value.trim();
      if (termo !== '') {
        window.location.href = `receitas.html?busca=${encodeURIComponent(termo)}`;
      }
    });
  }

  // Filtragem combinada (categoria + texto)
  function aplicarFiltros() {
  const termo = barra ? barra.value.toLowerCase() : "";
  let visiveis = 0;

  cards.forEach(card => {
    const categoria = card.getAttribute("data-categoria");
    const texto = card.textContent.toLowerCase();
    const correspondeCategoria = filtroAtivo === "todas" || categoria === filtroAtivo;
    const correspondeBusca = texto.includes(termo);

    const mostrar = correspondeCategoria && correspondeBusca;
    card.style.display = mostrar ? "block" : "none";
    if (mostrar) visiveis++;
  });

  // Mostrar ou ocultar a mensagem
  const msg = document.getElementById('mensagem-nenhuma');
  if (msg) {
    msg.classList.toggle('d-none', visiveis > 0);
  }
}

  // Só ativa filtros se tiver cards
  if (cards.length > 0 && barra) {
    barra.addEventListener("input", aplicarFiltros);

    // Lê o termo da URL se vier com ?busca=...
    const params = new URLSearchParams(window.location.search);
    const termoURL = params.get('busca');
    if (termoURL) {
      barra.value = termoURL;
      aplicarFiltros(); // Aciona diretamente (evita falhas com eventos)
    }

    botoesFiltro.forEach(btn => {
      btn.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        filtroAtivo = btn.getAttribute("data-filtro");
        aplicarFiltros();
      });
    });
  }
});

// -----------------------------------
// Curtidas
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const botoesLike = document.querySelectorAll('.like-btn');

  botoesLike.forEach(btn => {
    btn.addEventListener('click', function () {
      const icone = this.querySelector('i');
      let likes = parseInt(this.dataset.likes);

      if (icone.classList.contains('bi-heart')) {
        icone.classList.replace('bi-heart', 'bi-heart-fill');
        icone.classList.add('text-danger');
        likes++;
      } else {
        icone.classList.replace('bi-heart-fill', 'bi-heart');
        icone.classList.remove('text-danger');
        likes--;
      }

      // Atualiza apenas o número depois do ícone
      this.dataset.likes = likes;
      const textoNode = document.createTextNode(` ${likes}`);
      this.innerHTML = '';
      this.appendChild(icone);
      this.appendChild(textoNode);

      this.classList.add('pulse');
      setTimeout(() => this.classList.remove('pulse'), 200);
    });
  });
});

// -----------------------------------
// Adiciona comentários
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-comentario');
  const nomeInput = document.getElementById('nome-comentario');
  const msgInput = document.getElementById('mensagem-comentario');
  const lista = document.getElementById('comentarios-lista');
  const chave = window.location.pathname; // Um identificador único por receita

  function renderizarComentarios() {
    const armazenados = JSON.parse(localStorage.getItem('comentarios_' + chave)) || [];
    lista.innerHTML = '';
    armazenados.forEach(({ nome, texto }, index) => {
  const div = document.createElement('div');
  div.className = 'border rounded p-3 mb-3';
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div><strong>${nome}:</strong> ${texto}</div>
      <button class="btn-close btn-sm apagar-comentario" data-index="${index}" title="Excluir"></button>
    </div>
  `;
  lista.appendChild(div);
});
  }

  lista.addEventListener('click', function (e) {
  if (e.target.classList.contains('apagar-comentario')) {
    const index = parseInt(e.target.dataset.index);
    const chave = window.location.pathname;
    const comentarios = JSON.parse(localStorage.getItem('comentarios_' + chave)) || [];

    comentarios.splice(index, 1); // remove o comentário pelo índice
    localStorage.setItem('comentarios_' + chave, JSON.stringify(comentarios));
    renderizarComentarios(); // atualiza visualmente
  }
});

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const texto = msgInput.value.trim();

    if (!nome || !texto) return;

    const novos = JSON.parse(localStorage.getItem('comentarios_' + chave)) || [];
    novos.push({ nome, texto });
    localStorage.setItem('comentarios_' + chave, JSON.stringify(novos));

    nomeInput.value = '';
    msgInput.value = '';
    renderizarComentarios();
  });

  renderizarComentarios();
});